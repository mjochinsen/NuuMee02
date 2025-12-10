"""Video processing worker for NuuMee.

This worker receives jobs from Cloud Tasks and processes them using WaveSpeed API.
It runs as a Cloud Run service that handles HTTP requests from Cloud Tasks.
"""
import os
import logging
import json
from datetime import datetime, timezone
from typing import Optional

from flask import Flask, request, jsonify
from google.cloud import firestore, storage, secretmanager
from google.auth import default as auth_default
from google.auth import impersonated_credentials
import httpx
import requests as http_requests

from wavespeed import WaveSpeedClient, WaveSpeedError, WaveSpeedAPIError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# GCP configuration
PROJECT_ID = os.environ.get("GCP_PROJECT", "wanapi-prod")
IMAGE_BUCKET = os.environ.get("IMAGE_BUCKET", "nuumee-images")
VIDEO_BUCKET = os.environ.get("VIDEO_BUCKET", "nuumee-videos")
OUTPUT_BUCKET = os.environ.get("OUTPUT_BUCKET", "nuumee-outputs")

# Firestore client (initialized lazily)
_db: Optional[firestore.Client] = None
_storage_client: Optional[storage.Client] = None
_wavespeed_client: Optional[WaveSpeedClient] = None
_signing_credentials = None
_service_account_email: Optional[str] = None


def get_firestore() -> firestore.Client:
    """Get Firestore client (lazy initialization)."""
    global _db
    if _db is None:
        _db = firestore.Client(project=PROJECT_ID)
    return _db


def get_storage() -> storage.Client:
    """Get Storage client (lazy initialization)."""
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=PROJECT_ID)
    return _storage_client


def get_wavespeed_api_key() -> str:
    """Get WaveSpeed API key from Secret Manager or environment."""
    # First try environment variable
    api_key = os.environ.get("WAVESPEED_API_KEY")
    if api_key:
        return api_key

    # Fall back to Secret Manager
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


def _get_service_account_email() -> str:
    """Get service account email from metadata server or environment."""
    global _service_account_email
    if _service_account_email is not None:
        return _service_account_email

    # Try environment variable first
    sa_email = os.environ.get("SERVICE_ACCOUNT_EMAIL")
    if sa_email:
        _service_account_email = sa_email
        return sa_email

    # Try metadata server (Cloud Run)
    try:
        response = http_requests.get(
            "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
            headers={"Metadata-Flavor": "Google"},
            timeout=2
        )
        if response.status_code == 200:
            _service_account_email = response.text
            return _service_account_email
    except Exception:
        pass

    # Fallback to default
    _service_account_email = "nuumee-worker@wanapi-prod.iam.gserviceaccount.com"
    return _service_account_email


def _get_signing_credentials():
    """Get impersonated credentials for signing GCS URLs."""
    global _signing_credentials

    if _signing_credentials is not None:
        return _signing_credentials

    # Get default credentials
    source_credentials, project = auth_default()

    # Get service account email
    sa_email = _get_service_account_email()

    # Create impersonated credentials with signing capability
    _signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=sa_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,
    )

    return _signing_credentials


def generate_signed_url(bucket_name: str, blob_path: str, expiration: int = 3600) -> str:
    """Generate a signed URL for GCS object.

    Uses IAM impersonation to get signing credentials on Cloud Run,
    since the default Compute Engine credentials cannot sign URLs.

    Args:
        bucket_name: GCS bucket name
        blob_path: Path within bucket
        expiration: URL expiration in seconds

    Returns:
        Signed URL
    """
    from datetime import timedelta

    # Get signing credentials
    signing_creds = _get_signing_credentials()

    # Get storage client and bucket/blob
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    # Generate signed URL with impersonated credentials
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
        credentials=signing_creds,
    )
    return url


def upload_from_url(source_url: str, bucket_name: str, blob_path: str) -> str:
    """Download file from URL and upload to GCS.

    Args:
        source_url: URL to download from
        bucket_name: Target GCS bucket
        blob_path: Target path in bucket

    Returns:
        GCS path (gs://bucket/path)
    """
    logger.info(f"Downloading from {source_url}")

    # Download file
    with httpx.Client(timeout=300) as client:
        response = client.get(source_url)
        response.raise_for_status()
        content = response.content

    logger.info(f"Downloaded {len(content)} bytes, uploading to gs://{bucket_name}/{blob_path}")

    # Upload to GCS
    storage_client = get_storage()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    # Detect content type
    content_type = response.headers.get("content-type", "video/mp4")
    blob.upload_from_string(content, content_type=content_type)

    return f"gs://{bucket_name}/{blob_path}"


