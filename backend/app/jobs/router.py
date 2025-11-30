"""Job management routes."""
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud import firestore

from .models import (
    CreateJobRequest,
    JobResponse,
    JobListResponse,
    JobStatus,
    JobType,
    Resolution,
    CreditCostResponse,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id
from ..tasks.queue import enqueue_job

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/jobs", tags=["Jobs"])


# Credit costs per resolution (based on WaveSpeed pricing + NuuMee margin)
# WaveSpeed: 480p=$0.04/sec, 720p=$0.08/sec
# NuuMee: 1 credit = $0.10, so we charge ~2x WaveSpeed cost
CREDIT_COSTS = {
    JobType.ANIMATE: {
        Resolution.RES_480P: 0.8,  # credits per second
        Resolution.RES_720P: 1.6,  # credits per second
    },
    JobType.EXTEND: {
        Resolution.RES_480P: 1.0,
        Resolution.RES_720P: 2.0,
    },
    JobType.UPSCALE: {
        Resolution.RES_480P: 0.4,
        Resolution.RES_720P: 0.6,
    },
    JobType.FOLEY: {
        Resolution.RES_480P: 1.0,  # flat rate per job
        Resolution.RES_720P: 1.0,
    },
}

# Minimum charge in credits
MIN_CREDITS = 5.0

# Default estimated duration for cost calculation
DEFAULT_DURATION_SECONDS = 10


def calculate_credits(
    job_type: JobType,
    resolution: Resolution,
    duration_seconds: int = DEFAULT_DURATION_SECONDS
) -> float:
    """Calculate credit cost for a job."""
    rate = CREDIT_COSTS.get(job_type, {}).get(resolution, 1.0)

    if job_type == JobType.FOLEY:
        # Flat rate for foley
        return MIN_CREDITS

    cost = rate * duration_seconds
    return max(cost, MIN_CREDITS)


def generate_job_id() -> str:
    """Generate a unique job ID."""
    return f"job_{uuid.uuid4().hex[:12]}"


@router.post("", response_model=JobResponse)
async def create_job(
    request: CreateJobRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new video generation job.

    This endpoint:
    1. Validates the user has sufficient credits
    2. Deducts credits from user's balance
    3. Creates job document in Firestore
    4. Returns job details

    The job will be picked up by the worker service for processing.

    **Credit Calculation:**
    - 480p: ~0.8 credits/second (min 5 credits)
    - 720p: ~1.6 credits/second (min 5 credits)
    - Actual cost depends on video duration

    **Required:**
    - reference_image_path: GCS path from upload endpoint
    - motion_video_path: GCS path from upload endpoint
    """
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    current_credits = user_data.get("credits_balance", 0)

    # Calculate credit cost (using default duration, actual cost determined after processing)
    credits_to_charge = calculate_credits(
        request.job_type,
        request.resolution,
        DEFAULT_DURATION_SECONDS
    )

    # Check sufficient credits
    if current_credits < credits_to_charge:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "insufficient_credits",
                "message": f"Insufficient credits. Required: {credits_to_charge}, Available: {current_credits}",
                "required_credits": credits_to_charge,
                "available_credits": current_credits
            }
        )

    # Generate job ID
    job_id = generate_job_id()
    now = datetime.now(timezone.utc)

    # Create job document
    job_data = {
        "id": job_id,
        "user_id": user_id,
        "job_type": request.job_type.value,
        "status": JobStatus.PENDING.value,
        "reference_image_path": request.reference_image_path,
        "motion_video_path": request.motion_video_path,
        "resolution": request.resolution.value,
        "seed": request.seed,
        "credits_charged": credits_to_charge,
        "wavespeed_request_id": None,
        "output_video_path": None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }

    # Use transaction to deduct credits and create job atomically
    @firestore.transactional
    def create_job_transaction(transaction, user_ref, job_ref, job_data, credits_to_charge):
        # Re-read user document in transaction
        user_snapshot = user_ref.get(transaction=transaction)
        user_data = user_snapshot.to_dict()
        current_balance = user_data.get("credits_balance", 0)

        if current_balance < credits_to_charge:
            raise HTTPException(
                status_code=402,
                detail={
                    "error": "insufficient_credits",
                    "message": f"Insufficient credits. Required: {credits_to_charge}, Available: {current_balance}",
                    "required_credits": credits_to_charge,
                    "available_credits": current_balance
                }
            )

        # Deduct credits
        new_balance = current_balance - credits_to_charge
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        # Create job
        transaction.set(job_ref, job_data)

        return new_balance

    try:
        job_ref = db.collection("jobs").document(job_id)
        transaction = db.transaction()
        new_balance = create_job_transaction(transaction, user_ref, job_ref, job_data, credits_to_charge)

        # Enqueue job for processing
        try:
            task_name = enqueue_job(job_id)
            logger.info(f"Job {job_id} enqueued: {task_name}")

            # Update job status to queued
            job_ref.update({
                "status": JobStatus.QUEUED.value,
                "updated_at": datetime.now(timezone.utc),
            })
            job_status = JobStatus.QUEUED
        except Exception as e:
            logger.error(f"Failed to enqueue job {job_id}: {e}")
            # Job stays in pending state, can be retried later
            job_status = JobStatus.PENDING

        # Return job response
        return JobResponse(
            id=job_id,
            user_id=user_id,
            job_type=request.job_type,
            status=job_status,
            reference_image_path=request.reference_image_path,
            motion_video_path=request.motion_video_path,
            resolution=request.resolution,
            seed=request.seed,
            credits_charged=credits_to_charge,
            wavespeed_request_id=None,
            output_video_path=None,
            error_message=None,
            created_at=now,
            updated_at=now,
            completed_at=None,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create job: {str(e)}"
        )


@router.get("", response_model=JobListResponse)
async def list_jobs(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[JobStatus] = Query(None, description="Filter by status"),
):
    """
    List all jobs for the authenticated user.

    Supports pagination and filtering by status.
    Jobs are returned in reverse chronological order (newest first).
    """
    db = get_firestore_client()

    # Build query
    query = db.collection("jobs").where("user_id", "==", user_id)

    if status:
        query = query.where("status", "==", status.value)

    # Order by created_at descending
    query = query.order_by("created_at", direction=firestore.Query.DESCENDING)

    # Get total count (for pagination info)
    # Note: Firestore doesn't have a count function in Python SDK, so we fetch all IDs
    # For production, consider using aggregation queries or maintaining counters
    all_docs = list(query.stream())
    total = len(all_docs)

    # Apply pagination
    offset = (page - 1) * page_size
    paginated_docs = all_docs[offset:offset + page_size]

    # Convert to response models
    jobs = []
    for doc in paginated_docs:
        data = doc.to_dict()

        # Handle Firestore timestamps
        created_at = data.get("created_at")
        updated_at = data.get("updated_at")
        completed_at = data.get("completed_at")

        if hasattr(created_at, 'timestamp'):
            created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)
        if hasattr(updated_at, 'timestamp'):
            updated_at = datetime.fromtimestamp(updated_at.timestamp(), tz=timezone.utc)
        if completed_at and hasattr(completed_at, 'timestamp'):
            completed_at = datetime.fromtimestamp(completed_at.timestamp(), tz=timezone.utc)

        jobs.append(JobResponse(
            id=data.get("id"),
            user_id=data.get("user_id"),
            job_type=JobType(data.get("job_type", "animate")),
            status=JobStatus(data.get("status", "pending")),
            reference_image_path=data.get("reference_image_path"),
            motion_video_path=data.get("motion_video_path"),
            resolution=Resolution(data.get("resolution", "480p")),
            seed=data.get("seed"),
            credits_charged=data.get("credits_charged", 0),
            wavespeed_request_id=data.get("wavespeed_request_id"),
            output_video_path=data.get("output_video_path"),
            error_message=data.get("error_message"),
            created_at=created_at,
            updated_at=updated_at,
            completed_at=completed_at,
        ))

    return JobListResponse(
        jobs=jobs,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/cost", response_model=CreditCostResponse)
async def estimate_cost(
    job_type: JobType = Query(JobType.ANIMATE, description="Job type"),
    resolution: Resolution = Query(Resolution.RES_480P, description="Resolution"),
    duration_seconds: int = Query(10, ge=5, le=120, description="Estimated video duration"),
):
    """
    Estimate credit cost for a job.

    This endpoint does not require authentication.
    Use it to show users estimated costs before they create a job.
    """
    credits = calculate_credits(job_type, resolution, duration_seconds)

    return CreditCostResponse(
        job_type=job_type,
        resolution=resolution,
        estimated_credits=credits,
        estimated_duration_seconds=duration_seconds,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Get details of a specific job.

    Only the job owner can access job details.
    """
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    # Verify ownership
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this job")

    # Handle Firestore timestamps
    created_at = data.get("created_at")
    updated_at = data.get("updated_at")
    completed_at = data.get("completed_at")

    if hasattr(created_at, 'timestamp'):
        created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)
    if hasattr(updated_at, 'timestamp'):
        updated_at = datetime.fromtimestamp(updated_at.timestamp(), tz=timezone.utc)
    if completed_at and hasattr(completed_at, 'timestamp'):
        completed_at = datetime.fromtimestamp(completed_at.timestamp(), tz=timezone.utc)

    return JobResponse(
        id=data.get("id"),
        user_id=data.get("user_id"),
        job_type=JobType(data.get("job_type", "animate")),
        status=JobStatus(data.get("status", "pending")),
        reference_image_path=data.get("reference_image_path"),
        motion_video_path=data.get("motion_video_path"),
        resolution=Resolution(data.get("resolution", "480p")),
        seed=data.get("seed"),
        credits_charged=data.get("credits_charged", 0),
        wavespeed_request_id=data.get("wavespeed_request_id"),
        output_video_path=data.get("output_video_path"),
        error_message=data.get("error_message"),
        created_at=created_at,
        updated_at=updated_at,
        completed_at=completed_at,
    )
