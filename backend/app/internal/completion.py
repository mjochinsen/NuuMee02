"""Completion processor - handles WaveSpeed job completions via Pub/Sub."""
import base64
import json
import logging
import os
import subprocess
import tempfile
from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from google.cloud import storage, firestore
from google.auth import default
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import httpx

from ..auth.firebase import get_firestore_client

logger = logging.getLogger(__name__)

router = APIRouter()

# GCS bucket configuration
OUTPUT_BUCKET = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")
ASSETS_BUCKET = os.getenv("ASSETS_BUCKET", "nuumee-assets")
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

# Pub/Sub push subscription audience (for OIDC verification)
PUBSUB_AUDIENCE = os.getenv(
    "PUBSUB_AUDIENCE",
    "https://api.nuumee.ai/internal/process-completion"
)

# Cache storage client
_storage_client: Optional[storage.Client] = None


def get_storage_client() -> storage.Client:
    """Get cached storage client."""
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client()
    return _storage_client


def verify_pubsub_token(request: Request) -> bool:
    """Verify the Pub/Sub OIDC token from Authorization header.

    Returns True if valid, raises HTTPException if invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        logger.warning("Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = auth_header.split(" ", 1)[1]

    try:
        # Verify the token
        claim = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=PUBSUB_AUDIENCE
        )

        # Verify it's from Pub/Sub service account
        email = claim.get("email", "")
        if not email.endswith("gcp-sa-pubsub.iam.gserviceaccount.com"):
            logger.warning(f"Token not from Pub/Sub service account: {email}")
            raise HTTPException(status_code=403, detail="Invalid token issuer")

        return True

    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


def download_video_from_url(url: str, local_path: str) -> None:
    """Download video from URL to local file."""
    with httpx.Client(timeout=300) as client:
        with open(local_path, 'wb') as f:
            with client.stream('GET', url) as response:
                response.raise_for_status()
                for chunk in response.iter_bytes(chunk_size=8192):
                    f.write(chunk)


def upload_to_gcs(local_path: str, bucket_name: str, blob_path: str) -> str:
    """Upload local file to GCS and return the path."""
    client = get_storage_client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.upload_from_filename(local_path, content_type="video/mp4")
    return blob_path


def apply_watermark(input_path: str, output_path: str) -> None:
    """Apply NuuMee watermark to video using FFmpeg."""
    # Download watermark from GCS
    client = get_storage_client()
    assets_bucket = client.bucket(ASSETS_BUCKET)
    watermark_blob = assets_bucket.blob("assets/nuumee-watermark.png")

    watermark_path = os.path.join(os.path.dirname(input_path), "watermark.png")
    watermark_blob.download_to_filename(watermark_path)

    # Build FFmpeg overlay filter
    opacity = 0.7
    margin_percent = 5
    margin = f"(W*{margin_percent}/100)"
    overlay_pos = f"W-w-{margin}:H-h-{margin}"  # bottom-right

    filter_complex = (
        f"[1:v]format=rgba,"
        f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='{opacity}*alpha(X,Y)'"
        f"[watermark];"
        f"[0:v][watermark]overlay={overlay_pos}:format=auto,format=yuv420p"
    )

    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_path,
        "-i", watermark_path,
        "-filter_complex", filter_complex,
        "-c:v", "libx264", "-crf", "18",
        "-c:a", "copy",
        output_path, "-y"
    ]

    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg watermark failed: {result.stderr}")


def is_user_free_tier(db, user_id: str) -> bool:
    """Check if user is on free tier."""
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return True  # Assume free tier if user not found

    user_data = user_doc.to_dict()
    tier = user_data.get("subscription_tier", "free")
    return tier == "free" or not tier


def refund_credits(db, user_id: str, credits: float, job_id: str) -> None:
    """Refund credits to user on job failure."""
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


@router.post("/process-completion")
async def process_completion(request: Request):
    """
    Process WaveSpeed job completion from Pub/Sub.

    This endpoint receives push messages from Pub/Sub containing
    WaveSpeed callback data. It:
    1. Verifies the Pub/Sub OIDC token
    2. Parses the message (base64 encoded)
    3. Finds the job by wavespeed_request_id
    4. Downloads video and uploads to GCS
    5. Applies watermark for free tier users
    6. Updates job status or refunds credits on failure
    """
    # Verify Pub/Sub OIDC token
    verify_pubsub_token(request)

    # Parse Pub/Sub message
    try:
        envelope = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse Pub/Sub envelope: {e}")
        raise HTTPException(status_code=400, detail="Invalid envelope")

    message = envelope.get("message", {})
    if not message:
        logger.error("No message in envelope")
        raise HTTPException(status_code=400, detail="No message")

    # Decode base64 message data
    try:
        data_b64 = message.get("data", "")
        data_json = base64.b64decode(data_b64).decode("utf-8")
        payload = json.loads(data_json)
    except Exception as e:
        logger.error(f"Failed to decode message data: {e}")
        raise HTTPException(status_code=400, detail="Invalid message data")

    # Extract WaveSpeed result fields
    request_id = payload.get("id") or payload.get("data", {}).get("id")
    status = payload.get("status") or payload.get("data", {}).get("status")
    outputs = payload.get("outputs") or payload.get("data", {}).get("outputs") or []
    error = payload.get("error") or payload.get("message")

    if not request_id:
        logger.error(f"No request_id in payload: {payload}")
        raise HTTPException(status_code=400, detail="Missing request_id")

    logger.info(f"[COMPLETION] Processing: request_id={request_id}, status={status}")

    # Find job by wavespeed_request_id
    db = get_firestore_client()
    jobs = list(db.collection("jobs")
        .where("wavespeed_request_id", "==", request_id)
        .limit(1)
        .get())

    if not jobs:
        logger.warning(f"Job not found for wavespeed_request_id={request_id}")
        # Return 200 to prevent Pub/Sub retry - job may have been deleted or never existed
        # This could happen if webhook arrives before request_id is saved (race condition)
        # In that case, Pub/Sub will retry and we'll find it next time
        return {"status": "not_found", "request_id": request_id}

    job_doc = jobs[0]
    job_data = job_doc.to_dict()
    job_id = job_doc.id
    user_id = job_data.get("user_id")
    credits_charged = job_data.get("credits_charged", 0)
    current_status = job_data.get("status")

    # Idempotency check - skip if already completed or failed
    if current_status in ("completed", "failed"):
        logger.info(f"Job {job_id} already {current_status}, skipping")
        return {"status": "already_processed", "job_id": job_id}

    # Handle based on WaveSpeed status
    if status in ("completed", "success"):
        if not outputs:
            logger.error(f"Job {job_id}: No outputs in completed result")
            job_doc.reference.update({
                "status": "failed",
                "error_message": "No video output from WaveSpeed",
                "updated_at": firestore.SERVER_TIMESTAMP,
            })
            refund_credits(db, user_id, credits_charged, job_id)
            return {"status": "failed", "job_id": job_id, "reason": "no_outputs"}

        output_url = outputs[0]
        output_path = f"outputs/{user_id}/{job_id}.mp4"

        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                # Download video from WaveSpeed
                local_video = os.path.join(tmpdir, "video.mp4")
                logger.info(f"Job {job_id}: Downloading video from {output_url[:50]}...")
                download_video_from_url(output_url, local_video)

                # Apply watermark for free tier users
                final_video = local_video
                if is_user_free_tier(db, user_id):
                    logger.info(f"Job {job_id}: Applying free tier watermark")
                    job_doc.reference.update({
                        "status": "watermarking",
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    })
                    watermarked = os.path.join(tmpdir, "watermarked.mp4")
                    apply_watermark(local_video, watermarked)
                    final_video = watermarked

                # Upload to GCS
                logger.info(f"Job {job_id}: Uploading to GCS {output_path}")
                upload_to_gcs(final_video, OUTPUT_BUCKET, output_path)

            # Mark job completed
            job_doc.reference.update({
                "status": "completed",
                "output_video_path": output_path,
                "completed_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            })
            logger.info(f"Job {job_id} completed successfully")
            return {"status": "completed", "job_id": job_id}

        except Exception as e:
            logger.exception(f"Job {job_id}: Error processing completion: {e}")
            # Don't mark as failed - let Pub/Sub retry
            raise HTTPException(status_code=500, detail=f"Processing error: {e}")

    elif status == "failed":
        error_msg = error or "WaveSpeed job failed"
        logger.warning(f"Job {job_id} failed: {error_msg}")

        job_doc.reference.update({
            "status": "failed",
            "error_message": error_msg,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        refund_credits(db, user_id, credits_charged, job_id)
        return {"status": "failed", "job_id": job_id, "reason": error_msg}

    else:
        # Unknown status - log and skip
        logger.warning(f"Job {job_id}: Unknown status '{status}', ignoring")
        return {"status": "ignored", "job_id": job_id, "wavespeed_status": status}
