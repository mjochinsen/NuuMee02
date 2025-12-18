"""Video processing worker for NuuMee.

This worker receives jobs from Cloud Tasks and processes them using WaveSpeed API.
It runs as a Cloud Run service that handles HTTP requests from Cloud Tasks.
"""
import os
import logging
import subprocess
import tempfile
from typing import Optional

from flask import Flask, request, jsonify
from google.cloud import firestore, secretmanager, tasks_v2
from google.protobuf import timestamp_pb2
from datetime import datetime, timedelta, timezone

from wavespeed import WaveSpeedClient, WaveSpeedError, WaveSpeedAPIError, JobStatus

# Import shared utilities (local copy in worker/shared/)
from shared.worker_utils import (
    get_firestore, get_storage,
    generate_signed_url, upload_from_url,
    update_job_status, refund_credits, is_user_free_tier,
    IMAGE_BUCKET, VIDEO_BUCKET, OUTPUT_BUCKET, ASSETS_BUCKET,
    PROJECT_ID,
)
from shared.worker_utils.stripe_utils import check_and_trigger_auto_refill

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# FFmpeg Worker Configuration for auto-watermarking free tier videos
FFMPEG_LOCATION = os.environ.get("FFMPEG_TASKS_LOCATION", "us-central1")
FFMPEG_QUEUE_NAME = os.environ.get("FFMPEG_TASKS_QUEUE", "nuumee-ffmpeg-jobs")
FFMPEG_WORKER_URL = os.environ.get(
    "FFMPEG_WORKER_URL",
    "https://nuumee-ffmpeg-worker-450296399943.us-central1.run.app"
)

# Webhook configuration
USE_WEBHOOK = os.environ.get("USE_WEBHOOK", "true").lower() == "true"
WEBHOOK_BASE_URL = os.environ.get("WEBHOOK_BASE_URL", "https://nuumee-api-450296399943.us-central1.run.app")

# Lazy-initialized clients
_wavespeed_client: Optional[WaveSpeedClient] = None
_tasks_client: Optional[tasks_v2.CloudTasksClient] = None
_webhook_url: Optional[str] = None


def get_webhook_url() -> Optional[str]:
    """Get webhook URL for WaveSpeed callbacks.

    Returns:
        Full webhook URL with token, or None if webhooks disabled/unavailable
    """
    global _webhook_url

    if not USE_WEBHOOK:
        logger.info("Webhooks disabled via USE_WEBHOOK=false")
        return None

    if _webhook_url:
        return _webhook_url

    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{PROJECT_ID}/secrets/wavespeed-webhook-token/versions/latest"
        response = client.access_secret_version(request={"name": name})
        token = response.payload.data.decode("UTF-8").strip()
        _webhook_url = f"{WEBHOOK_BASE_URL}/api/v1/webhooks/wavespeed?token={token}"
        logger.info("Webhook URL configured successfully")
        return _webhook_url
    except Exception as e:
        logger.warning(f"Could not get webhook token, falling back to polling: {e}")
        return None


def get_wavespeed_api_key() -> str:
    """Get WaveSpeed API key from Secret Manager or environment."""
    api_key = os.environ.get("WAVESPEED_API_KEY")
    if api_key:
        return api_key

    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{PROJECT_ID}/secrets/wavespeed-api-key/versions/latest"
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logger.error(f"Failed to get WaveSpeed API key: {e}")
        raise


def get_wavespeed() -> WaveSpeedClient:
    """Get WaveSpeed client (lazy initialization)."""
    global _wavespeed_client
    if _wavespeed_client is None:
        api_key = get_wavespeed_api_key()
        _wavespeed_client = WaveSpeedClient(api_key=api_key)
    return _wavespeed_client


def get_tasks_client() -> tasks_v2.CloudTasksClient:
    """Get Cloud Tasks client (lazy initialization)."""
    global _tasks_client
    if _tasks_client is None:
        _tasks_client = tasks_v2.CloudTasksClient()
    return _tasks_client


