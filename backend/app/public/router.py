"""Public video access routes (no authentication required)."""
import os
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from google.cloud import firestore

from ..auth.firebase import get_firestore_client
from ..jobs.router import generate_signed_download_url

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Public"])


class PublicVideoResponse(BaseModel):
    """Public video information."""
    short_id: str = Field(..., description="Short ID for URL")
    video_url: str = Field(..., description="Signed URL for video playback")
    resolution: str = Field(..., description="Video resolution")
    created_at: datetime = Field(..., description="When video was created")
    view_count: int = Field(default=0, description="Number of views")
    expires_in_seconds: int = Field(default=3600, description="URL expiration time")


@router.get("/api/v1/public/video/{short_id}", response_model=PublicVideoResponse)
async def get_public_video_info(short_id: str):
    """
    Get public video information by short ID.

    This is a public endpoint (no auth required) that returns video metadata
    and a signed URL for playback. Used by the frontend video page.
    """
    db = get_firestore_client()

    # Query for job with this short_id
    jobs_query = db.collection("jobs").where("short_id", "==", short_id).limit(1)
    jobs = list(jobs_query.stream())

    if not jobs:
        raise HTTPException(status_code=404, detail="Video not found")

    job_doc = jobs[0]
    data = job_doc.to_dict()

    # Check if job is soft-deleted
    if data.get("deleted_at"):
        raise HTTPException(status_code=404, detail="Video not found")

    # Check if job is completed with output
    if data.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail="Video is still processing. Please check back later."
        )

    output_path = data.get("output_video_path")
    if not output_path:
        raise HTTPException(status_code=404, detail="Video output not available")

    # Increment view count
    try:
        job_doc.reference.update({
            "view_count": firestore.Increment(1)
        })
    except Exception as e:
        logger.warning(f"Failed to increment view count for {short_id}: {e}")

    # Generate signed URL for the output video
    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    try:
        signed_url = generate_signed_download_url(
            bucket_name=output_bucket,
            blob_path=output_path,
            expiration=3600
        )
    except Exception as e:
        logger.error(f"Failed to generate signed URL for {short_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate video URL")

    # Handle Firestore timestamp
    created_at = data.get("created_at")
    if hasattr(created_at, 'timestamp'):
        created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)

    return PublicVideoResponse(
        short_id=short_id,
        video_url=signed_url,
        resolution=data.get("resolution", "480p"),
        created_at=created_at,
        view_count=data.get("view_count", 0) + 1,  # Include the current view
        expires_in_seconds=3600
    )


@router.get("/v/{short_id}")
async def get_public_video(short_id: str):
    """
    Get public video by short ID.

    This is a public endpoint (no auth required) that:
    1. Looks up the job by short_id
    2. Verifies the job is completed with output video
    3. Increments the view count
    4. Redirects (302) to the signed GCS URL

    Used for clean shareable URLs like: https://nuumee.ai/v/abc123def456
    """
    db = get_firestore_client()

    # Query for job with this short_id
    jobs_query = db.collection("jobs").where("short_id", "==", short_id).limit(1)
    jobs = list(jobs_query.stream())

    if not jobs:
        raise HTTPException(status_code=404, detail="Video not found")

    job_doc = jobs[0]
    data = job_doc.to_dict()

    # Check if job is soft-deleted
    if data.get("deleted_at"):
        raise HTTPException(status_code=404, detail="Video not found")

    # Check if job is completed with output
    if data.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail="Video is still processing. Please check back later."
        )

    output_path = data.get("output_video_path")
    if not output_path:
        raise HTTPException(status_code=404, detail="Video output not available")

    # Increment view count (fire-and-forget, don't block on error)
    try:
        job_doc.reference.update({
            "view_count": firestore.Increment(1)
        })
    except Exception as e:
        logger.warning(f"Failed to increment view count for {short_id}: {e}")

    # Generate signed URL for the output video
    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    try:
        signed_url = generate_signed_download_url(
            bucket_name=output_bucket,
            blob_path=output_path,
            expiration=3600  # 1 hour
        )
    except Exception as e:
        logger.error(f"Failed to generate signed URL for {short_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate video URL")

    # Redirect to the signed URL
    return RedirectResponse(url=signed_url, status_code=302)