def update_job_status(
    job_id: str,
    status: str,
    wavespeed_request_id: str = None,
    output_video_path: str = None,
    error_message: str = None
):
    """Update job document in Firestore.

    Args:
        job_id: Job document ID
        status: New status value
        wavespeed_request_id: WaveSpeed request ID (if available)
        output_video_path: Output video GCS path (if completed)
        error_message: Error message (if failed)
    """
    db = get_firestore()
    job_ref = db.collection("jobs").document(job_id)

    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc),
    }

    if wavespeed_request_id:
        update_data["wavespeed_request_id"] = wavespeed_request_id

    if output_video_path:
        update_data["output_video_path"] = output_video_path
        update_data["completed_at"] = datetime.now(timezone.utc)

    if error_message:
        update_data["error_message"] = error_message

    job_ref.update(update_data)
    logger.info(f"Updated job {job_id}: status={status}")


def refund_credits(user_id: str, credits: float, job_id: str):
    """Refund credits to user on job failure.

    Args:
        user_id: User document ID
        credits: Amount to refund
        job_id: Job ID for logging
    """
    db = get_firestore()
    user_ref = db.collection("users").document(user_id)

    @firestore.transactional
    def refund_transaction(transaction, user_ref, credits):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            logger.error(f"User {user_id} not found for refund")
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + credits

        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

    transaction = db.transaction()
    refund_transaction(transaction, user_ref, credits)
    logger.info(f"Refunded {credits} credits to user {user_id} for job {job_id}")


def process_animate_job(job_data: dict) -> str:
    """Process an animate (image-to-video) job.

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    job_id = job_data["id"]
    resolution = job_data.get("resolution", "480p")
    seed = job_data.get("seed", -1) or -1

    # Get signed URLs for input files
    image_path = job_data["reference_image_path"]
    video_path = job_data["motion_video_path"]

    image_url = generate_signed_url(IMAGE_BUCKET, image_path)
    video_url = generate_signed_url(VIDEO_BUCKET, video_path)

    logger.info(f"Processing animate job {job_id}: resolution={resolution}")

    # Start WaveSpeed job
    wavespeed = get_wavespeed()
    request_id = wavespeed.animate(
        image_url=image_url,
        video_url=video_url,
        resolution=resolution,
        seed=seed,
    )

    # Update job with WaveSpeed request ID
    update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Poll for completion
    result = wavespeed.poll_result(request_id)

    # Get output URL
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]

    # Download and upload to our bucket
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_extend_job(job_data: dict) -> str:
    """Process a video extend job.

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    job_id = job_data["id"]
    resolution = job_data.get("resolution", "480p")
    duration = job_data.get("duration", 5)
    seed = job_data.get("seed", -1) or -1
    # API stores as extension_prompt
    prompt = job_data.get("extension_prompt", "")

    # Get signed URL for input video (from a previous job's output)
    video_path = job_data["input_video_path"]
    # Input video comes from previous job output, which is in OUTPUT_BUCKET
    video_url = generate_signed_url(OUTPUT_BUCKET, video_path)

    logger.info(f"Processing extend job {job_id}: duration={duration}, resolution={resolution}")

    # Start WaveSpeed job
    wavespeed = get_wavespeed()
    request_id = wavespeed.extend(
        video_url=video_url,
        prompt=prompt,
        duration=duration,
        resolution=resolution,
        seed=seed,
    )

    # Update job with WaveSpeed request ID
    update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Poll for completion
    result = wavespeed.poll_result(request_id)

    # Get output URL
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]

    # Download and upload to our bucket
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_upscale_job(job_data: dict) -> str:
    """Process a video upscale job.

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    job_id = job_data["id"]
    target_resolution = job_data.get("target_resolution", "1080p")

    # Get signed URL for input video (from a previous job's output)
    video_path = job_data["input_video_path"]
    # Input video comes from previous job output, which is in OUTPUT_BUCKET
    video_url = generate_signed_url(OUTPUT_BUCKET, video_path)

    logger.info(f"Processing upscale job {job_id}: target={target_resolution}")

    # Start WaveSpeed job
    wavespeed = get_wavespeed()
    request_id = wavespeed.upscale(
        video_url=video_url,
        target_resolution=target_resolution,
    )

    # Update job with WaveSpeed request ID
    update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Poll for completion
    result = wavespeed.poll_result(request_id)

    # Get output URL
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]

    # Download and upload to our bucket
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_foley_job(job_data: dict) -> str:
    """Process a video foley (add audio) job.

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    job_id = job_data["id"]
    seed = job_data.get("seed", -1) or -1
    prompt = job_data.get("audio_prompt", "")

    # Get signed URL for input video (from a previous job's output)
    video_path = job_data["input_video_path"]
    # Input video comes from previous job output, which is in OUTPUT_BUCKET
    video_url = generate_signed_url(OUTPUT_BUCKET, video_path)

    logger.info(f"Processing foley job {job_id}")

    # Start WaveSpeed job
    wavespeed = get_wavespeed()
    request_id = wavespeed.foley(
        video_url=video_url,
        prompt=prompt if prompt else None,
        seed=seed,
    )

    # Update job with WaveSpeed request ID
    update_job_status(job_id, "processing", wavespeed_request_id=request_id)

    # Poll for completion
    result = wavespeed.poll_result(request_id)

    # Get output URL
    outputs = wavespeed.get_outputs(result)
    if not outputs:
        raise WaveSpeedAPIError("No output URL in result", response=result)

    output_url = outputs[0]

    # Download and upload to our bucket
    output_path = f"outputs/{job_data['user_id']}/{job_id}.mp4"
    upload_from_url(output_url, OUTPUT_BUCKET, output_path)

    return output_path


