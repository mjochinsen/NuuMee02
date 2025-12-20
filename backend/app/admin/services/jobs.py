"""Job management service for admin panel."""
import logging
import os
import tempfile
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from google.cloud import firestore, secretmanager
import httpx

from ..schemas import (
    AdminJobSummary,
    AdminJobDetail,
    JobRetryResponse,
    WebhookReplayResponse,
    JobStatus,
)

logger = logging.getLogger(__name__)

# Firestore client (lazy initialization)
_db = None


def get_db():
    """Get Firestore client."""
    global _db
    if _db is None:
        _db = firestore.Client()
    return _db


async def list_jobs(
    page: int = 1,
    per_page: int = 25,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """List jobs with pagination and filters."""
    db = get_db()
    jobs_ref = db.collection("jobs")

    # Build query
    query = jobs_ref.order_by("created_at", direction=firestore.Query.DESCENDING)

    if status:
        query = jobs_ref.where("status", "==", status).order_by(
            "created_at", direction=firestore.Query.DESCENDING
        )

    if user_id:
        query = query.where("user_id", "==", user_id)

    # Get all matching documents
    all_docs = list(query.stream())
    total = len(all_docs)
    pages = (total + per_page - 1) // per_page

    # Paginate
    start = (page - 1) * per_page
    end = start + per_page
    paginated_docs = all_docs[start:end]

    # Get user emails for display
    user_emails = {}
    user_ids = set(doc.to_dict().get("user_id") for doc in paginated_docs if doc.to_dict().get("user_id"))
    for uid in user_ids:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            user_emails[uid] = user_doc.to_dict().get("email", "Unknown")

    # Convert to response
    items = []
    for doc in paginated_docs:
        try:
            data = doc.to_dict()
            uid = data.get("user_id", "")

            # Defensive status handling
            status_raw = data.get("status", "pending")
            try:
                status = JobStatus(status_raw)
            except ValueError:
                logger.warning(f"Unknown job status for {doc.id}: {status_raw}, defaulting to pending")
                status = JobStatus.PENDING

            # Defensive int conversion (Firestore may store as float)
            # Note: jobs store "credits_charged", but admin displays as "credits_used"
            credits_raw = data.get("credits_charged", 0)
            credits_used = int(credits_raw) if credits_raw is not None else 0

            # Handle created_at timestamp
            created_at = data.get("created_at")
            if created_at is None:
                created_at = datetime.now(timezone.utc)

            items.append(AdminJobSummary(
                id=doc.id,
                user_id=uid,
                user_email=user_emails.get(uid),
                type=data.get("type"),
                status=status,
                credits_used=credits_used,
                created_at=created_at,
                completed_at=data.get("completed_at"),
                error_message=data.get("error_message"),
            ))
        except Exception as e:
            logger.warning(f"Skipping job {doc.id} due to validation error: {e}")

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "per_page": per_page,
    }


async def get_job_detail(job_id: str) -> Optional[AdminJobDetail]:
    """Get full job details including error information."""
    db = get_db()

    # Check both jobs and ffmpeg_jobs collections
    job_doc = db.collection("jobs").document(job_id).get()
    if not job_doc.exists:
        job_doc = db.collection("ffmpeg_jobs").document(job_id).get()
        if not job_doc.exists:
            return None

    data = job_doc.to_dict()
    uid = data.get("user_id", "")

    # Get user email
    user_email = None
    if uid:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            user_email = user_doc.to_dict().get("email")

    # Defensive status handling
    status_raw = data.get("status", "pending")
    try:
        status = JobStatus(status_raw)
    except ValueError:
        logger.warning(f"Unknown job status for {job_doc.id}: {status_raw}, defaulting to pending")
        status = JobStatus.PENDING

    # Defensive int conversion (Firestore may store as float)
    # Note: jobs store "credits_charged", but admin displays as "credits_used"
    credits_raw = data.get("credits_charged", 0)
    credits_used = int(credits_raw) if credits_raw is not None else 0

    # Handle created_at timestamp
    created_at = data.get("created_at")
    if created_at is None:
        created_at = datetime.now(timezone.utc)

    return AdminJobDetail(
        id=job_doc.id,
        user_id=uid,
        user_email=user_email,
        type=data.get("type"),
        status=status,
        credits_used=credits_used,
        created_at=created_at,
        completed_at=data.get("completed_at"),
        error_message=data.get("error_message"),
        input_path=data.get("input_path") or data.get("video_path"),
        output_path=data.get("output_path") or data.get("result_url"),
        error_details=data.get("error_details") or data.get("error_message"),
        metadata={
            k: v for k, v in data.items()
            if k not in ["user_id", "status", "created_at", "completed_at", "error_message", "error_details", "wavespeed_request_id"]
        },
        wavespeed_request_id=data.get("wavespeed_request_id"),
    )


