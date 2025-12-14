"""Job management service for admin panel."""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from google.cloud import firestore

from ..schemas import (
    AdminJobSummary,
    AdminJobDetail,
    JobRetryResponse,
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
        data = doc.to_dict()
        uid = data.get("user_id", "")
        items.append(AdminJobSummary(
            id=doc.id,
            user_id=uid,
            user_email=user_emails.get(uid),
            type=data.get("type"),
            status=JobStatus(data.get("status", "pending")),
            credits_used=data.get("credits_used", 0),
            created_at=data.get("created_at", datetime.now(timezone.utc)),
            completed_at=data.get("completed_at"),
            error_message=data.get("error_message"),
        ))

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

    return AdminJobDetail(
        id=job_doc.id,
        user_id=uid,
        user_email=user_email,
        type=data.get("type"),
        status=JobStatus(data.get("status", "pending")),
        credits_used=data.get("credits_used", 0),
        created_at=data.get("created_at", datetime.now(timezone.utc)),
        completed_at=data.get("completed_at"),
        error_message=data.get("error_message"),
        input_path=data.get("input_path") or data.get("video_path"),
        output_path=data.get("output_path") or data.get("result_url"),
        error_details=data.get("error_details") or data.get("error_message"),
        metadata={
            k: v for k, v in data.items()
            if k not in ["user_id", "status", "created_at", "completed_at", "error_message", "error_details"]
        },
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