def process_job(job_id: str):
    """Process a single job.

    Args:
        job_id: Job document ID
    """
    db = get_firestore()
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        logger.error(f"Job {job_id} not found")
        return

    job_data = job_doc.to_dict()
    job_data["id"] = job_id  # Include ID in job data for processors
    job_type = job_data.get("job_type", "animate")
    user_id = job_data["user_id"]
    credits_charged = job_data.get("credits_charged", 0)

    logger.info(f"Processing job {job_id}: type={job_type}")

    # Job type handlers
    JOB_HANDLERS = {
        "animate": process_animate_job,
        "extend": process_extend_job,
        "upscale": process_upscale_job,
        "foley": process_foley_job,
    }

    try:
        # Update status to processing
        update_job_status(job_id, "processing")

        # Get handler for job type
        handler = JOB_HANDLERS.get(job_type)
        if not handler:
            raise ValueError(f"Unsupported job type: {job_type}")

        # Process job
        output_path = handler(job_data)

        # Update job as completed
        update_job_status(job_id, "completed", output_video_path=output_path)
        logger.info(f"Job {job_id} completed successfully")

    except WaveSpeedError as e:
        logger.error(f"WaveSpeed error for job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=str(e))
        # Refund credits on failure
        refund_credits(user_id, credits_charged, job_id)

    except Exception as e:
        logger.exception(f"Unexpected error for job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=f"Internal error: {str(e)}")
        # Refund credits on failure
        refund_credits(user_id, credits_charged, job_id)


@app.route("/", methods=["POST"])
def handle_task():
    """Handle incoming Cloud Tasks request.

    Expected payload:
    {
        "job_id": "job_abc123"
    }
    """
    try:
        # Parse request
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload"}), 400

        job_id = payload.get("job_id")
        if not job_id:
            return jsonify({"error": "Missing job_id"}), 400

        logger.info(f"Received task for job: {job_id}")

        # Process the job
        process_job(job_id)

        return jsonify({"status": "ok", "job_id": job_id}), 200

    except Exception as e:
        logger.exception(f"Error handling task: {e}")
        # Return 500 to trigger Cloud Tasks retry
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "nuumee-worker"}), 200


if __name__ == "__main__":
    # Run Flask development server
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
