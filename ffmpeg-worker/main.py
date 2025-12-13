"""FFmpeg Worker for NuuMee.

Handles post-processing jobs that require FFmpeg:
- Subtitle generation (STT + ASS burn)
- Watermark overlay
"""
import os
import logging
import tempfile
from datetime import datetime, timezone
from typing import Optional

from flask import Flask, request, jsonify
from google.cloud import firestore, storage
from google.auth import default as auth_default
from google.auth import impersonated_credentials
import httpx

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
OUTPUT_BUCKET = os.environ.get("OUTPUT_BUCKET", "nuumee-outputs")
ASSETS_BUCKET = os.environ.get("ASSETS_BUCKET", "nuumee-assets")

# Lazy-initialized clients
_db: Optional[firestore.Client] = None
_storage_client: Optional[storage.Client] = None
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
        import requests
        response = requests.get(
            "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
            headers={"Metadata-Flavor": "Google"},
            timeout=2
        )
        if response.status_code == 200:
            _service_account_email = response.text
            return _service_account_email
    except Exception:
        pass

    # Fallback
    _service_account_email = "nuumee-ffmpeg-worker@wanapi-prod.iam.gserviceaccount.com"
    return _service_account_email


def _get_signing_credentials():
    """Get impersonated credentials for signing GCS URLs."""
    global _signing_credentials

    if _signing_credentials is not None:
        return _signing_credentials

    source_credentials, project = auth_default()
    sa_email = _get_service_account_email()

    _signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=sa_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,
    )

    return _signing_credentials


def generate_signed_url(bucket_name: str, blob_path: str, expiration: int = 3600) -> str:
    """Generate a signed URL for GCS object."""
    from datetime import timedelta

    signing_creds = _get_signing_credentials()
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
        credentials=signing_creds,
    )
    return url


def download_from_gcs(bucket_name: str, blob_path: str, local_path: str) -> None:
    """Download file from GCS to local path."""
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.download_to_filename(local_path)
    logger.info(f"Downloaded gs://{bucket_name}/{blob_path} to {local_path}")


def upload_to_gcs(local_path: str, bucket_name: str, blob_path: str, content_type: str = "video/mp4") -> str:
    """Upload local file to GCS."""
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.upload_from_filename(local_path, content_type=content_type)
    logger.info(f"Uploaded {local_path} to gs://{bucket_name}/{blob_path}")
    return f"gs://{bucket_name}/{blob_path}"


def update_job_status(
    job_id: str,
    status: str,
    output_video_path: str = None,
    error_message: str = None
):
    """Update job document in Firestore."""
    db = get_firestore()
    job_ref = db.collection("jobs").document(job_id)

    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc),
    }

    if output_video_path:
        update_data["output_video_path"] = output_video_path
        update_data["completed_at"] = datetime.now(timezone.utc)

    if error_message:
        update_data["error_message"] = error_message

    job_ref.update(update_data)
    logger.info(f"Updated job {job_id}: status={status}")


def refund_credits(user_id: str, credits: float, job_id: str):
    """Refund credits to user on job failure."""
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


