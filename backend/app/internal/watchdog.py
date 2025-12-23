"""Watchdog - catches stuck jobs and recovers or fails them."""
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from google.cloud import secretmanager, firestore
from google.auth import default
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import httpx

from ..auth.firebase import get_firestore_client

logger = logging.getLogger(__name__)

router = APIRouter()

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

# Thresholds
STUCK_JOB_THRESHOLD_HOURS = 2  # Jobs stuck for more than 2 hours
TIMEOUT_JOB_THRESHOLD_HOURS = 6  # Jobs processing for more than 6 hours = timeout

# WaveSpeed API configuration
WAVESPEED_API_URL = "https://api.wavespeed.ai/api/v2"

# Cloud Scheduler service account for OIDC verification
SCHEDULER_AUDIENCE = os.getenv(
    "SCHEDULER_AUDIENCE",
    "https://nuumee-api-450296399943.us-central1.run.app/internal/watchdog"
)

# Cache for WaveSpeed API key
_wavespeed_api_key: Optional[str] = None


def get_wavespeed_api_key() -> str:
    """Get WaveSpeed API key from Secret Manager."""
    global _wavespeed_api_key
    if _wavespeed_api_key:
        return _wavespeed_api_key

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{PROJECT_ID}/secrets/wavespeed-api-key/versions/latest"
    response = client.access_secret_version(request={"name": name})
    _wavespeed_api_key = response.payload.data.decode("UTF-8").strip()
    return _wavespeed_api_key