async def retry_job(job_id: str, note: Optional[str] = None) -> JobRetryResponse:
    """Retry a failed job by resetting to pending."""
    db = get_db()

    # Find the job
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        # Check ffmpeg_jobs
        job_ref = db.collection("ffmpeg_jobs").document(job_id)
        job_doc = job_ref.get()
        if not job_doc.exists:
            raise ValueError("Job not found")

    data = job_doc.to_dict()
    current_status = data.get("status")

    if current_status != "failed":
        raise ValueError(f"Cannot retry job with status '{current_status}'. Only failed jobs can be retried.")

    # Reset job to pending
    update_data = {
        "status": "pending",
        "error_message": None,
        "error_details": None,
        "retry_count": (data.get("retry_count", 0) + 1),
        "retry_note": note,
        "retried_at": datetime.now(timezone.utc),
    }
    job_ref.update(update_data)

    # TODO: Enqueue job to Cloud Tasks for processing
    # This will be implemented when we integrate with the task queue

    logger.info(f"Admin retried job {job_id}. Note: {note}")

    return JobRetryResponse(
        success=True,
        job_id=job_id,
        new_status="pending",
    )


# WaveSpeed API configuration
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "wanapi-prod")
WAVESPEED_API_URL = "https://api.wavespeed.ai/api/v2"
OUTPUT_BUCKET = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")
ASSETS_BUCKET = os.getenv("ASSETS_BUCKET", "nuumee-assets")

# Cache for WaveSpeed API key
_wavespeed_api_key: Optional[str] = None


def _get_wavespeed_api_key() -> str:
    """Get WaveSpeed API key from Secret Manager."""
    global _wavespeed_api_key
    if _wavespeed_api_key:
        return _wavespeed_api_key

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{PROJECT_ID}/secrets/wavespeed-api-key/versions/latest"
    response = client.access_secret_version(request={"name": name})
    _wavespeed_api_key = response.payload.data.decode("UTF-8").strip()
    return _wavespeed_api_key


def _get_wavespeed_result(request_id: str) -> dict:
    """Check WaveSpeed API for job status."""
    api_key = _get_wavespeed_api_key()

    with httpx.Client(timeout=30) as client:
        response = client.get(
            f"{WAVESPEED_API_URL}/predictions/{request_id}/result",
            headers={"Authorization": f"Bearer {api_key}"}
        )

        if response.status_code == 404:
            return {"status": "not_found"}

        response.raise_for_status()
        return response.json()