def process_subtitles_job(job_data: dict) -> str:
    """Process a subtitle generation job.

    Steps:
    1. Download source video from GCS
    2. Extract audio (FFmpeg)
    3. Transcribe audio (Google STT)
    4. Generate ASS subtitle file
    5. Burn subtitles onto video (FFmpeg)
    6. Upload result to GCS

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    import subprocess
    from stt import transcribe_audio_sync, transcribe_audio_async
    from subtitles import generate_ass
    from stt_correction import correct_stt_with_script

    job_id = job_data["id"]
    input_video_path = job_data.get("input_video_path")
    options = job_data.get("options", {})
    subtitle_style = options.get("subtitle_style", "simple")
    script_content = options.get("script_content")  # Optional original script

    if not input_video_path:
        raise ValueError("No input_video_path provided")

    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Download source video
        local_video = os.path.join(tmpdir, "input.mp4")
        download_from_gcs(OUTPUT_BUCKET, input_video_path, local_video)

        # Step 2: Extract audio
        local_audio = os.path.join(tmpdir, "audio.wav")
        extract_cmd = [
            "ffmpeg", "-i", local_video,
            "-vn", "-acodec", "pcm_s16le",
            "-ar", "16000", "-ac", "1",
            local_audio, "-y"
        ]
        logger.info(f"Extracting audio: {' '.join(extract_cmd)}")
        result = subprocess.run(extract_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Audio extraction failed: {result.stderr}")

        # Check audio duration to decide sync vs async
        probe_cmd = [
            "ffprobe", "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            local_audio
        ]
        duration_result = subprocess.run(probe_cmd, capture_output=True, text=True)
        audio_duration = float(duration_result.stdout.strip()) if duration_result.stdout.strip() else 0
        logger.info(f"Audio duration: {audio_duration}s")

        # Step 3: Transcribe audio
        if audio_duration < 60:
            # Use sync API for short audio
            words = transcribe_audio_sync(local_audio)
        else:
            # Upload audio to GCS for async API
            audio_gcs_path = f"temp/{job_id}/audio.wav"
            upload_to_gcs(local_audio, OUTPUT_BUCKET, audio_gcs_path, content_type="audio/wav")
            audio_gcs_uri = f"gs://{OUTPUT_BUCKET}/{audio_gcs_path}"
            words = transcribe_audio_async(audio_gcs_uri)

        if not words:
            raise ValueError("No words transcribed from audio")

        logger.info(f"Transcribed {len(words)} words")

        # Step 3b: Apply script correction if provided
        if script_content:
            logger.info("Applying script-based STT correction")
            words = correct_stt_with_script(words, script_content)
            logger.info(f"After correction: {len(words)} words")

        # Step 4: Generate ASS subtitle file
        ass_content = generate_ass(words, style_id=subtitle_style)
        local_ass = os.path.join(tmpdir, "subtitles.ass")
        with open(local_ass, "w", encoding="utf-8") as f:
            f.write(ass_content)

        # Step 5: Burn subtitles onto video
        local_output = os.path.join(tmpdir, "output.mp4")
        burn_cmd = [
            "ffmpeg", "-i", local_video,
            "-vf", f"ass={local_ass}",
            "-c:v", "libx264", "-crf", "18",
            "-c:a", "copy",
            local_output, "-y"
        ]
        logger.info(f"Burning subtitles: {' '.join(burn_cmd)}")
        result = subprocess.run(burn_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Subtitle burning failed: {result.stderr}")

        # Step 6: Upload result to GCS
        output_gcs_path = f"processed/{job_id}/subtitled.mp4"
        upload_to_gcs(local_output, OUTPUT_BUCKET, output_gcs_path)

        return output_gcs_path


def process_watermark_job(job_data: dict) -> str:
    """Process a watermark overlay job.

    Steps:
    1. Download source video from GCS
    2. Download watermark image from GCS
    3. Overlay watermark (FFmpeg) - preserving original size and transparency
    4. Upload result to GCS

    Args:
        job_data: Job document data

    Returns:
        Output video GCS path
    """
    import subprocess

    job_id = job_data["id"]
    input_video_path = job_data.get("input_video_path")
    options = job_data.get("options", {})

    # Watermark configuration
    watermark_path = options.get("watermark_path", "assets/watermark.png")
    position = options.get("position", "bottom-right")  # bottom-right, bottom-left, top-right, top-left
    opacity = options.get("opacity", 0.7)
    margin_percent = options.get("margin_percent", 5)

    if not input_video_path:
        raise ValueError("No input_video_path provided")

    # Create temp directory for processing
    with tempfile.TemporaryDirectory() as tmpdir:
        # Step 1: Download source video
        local_video = os.path.join(tmpdir, "input.mp4")
        download_from_gcs(OUTPUT_BUCKET, input_video_path, local_video)

        # Step 2: Download watermark image
        local_watermark = os.path.join(tmpdir, "watermark.png")
        download_from_gcs(ASSETS_BUCKET, watermark_path, local_watermark)

        # Step 3: Build FFmpeg overlay filter
        # Calculate position based on margin percentage
        # W=video width, H=video height, w=overlay width, h=overlay height
        margin = f"(W*{margin_percent}/100)"
        positions = {
            "bottom-right": f"W-w-{margin}:H-h-{margin}",
            "bottom-left": f"{margin}:H-h-{margin}",
            "top-right": f"W-w-{margin}:{margin}",
            "top-left": f"{margin}:{margin}",
        }
        overlay_pos = positions.get(position, positions["bottom-right"])

        # Build filter that preserves original PNG transparency and applies additional opacity
        # 1. format=rgba ensures we work in RGBA colorspace (preserves PNG alpha)
        # 2. geq filter multiplies the existing alpha channel by opacity factor
        #    This preserves transparent pixels while reducing overall opacity
        # 3. Overlay with format=auto preserves the alpha blending
        filter_complex = (
            f"[1:v]format=rgba,"
            f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='{opacity}*alpha(X,Y)'"
            f"[watermark];"
            f"[0:v][watermark]overlay={overlay_pos}:format=auto,format=yuv420p"
        )

        # Step 4: Apply watermark
        local_output = os.path.join(tmpdir, "output.mp4")
        overlay_cmd = [
            "ffmpeg",
            "-i", local_video,
            "-i", local_watermark,
            "-filter_complex", filter_complex,
            "-c:v", "libx264", "-crf", "18",
            "-c:a", "copy",
            local_output, "-y"
        ]
        logger.info(f"Applying watermark with opacity={opacity}, position={position}")
        result = subprocess.run(overlay_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"Watermark overlay failed: {result.stderr}")

        # Step 5: Upload result to GCS
        output_gcs_path = f"processed/{job_id}/watermarked.mp4"
        upload_to_gcs(local_output, OUTPUT_BUCKET, output_gcs_path)

        return output_gcs_path


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
    job_type = job_data.get("job_type", "")
    user_id = job_data["user_id"]
    credits_charged = job_data.get("credits_charged", 0)

    logger.info(f"Processing job {job_id}: type={job_type}")

    JOB_HANDLERS = {
        "subtitles": process_subtitles_job,
        "watermark": process_watermark_job,
    }

    try:
        update_job_status(job_id, "processing")

        handler = JOB_HANDLERS.get(job_type)
        if not handler:
            raise ValueError(f"Unsupported job type for FFmpeg worker: {job_type}")

        output_path = handler(job_data)
        update_job_status(job_id, "completed", output_video_path=output_path)
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        logger.exception(f"Error processing job {job_id}: {e}")
        update_job_status(job_id, "failed", error_message=str(e))
        if credits_charged > 0:
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
    return jsonify({"status": "healthy", "service": "nuumee-ffmpeg-worker"}), 200


@app.route("/ffmpeg-check", methods=["GET"])
def ffmpeg_check():
    """Check FFmpeg capabilities."""
    import subprocess

    checks = {}

    # Check FFmpeg version
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        version_line = result.stdout.split('\n')[0] if result.stdout else "unknown"
        checks["ffmpeg_version"] = version_line
        checks["ffmpeg_available"] = True
    except Exception as e:
        checks["ffmpeg_available"] = False
        checks["ffmpeg_error"] = str(e)

    # Check for libass (subtitle filter)
    try:
        result = subprocess.run(
            ["ffmpeg", "-filters"],
            capture_output=True,
            text=True,
            timeout=10
        )
        checks["libass_available"] = "ass" in result.stdout or "subtitles" in result.stdout
    except Exception as e:
        checks["libass_available"] = False
        checks["libass_error"] = str(e)

    # Check for fonts
    try:
        result = subprocess.run(
            ["fc-list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        font_count = len(result.stdout.strip().split('\n')) if result.stdout else 0
        checks["fonts_available"] = font_count
    except Exception as e:
        checks["fonts_available"] = 0
        checks["fonts_error"] = str(e)

    return jsonify(checks), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