def check_existing_wavespeed_request(request_id: str, job_id: str) -> Optional[str]:
    """Check if an existing WaveSpeed request is still valid (not failed).

    Args:
        request_id: The WaveSpeed request ID to check
        job_id: Our job ID (for logging)

    Returns:
        The request_id if still valid (processing/completed/success), None if failed
    """
    wavespeed = get_wavespeed()
    try:
        result = wavespeed.get_result(request_id)
        status = result.get("status") or result.get("data", {}).get("status")
        logger.info(f"Job {job_id}: existing WaveSpeed request {request_id} has status={status}")

        if status == JobStatus.FAILED.value:
            logger.warning(f"Job {job_id}: WaveSpeed request {request_id} FAILED, will create new request")
            return None

        # Still valid - can resume (processing, completed, success, created)
        return request_id

    except WaveSpeedAPIError as e:
        # If we can't check status (e.g., request doesn't exist), create new
        logger.warning(f"Job {job_id}: Could not check WaveSpeed request {request_id}: {e}")
        return None


def apply_free_tier_watermark(job_id: str, output_video_path: str) -> str:
    """Apply NuuMee watermark inline for free tier users.

    Downloads the video from GCS, applies watermark via FFmpeg, and uploads
    the watermarked video back to GCS, replacing the original.

    Args:
        job_id: Job document ID
        output_video_path: GCS path to the completed video

    Returns:
        GCS path to the watermarked video (same as input path)
    """
    logger.info(f"Applying free tier watermark to {output_video_path}")

    watermark_gcs_path = "assets/nuumee-watermark.png"
    position = "bottom-right"
    opacity = 0.7
    margin_percent = 5

    storage_client = get_storage()

    with tempfile.TemporaryDirectory() as tmpdir:
        # Download the video from OUTPUT_BUCKET
        local_video = os.path.join(tmpdir, "input.mp4")
        bucket = storage_client.bucket(OUTPUT_BUCKET)
        blob = bucket.blob(output_video_path)
        blob.download_to_filename(local_video)
        logger.info(f"Downloaded video to {local_video}")

        # Download watermark from ASSETS_BUCKET
        local_watermark = os.path.join(tmpdir, "watermark.png")
        assets_bucket = storage_client.bucket(ASSETS_BUCKET)
        watermark_blob = assets_bucket.blob(watermark_gcs_path)
        watermark_blob.download_to_filename(local_watermark)
        logger.info(f"Downloaded watermark to {local_watermark}")

        # Build FFmpeg overlay filter
        margin = f"(W*{margin_percent}/100)"
        positions = {
            "bottom-right": f"W-w-{margin}:H-h-{margin}",
            "bottom-left": f"{margin}:H-h-{margin}",
            "top-right": f"W-w-{margin}:{margin}",
            "top-left": f"{margin}:{margin}",
        }
        overlay_pos = positions.get(position, positions["bottom-right"])

        filter_complex = (
            f"[1:v]format=rgba,"
            f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='{opacity}*alpha(X,Y)'"
            f"[watermark];"
            f"[0:v][watermark]overlay={overlay_pos}:format=auto,format=yuv420p"
        )

        # Apply watermark with FFmpeg
        local_output = os.path.join(tmpdir, "output.mp4")
        ffmpeg_cmd = [
            "ffmpeg",
            "-i", local_video,
            "-i", local_watermark,
            "-filter_complex", filter_complex,
            "-c:v", "libx264", "-crf", "18",
            "-c:a", "copy",
            local_output, "-y"
        ]
        logger.info(f"Running FFmpeg watermark: opacity={opacity}, position={position}")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Watermark FFmpeg failed: {result.stderr}")

        # Upload watermarked video back to same path
        blob.upload_from_filename(local_output, content_type="video/mp4")
        logger.info(f"Uploaded watermarked video to {output_video_path}")

    return output_video_path