async def replay_webhook(job_id: str) -> WebhookReplayResponse:
    """Manually replay webhook processing for a stuck job.

    This is similar to what the watchdog does, but triggered manually by admin.
    It checks WaveSpeed for the actual status and processes accordingly.
    """
    db = get_db()

    # Find the job
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise ValueError("Job not found")

    data = job_doc.to_dict()
    current_status = data.get("status")
    user_id = data.get("user_id")
    credits_charged = data.get("credits_charged", 0)
    request_id = data.get("wavespeed_request_id")

    # Already completed or failed - nothing to do
    if current_status in ("completed", "failed"):
        return WebhookReplayResponse(
            success=True,
            job_id=job_id,
            action="already_complete",
            message=f"Job already has status '{current_status}'"
        )

    # No request_id means job never got submitted
    if not request_id:
        return WebhookReplayResponse(
            success=False,
            job_id=job_id,
            action="failed",
            message="Job has no wavespeed_request_id - cannot replay"
        )

    # Check WaveSpeed API for actual status
    logger.info(f"Admin replay webhook for job {job_id} (request_id={request_id})")

    try:
        wavespeed_result = _get_wavespeed_result(request_id)
    except Exception as e:
        logger.error(f"Failed to check WaveSpeed for job {job_id}: {e}")
        return WebhookReplayResponse(
            success=False,
            job_id=job_id,
            action="error",
            message=f"Failed to check WaveSpeed: {e}"
        )

    status = wavespeed_result.get("status") or wavespeed_result.get("data", {}).get("status")
    outputs = wavespeed_result.get("outputs") or wavespeed_result.get("data", {}).get("outputs") or []
    error = wavespeed_result.get("error") or wavespeed_result.get("message")

    logger.info(f"Admin replay: job {job_id} WaveSpeed status={status}")

    if status in ("completed", "success"):
        if not outputs:
            job_ref.update({
                "status": "failed",
                "error_message": "WaveSpeed completed but no outputs",
                "updated_at": firestore.SERVER_TIMESTAMP,
            })
            _refund_credits(db, user_id, credits_charged, job_id)
            return WebhookReplayResponse(
                success=True,
                job_id=job_id,
                action="failed",
                message="WaveSpeed completed but no outputs - job marked failed, credits refunded"
            )

        # Import completion utilities
        from ...internal.completion import (
            download_video_from_url, upload_to_gcs, apply_watermark,
            is_user_free_tier, OUTPUT_BUCKET
        )

        output_url = outputs[0]
        output_path = f"outputs/{user_id}/{job_id}.mp4"

        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                local_video = os.path.join(tmpdir, "video.mp4")
                download_video_from_url(output_url, local_video)

                final_video = local_video
                if is_user_free_tier(db, user_id):
                    logger.info(f"Admin replay: job {job_id} applying watermark")
                    watermarked = os.path.join(tmpdir, "watermarked.mp4")
                    apply_watermark(local_video, watermarked)
                    final_video = watermarked

                upload_to_gcs(final_video, OUTPUT_BUCKET, output_path)

            job_ref.update({
                "status": "completed",
                "output_video_path": output_path,
                "completed_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            })

            logger.info(f"Admin replay: job {job_id} recovered successfully")
            return WebhookReplayResponse(
                success=True,
                job_id=job_id,
                action="recovered",
                message="Job recovered from WaveSpeed and marked completed"
            )

        except Exception as e:
            logger.exception(f"Admin replay: error processing job {job_id}: {e}")
            return WebhookReplayResponse(
                success=False,
                job_id=job_id,
                action="error",
                message=f"Error processing completion: {e}"
            )

    elif status == "failed":
        error_msg = error or "WaveSpeed job failed"
        job_ref.update({
            "status": "failed",
            "error_message": error_msg,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        _refund_credits(db, user_id, credits_charged, job_id)
        return WebhookReplayResponse(
            success=True,
            job_id=job_id,
            action="failed",
            message=f"Job marked failed: {error_msg}"
        )

    elif status == "not_found":
        job_ref.update({
            "status": "failed",
            "error_message": "WaveSpeed request not found (may have expired)",
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        _refund_credits(db, user_id, credits_charged, job_id)
        return WebhookReplayResponse(
            success=True,
            job_id=job_id,
            action="failed",
            message="WaveSpeed request not found - job marked failed, credits refunded"
        )

    else:
        # Still processing
        return WebhookReplayResponse(
            success=True,
            job_id=job_id,
            action="still_processing",
            message=f"Job still processing in WaveSpeed (status: {status})"
        )


def _refund_credits(db, user_id: str, credits: float, job_id: str) -> None:
    """Refund credits to user on job failure."""
    if not credits or credits <= 0:
        return

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
    logger.info(f"[ADMIN] Refunded {credits} credits to user {user_id} for job {job_id}")
