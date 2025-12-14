"""Job validation utilities."""

import uuid
import secrets
import logging
from fastapi import HTTPException

from ..models import JobStatus

logger = logging.getLogger(__name__)

# Demo job configuration - blob paths (without gs://bucket/ prefix)
DEMO_IMAGE_PATH = "demo/REF.jpeg"  # in nuumee-images bucket
DEMO_VIDEO_PATH = "demo/SRC.mp4"   # in nuumee-videos bucket
DEMO_OUTPUT_PATH = "demo/output.mp4"  # in nuumee-outputs bucket

# Full GCS URIs for path matching (frontend sends these)
DEMO_IMAGE_URI = "gs://nuumee-images/demo/REF.jpeg"
DEMO_VIDEO_URI = "gs://nuumee-videos/demo/SRC.mp4"


def generate_job_id() -> str:
    """Generate a unique job ID."""
    return f"job_{uuid.uuid4().hex[:12]}"


def generate_short_id() -> str:
    """Generate a short ID for public video URLs (12 chars)."""
    return secrets.token_hex(6)


def is_demo_job(reference_image_path: str, motion_video_path: str) -> bool:
    """Check if the job inputs match demo files (free, pre-generated output).

    Accepts both full GCS URIs and blob paths for flexibility.
    """
    if reference_image_path == DEMO_IMAGE_URI and motion_video_path == DEMO_VIDEO_URI:
        return True
    if reference_image_path == DEMO_IMAGE_PATH and motion_video_path == DEMO_VIDEO_PATH:
        return True
    return False


def validate_gcs_path_ownership(path: str, user_id: str, field_name: str) -> None:
    """
    Validate that a GCS path belongs to the current user.

    Accepted path formats:
    - uploads/{user_id}/{timestamp}_{filename} (user uploads)
    - outputs/{user_id}/{job_id}.mp4 (job outputs - "From My Jobs")
    - processed/{job_id}/... (post-processed outputs)
    - demo/... (demo assets - no ownership check)

    Raises HTTPException 403 if the path doesn't belong to the user.
    Raises HTTPException 400 if the path format is invalid.
    """
    if not path:
        return

    parts = path.split("/")

    valid_prefixes = ["uploads", "outputs", "processed", "demo"]
    if len(parts) < 2 or parts[0] not in valid_prefixes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} path format"
        )

    # For "processed" and "demo" paths, ownership validated elsewhere
    if parts[0] in ("processed", "demo"):
        return

    # For "uploads" and "outputs", user_id is the second part
    path_user_id = parts[1]
    if path_user_id != user_id:
        logger.warning(
            f"User {user_id} attempted to use {field_name} belonging to {path_user_id}: {path}"
        )
        raise HTTPException(
            status_code=403,
            detail=f"Cannot use another user's {field_name}"
        )


async def validate_source_job(db, source_job_id: str, user_id: str) -> dict:
    """
    Validate that a source job exists, belongs to the user, and has completed output.

    Args:
        db: Firestore client
        source_job_id: ID of the source job
        user_id: Current user's ID

    Returns:
        Source job data dict

    Raises:
        HTTPException 404 if job not found
        HTTPException 403 if job belongs to different user
        HTTPException 400 if job not completed or has no output
    """
    job_ref = db.collection("jobs").document(source_job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(
            status_code=404,
            detail=f"Source job {source_job_id} not found"
        )

    job_data = job_doc.to_dict()

    if job_data.get("user_id") != user_id:
        logger.warning(
            f"User {user_id} attempted to use job {source_job_id} belonging to {job_data.get('user_id')}"
        )
        raise HTTPException(
            status_code=403,
            detail="Cannot use another user's job as source"
        )

    if job_data.get("status") != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Source job must be completed. Current status: {job_data.get('status')}"
        )

    if not job_data.get("output_video_path"):
        raise HTTPException(
            status_code=400,
            detail="Source job has no output video"
        )

    return job_data