def process_animate_job(job_data: dict) -> Optional[str]:
    """Process an animate (image-to-video) job.

    Returns:
        Output path if completed inline (polling mode), None if using webhook mode
    """
    job_id = job_data["id"]
    resolution = job_data.get("resolution", "480p")
    seed = job_data.get("seed", -1) or -1
    existing_request_id = job_data.get("wavespeed_request_id")

    wavespeed = get_wavespeed()
    webhook_url = get_webhook_url()

    # Idempotency: check if existing request is still valid (not failed)
    request_id = None
    if existing_request_id:
        request_id = check_existing_wavespeed_request(existing_request_id, job_id)
        if request_id:
            logger.info(f"Job {job_id}: resuming existing WaveSpeed request {request_id}")

    if not request_id:
        # No existing request - create a new one
        image_path = job_data["reference_image_path"]
        video_path = job_data["motion_video_path"]

        image_url = generate_signed_url(IMAGE_BUCKET, image_path, worker_type="worker")
        video_bucket = OUTPUT_BUCKET if video_path.startswith(("outputs/", "demo/")) else VIDEO_BUCKET
        video_url = generate_signed_url(video_bucket, video_path, worker_type="worker")

        logger.info(f"Processing animate job {job_id}: resolution={resolution}, webhook={'enabled' if webhook_url else 'disabled'}")

        request_id = wavespeed.animate(
            image_url=image_url,
            video_url=video_url,
            resolution=resolution,
            seed=seed,
            webhook_url=webhook_url,
        )

        update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Webhook mode: return immediately, completion via Pub/Sub processor
    if webhook_url:
        logger.info(f"Job {job_id}: submitted to WaveSpeed (request_id={request_id}), webhook will handle completion")
        return None

    # Fallback: polling mode (when webhooks disabled or unavailable)
    result = wavespeed.poll_result(request_id)
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_extend_job(job_data: dict) -> Optional[str]:
    """Process a video extend job.

    Returns:
        Output path if completed inline (polling mode), None if using webhook mode
    """
    job_id = job_data["id"]
    resolution = job_data.get("resolution", "480p")
    duration = job_data.get("duration", 5)
    seed = job_data.get("seed", -1) or -1
    prompt = job_data.get("extension_prompt", "")
    existing_request_id = job_data.get("wavespeed_request_id")

    wavespeed = get_wavespeed()
    webhook_url = get_webhook_url()

    # Idempotency: check if existing request is still valid (not failed)
    request_id = None
    if existing_request_id:
        request_id = check_existing_wavespeed_request(existing_request_id, job_id)
        if request_id:
            logger.info(f"Job {job_id}: resuming existing WaveSpeed request {request_id}")

    if not request_id:
        video_path = job_data["input_video_path"]
        video_url = generate_signed_url(OUTPUT_BUCKET, video_path, worker_type="worker")

        logger.info(f"Processing extend job {job_id}: duration={duration}, resolution={resolution}, webhook={'enabled' if webhook_url else 'disabled'}")

        request_id = wavespeed.extend(
            video_url=video_url,
            prompt=prompt,
            duration=duration,
            resolution=resolution,
            seed=seed,
            webhook_url=webhook_url,
        )

        update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Webhook mode: return immediately, completion via Pub/Sub processor
    if webhook_url:
        logger.info(f"Job {job_id}: submitted to WaveSpeed (request_id={request_id}), webhook will handle completion")
        return None

    # Fallback: polling mode (when webhooks disabled or unavailable)
    result = wavespeed.poll_result(request_id)
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_upscale_job(job_data: dict) -> Optional[str]:
    """Process a video upscale job.

    Returns:
        Output path if completed inline (polling mode), None if using webhook mode
    """
    job_id = job_data["id"]
    target_resolution = job_data.get("target_resolution", "1080p")
    existing_request_id = job_data.get("wavespeed_request_id")

    wavespeed = get_wavespeed()
    webhook_url = get_webhook_url()

    # Idempotency: check if existing request is still valid (not failed)
    request_id = None
    if existing_request_id:
        request_id = check_existing_wavespeed_request(existing_request_id, job_id)
        if request_id:
            logger.info(f"Job {job_id}: resuming existing WaveSpeed request {request_id}")

    if not request_id:
        video_path = job_data["input_video_path"]
        video_url = generate_signed_url(OUTPUT_BUCKET, video_path, worker_type="worker")

        logger.info(f"Processing upscale job {job_id}: target={target_resolution}, webhook={'enabled' if webhook_url else 'disabled'}")

        request_id = wavespeed.upscale(
            video_url=video_url,
            target_resolution=target_resolution,
            webhook_url=webhook_url,
        )

        update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Webhook mode: return immediately, completion via Pub/Sub processor
    if webhook_url:
        logger.info(f"Job {job_id}: submitted to WaveSpeed (request_id={request_id}), webhook will handle completion")
        return None

    # Fallback: polling mode (when webhooks disabled or unavailable)
    result = wavespeed.poll_result(request_id)
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_foley_job(job_data: dict) -> Optional[str]:
    """Process a video foley (add audio) job.

    Returns:
        Output path if completed inline (polling mode), None if using webhook mode
    """
    job_id = job_data["id"]
    seed = job_data.get("seed", -1) or -1
    prompt = job_data.get("audio_prompt", "")
    existing_request_id = job_data.get("wavespeed_request_id")

    wavespeed = get_wavespeed()
    webhook_url = get_webhook_url()

    # Idempotency: check if existing request is still valid (not failed)
    request_id = None
    if existing_request_id:
        request_id = check_existing_wavespeed_request(existing_request_id, job_id)
        if request_id:
            logger.info(f"Job {job_id}: resuming existing WaveSpeed request {request_id}")

    if not request_id:
        video_path = job_data["input_video_path"]
        video_url = generate_signed_url(OUTPUT_BUCKET, video_path, worker_type="worker")

        logger.info(f"Processing foley job {job_id}, webhook={'enabled' if webhook_url else 'disabled'}")

        request_id = wavespeed.foley(
            video_url=video_url,
            prompt=prompt if prompt else None,
            seed=seed,
            webhook_url=webhook_url,
        )

        update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Webhook mode: return immediately, completion via Pub/Sub processor
    if webhook_url:
        logger.info(f"Job {job_id}: submitted to WaveSpeed (request_id={request_id}), webhook will handle completion")
        return None

    # Fallback: polling mode (when webhooks disabled or unavailable)
    result = wavespeed.poll_result(request_id)
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_job(job_id: str):
    """Process a single job."""
    db = get_firestore()
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        logger.error(f"Job {job_id} not found")
        return

    job_data = job_doc.to_dict()
    job_data["id"] = job_id
    job_type = job_data.get("job_type", "animate")
    user_id = job_data["user_id"]
    credits_charged = job_data.get("credits_charged", 0)

    logger.info(f"Processing job {job_id}: type={job_type}")

    JOB_HANDLERS = {
        "animate": process_animate_job,
        "extend": process_extend_job,
        "upscale": process_upscale_job,
        "foley": process_foley_job,
    }

    try:
        update_job_status(job_id, "processing")

        handler = JOB_HANDLERS.get(job_type)
        if not handler:
            raise ValueError(f"Unsupported job type: {job_type}")

        output_path = handler(job_data)

        # Webhook mode: handler returned None, completion will happen via Pub/Sub
        if output_path is None:
            logger.info(f"Job {job_id}: webhook mode active, worker task complete (completion via Pub/Sub)")
            return

        # Polling mode: complete the job inline
        # Auto-apply NuuMee watermark inline for free tier users
        if is_user_free_tier(user_id):
            logger.info(f"User {user_id} is on free tier, applying watermark inline")
            update_job_status(job_id, "watermarking")
            output_path = apply_free_tier_watermark(job_id, output_path)

        update_job_status(job_id, "completed", output_video_path=output_path)
        logger.info(f"Job {job_id} completed successfully")

        # Check and trigger auto-refill if needed
        try:
            refill_result = check_and_trigger_auto_refill(user_id)
            if refill_result:
                logger.info(f"Auto-refill triggered for user {user_id}: +{refill_result['credits_added']} credits")
        except Exception as refill_error:
            logger.error(f"Auto-refill check failed for user {user_id}: {refill_error}")

    except WaveSpeedError as e:
        logger.error(f"WaveSpeed error for job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=str(e))
        refund_credits(user_id, credits_charged, job_id)

    except Exception as e:
        logger.exception(f"Unexpected error for job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=f"Internal error: {str(e)}")
        refund_credits(user_id, credits_charged, job_id)


@app.route("/", methods=["POST"])
def handle_task():
    """Handle incoming Cloud Tasks request."""
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload"}), 400

        job_id = payload.get("job_id")
        if not job_id:
            return jsonify({"error": "Missing job_id"}), 400

        logger.info(f"Received task for job: {job_id}")
        process_job(job_id)

        return jsonify({"status": "ok", "job_id": job_id}), 200

    except Exception as e:
        logger.exception(f"Error handling task: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "nuumee-worker"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