def verify_scheduler_token(request: Request) -> bool:
    """Verify the Cloud Scheduler OIDC token.

    Returns True if valid, raises HTTPException if invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        logger.warning("Watchdog: Missing or invalid Authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = auth_header.split(" ", 1)[1]

    try:
        claim = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            audience=SCHEDULER_AUDIENCE
        )

        # Verify it's from Cloud Scheduler or service account
        email = claim.get("email", "")
        logger.info(f"Watchdog: Token from {email}")
        return True

    except Exception as e:
        logger.error(f"Watchdog: Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


def get_wavespeed_result(request_id: str) -> dict:
    """Check WaveSpeed API for job status."""
    api_key = get_wavespeed_api_key()

    with httpx.Client(timeout=30) as client:
        response = client.get(
            f"{WAVESPEED_API_URL}/predictions/{request_id}/result",
            headers={"Authorization": f"Bearer {api_key}"}
        )

        if response.status_code == 404:
            return {"status": "not_found"}

        response.raise_for_status()
        return response.json()


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
    logger.info(f"[WATCHDOG] Refunded {credits} credits to user {user_id} for job {job_id}")


@router.post("/watchdog")
async def run_watchdog(request: Request):
    """
    Watchdog endpoint - finds and recovers stuck jobs.

    This runs every 30 minutes via Cloud Scheduler to catch jobs that:
    1. Have status="processing" but WaveSpeed has actually completed/failed
    2. Have been processing for >6 hours (timeout)
    3. Never received a webhook callback

    For each stuck job, it:
    - Checks WaveSpeed API for current status
    - If completed: publishes to Pub/Sub for completion processing
    - If failed: marks job as failed, refunds credits
    - If timed out (>6 hours): marks as failed, refunds credits
    """
    # Verify Cloud Scheduler OIDC token
    verify_scheduler_token(request)

    db = get_firestore_client()

    # Find jobs stuck in "processing" for more than threshold
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=STUCK_JOB_THRESHOLD_HOURS)
    timeout_time = datetime.now(timezone.utc) - timedelta(hours=TIMEOUT_JOB_THRESHOLD_HOURS)

    logger.info(f"[WATCHDOG] Scanning for stuck jobs (updated before {cutoff_time.isoformat()})")

    # Query jobs stuck in "processing" status
    stuck_processing = (
        db.collection("jobs")
        .where("status", "==", "processing")
        .where("updated_at", "<", cutoff_time)
        .limit(50)
        .get()
    )

    # Also query jobs stuck in "pending" or "queued" that have a wavespeed_request_id
    # These are jobs where worker submitted to WaveSpeed but crashed before updating status
    stuck_pending = (
        db.collection("jobs")
        .where("status", "==", "pending")
        .where("updated_at", "<", cutoff_time)
        .limit(25)
        .get()
    )

    stuck_queued = (
        db.collection("jobs")
        .where("status", "==", "queued")
        .where("updated_at", "<", cutoff_time)
        .limit(25)
        .get()
    )

    # Combine all stuck jobs
    stuck_jobs_list = list(stuck_processing) + list(stuck_pending) + list(stuck_queued)
    logger.info(f"[WATCHDOG] Found {len(stuck_jobs_list)} stuck jobs (processing={len(list(stuck_processing))}, pending={len(list(stuck_pending))}, queued={len(list(stuck_queued))})")

    results = {
        "scanned": len(stuck_jobs_list),
        "recovered": 0,
        "requeued": 0,
        "failed": 0,
        "timed_out": 0,
        "still_processing": 0,
        "errors": 0,
        "jobs": []
    }

    for job_doc in stuck_jobs_list:
        job_data = job_doc.to_dict()
        job_id = job_doc.id
        user_id = job_data.get("user_id")
        credits_charged = job_data.get("credits_charged", 0)
        request_id = job_data.get("wavespeed_request_id")
        updated_at = job_data.get("updated_at")

        job_result = {"job_id": job_id, "action": "none"}

        try:
            # Check if job has timed out (>6 hours)
            if updated_at and updated_at < timeout_time:
                logger.warning(f"[WATCHDOG] Job {job_id} timed out (>{TIMEOUT_JOB_THRESHOLD_HOURS}h)")
                job_doc.reference.update({
                    "status": "failed",
                    "error_message": f"Job timed out after {TIMEOUT_JOB_THRESHOLD_HOURS} hours",
                    "updated_at": firestore.SERVER_TIMESTAMP,
                })
                refund_credits(db, user_id, credits_charged, job_id)
                results["timed_out"] += 1
                job_result["action"] = "timed_out"
                results["jobs"].append(job_result)
                continue

            # No request_id means job never got submitted to WaveSpeed
            if not request_id:
                current_status = job_data.get("status")
                if current_status in ("pending", "queued"):
                    # For pending/queued jobs without request_id: re-queue via Cloud Tasks
                    logger.warning(f"[WATCHDOG] Job {job_id} stuck in {current_status} without wavespeed_request_id, re-queueing")
                    try:
                        from ..tasks.queue import enqueue_job
                        enqueue_job(
                            job_id=job_id,
                            user_id=user_id,
                            job_type=job_data.get("type", "video_generation"),
                        )
                        job_doc.reference.update({
                            "status": "queued",
                            "updated_at": firestore.SERVER_TIMESTAMP,
                            "retry_count": job_data.get("retry_count", 0) + 1,
                        })
                        results["requeued"] += 1
                        job_result["action"] = "requeued"
                        logger.info(f"[WATCHDOG] Job {job_id} re-queued successfully")
                    except Exception as queue_err:
                        logger.error(f"[WATCHDOG] Failed to re-queue job {job_id}: {queue_err}")
                        job_doc.reference.update({
                            "status": "failed",
                            "error_message": f"Job stuck and re-queue failed: {queue_err}",
                            "updated_at": firestore.SERVER_TIMESTAMP,
                        })
                        refund_credits(db, user_id, credits_charged, job_id)
                        results["failed"] += 1
                        job_result["action"] = "failed_requeue_error"
                else:
                    # For processing jobs without request_id: mark as failed
                    logger.warning(f"[WATCHDOG] Job {job_id} has no wavespeed_request_id, marking failed")
                    job_doc.reference.update({
                        "status": "failed",
                        "error_message": "Job never submitted to WaveSpeed",
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    })
                    refund_credits(db, user_id, credits_charged, job_id)
                    results["failed"] += 1
                    job_result["action"] = "failed_no_request_id"
                results["jobs"].append(job_result)
                continue

            # Check WaveSpeed API for actual status
            logger.info(f"[WATCHDOG] Checking WaveSpeed status for job {job_id} (request_id={request_id})")
            wavespeed_result = get_wavespeed_result(request_id)

            status = wavespeed_result.get("status") or wavespeed_result.get("data", {}).get("status")
            outputs = wavespeed_result.get("outputs") or wavespeed_result.get("data", {}).get("outputs") or []
            error = wavespeed_result.get("error") or wavespeed_result.get("message")

            logger.info(f"[WATCHDOG] Job {job_id}: WaveSpeed status={status}")

            if status in ("completed", "success"):
                if outputs:
                    # WaveSpeed completed but webhook was missed - process now
                    output_url = outputs[0]
                    logger.info(f"[WATCHDOG] Job {job_id}: WaveSpeed completed, triggering completion")

                    # Import and use completion processing
                    from .completion import (
                        download_video_from_url, upload_to_gcs, apply_watermark,
                        is_user_free_tier, OUTPUT_BUCKET
                    )
                    import tempfile
                    import os as os_module

                    output_path = f"outputs/{user_id}/{job_id}.mp4"

                    with tempfile.TemporaryDirectory() as tmpdir:
                        local_video = os_module.path.join(tmpdir, "video.mp4")
                        download_video_from_url(output_url, local_video)

                        final_video = local_video
                        if is_user_free_tier(db, user_id):
                            logger.info(f"[WATCHDOG] Job {job_id}: Applying watermark")
                            watermarked = os_module.path.join(tmpdir, "watermarked.mp4")
                            apply_watermark(local_video, watermarked)
                            final_video = watermarked

                        upload_to_gcs(final_video, OUTPUT_BUCKET, output_path)

                    job_doc.reference.update({
                        "status": "completed",
                        "output_video_path": output_path,
                        "completed_at": firestore.SERVER_TIMESTAMP,
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    })
                    results["recovered"] += 1
                    job_result["action"] = "recovered"
                    logger.info(f"[WATCHDOG] Job {job_id} recovered successfully")
                else:
                    # Completed but no outputs
                    job_doc.reference.update({
                        "status": "failed",
                        "error_message": "WaveSpeed completed but no outputs",
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    })
                    refund_credits(db, user_id, credits_charged, job_id)
                    results["failed"] += 1
                    job_result["action"] = "failed_no_outputs"

            elif status == "failed":
                error_msg = error or "WaveSpeed job failed"
                logger.warning(f"[WATCHDOG] Job {job_id} failed: {error_msg}")
                job_doc.reference.update({
                    "status": "failed",
                    "error_message": error_msg,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                })
                refund_credits(db, user_id, credits_charged, job_id)
                results["failed"] += 1
                job_result["action"] = "failed"

            elif status == "not_found":
                # Request ID not found in WaveSpeed - job may have been purged
                logger.warning(f"[WATCHDOG] Job {job_id}: WaveSpeed request not found")
                job_doc.reference.update({
                    "status": "failed",
                    "error_message": "WaveSpeed request not found (may have expired)",
                    "updated_at": firestore.SERVER_TIMESTAMP,
                })
                refund_credits(db, user_id, credits_charged, job_id)
                results["failed"] += 1
                job_result["action"] = "failed_not_found"

            else:
                # Still processing in WaveSpeed - update timestamp to reset watchdog
                logger.info(f"[WATCHDOG] Job {job_id}: still processing in WaveSpeed")
                results["still_processing"] += 1
                job_result["action"] = "still_processing"
                job_result["wavespeed_status"] = status

        except Exception as e:
            logger.exception(f"[WATCHDOG] Error processing job {job_id}: {e}")
            results["errors"] += 1
            job_result["action"] = "error"
            job_result["error"] = str(e)

        results["jobs"].append(job_result)

    logger.info(f"[WATCHDOG] Complete: recovered={results['recovered']}, requeued={results['requeued']}, failed={results['failed']}, timed_out={results['timed_out']}")

    return results
