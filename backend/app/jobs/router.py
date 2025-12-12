"""Job management routes."""
import os
import uuid
import secrets
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud import firestore

from google.cloud import storage
from .models import (
    CreateJobRequest,
    JobResponse,
    JobListResponse,
    JobStatus,
    JobType,
    Resolution,
    CreditCostResponse,
    JobOutputResponse,
    PostProcessRequest,
    PostProcessResponse,
    PostProcessType,
    SubtitleStyle,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id
from ..tasks.queue import enqueue_job, enqueue_ffmpeg_job

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/jobs", tags=["Jobs"])


# Credit costs per resolution (based on WaveSpeed pricing + NuuMee margin)
# WaveSpeed: 480p=$0.04/sec, 720p=$0.08/sec
# NuuMee: 1 credit = $0.10, so we charge ~2x WaveSpeed cost
ANIMATE_CREDIT_RATES = {
    Resolution.RES_480P: 0.8,  # credits per second
    Resolution.RES_720P: 1.6,  # credits per second
}

# Extender: FIXED cost per resolution (not per-second!)
# See docs/PRICING_STRATEGY.md for rationale
EXTEND_FIXED_CREDITS = {
    Resolution.RES_480P: 5.0,   # Fixed 5 credits for 480p extend
    Resolution.RES_720P: 10.0,  # Fixed 10 credits for 720p extend
}

# Upscaler: 100% of base credits (calculated from source video)
# This doubles the cost of the video
UPSCALE_MULTIPLIER = 1.0  # 100% of base credits

# Foley: flat rate
FOLEY_FIXED_CREDITS = 5.0

# Legacy CREDIT_COSTS for backward compatibility (animate only)
CREDIT_COSTS = {
    JobType.ANIMATE: ANIMATE_CREDIT_RATES,
    JobType.EXTEND: EXTEND_FIXED_CREDITS,  # Note: these are FIXED, not rates
    JobType.UPSCALE: {  # Placeholder - actual calculation uses source video
        Resolution.RES_480P: 5.0,
        Resolution.RES_720P: 5.0,
    },
    JobType.FOLEY: {
        Resolution.RES_480P: FOLEY_FIXED_CREDITS,
        Resolution.RES_720P: FOLEY_FIXED_CREDITS,
    },
}

# Minimum charge in credits
MIN_CREDITS = 5.0

# Default estimated duration for cost calculation
DEFAULT_DURATION_SECONDS = 10

# Demo job configuration - blob paths (without gs://bucket/ prefix)
# These paths are stored in Firestore and used for signed URL generation
DEMO_IMAGE_PATH = "demo/REF.jpeg"  # in nuumee-images bucket
DEMO_VIDEO_PATH = "demo/SRC.mp4"   # in nuumee-videos bucket (used as motion source)
DEMO_OUTPUT_PATH = "demo/output.mp4"  # in nuumee-outputs bucket

# Full GCS URIs for path matching (frontend sends these)
DEMO_IMAGE_URI = "gs://nuumee-images/demo/REF.jpeg"
DEMO_VIDEO_URI = "gs://nuumee-videos/demo/SRC.mp4"


def is_demo_job(reference_image_path: str, motion_video_path: str) -> bool:
    """Check if the job inputs match demo files (free, pre-generated output).

    Accepts both full GCS URIs and blob paths for flexibility.
    """
    # Check against full URIs (what frontend sends)
    if reference_image_path == DEMO_IMAGE_URI and motion_video_path == DEMO_VIDEO_URI:
        return True
    # Also check blob paths in case they're stored that way
    if reference_image_path == DEMO_IMAGE_PATH and motion_video_path == DEMO_VIDEO_PATH:
        return True
    return False


def calculate_credits(
    job_type: JobType,
    resolution: Resolution,
    duration_seconds: int = DEFAULT_DURATION_SECONDS,
    source_base_credits: float = None
) -> float:
    """Calculate credit cost for a job.

    Args:
        job_type: Type of job (ANIMATE, EXTEND, UPSCALE, FOLEY)
        resolution: Output resolution
        duration_seconds: Video duration (used for ANIMATE only)
        source_base_credits: Base credits of source video (used for UPSCALE only)

    Returns:
        Credit cost for the job
    """
    # EXTEND: Fixed cost based on resolution (not per-second!)
    if job_type == JobType.EXTEND:
        return EXTEND_FIXED_CREDITS.get(resolution, 5.0)

    # UPSCALE: 100% of source video's base credits
    if job_type == JobType.UPSCALE:
        if source_base_credits is not None:
            return max(source_base_credits * UPSCALE_MULTIPLIER, MIN_CREDITS)
        # Fallback if source credits unknown (shouldn't happen)
        return MIN_CREDITS

    # FOLEY: Flat rate
    if job_type == JobType.FOLEY:
        return FOLEY_FIXED_CREDITS

    # ANIMATE: Per-second rate
    rate = ANIMATE_CREDIT_RATES.get(resolution, 0.8)
    cost = rate * duration_seconds
    return max(cost, MIN_CREDITS)


def generate_job_id() -> str:
    """Generate a unique job ID."""
    return f"job_{uuid.uuid4().hex[:12]}"


def generate_short_id() -> str:
    """Generate a short ID for public video URLs (12 chars)."""
    return secrets.token_hex(6)  # 12 hex chars = 281 trillion possibilities


def validate_gcs_path_ownership(path: str, user_id: str, field_name: str) -> None:
    """
    Validate that a GCS path belongs to the current user.

    Path format: uploads/{user_id}/{timestamp}_{filename}
    Example: uploads/abc123/1701432000_reference.jpg

    Raises HTTPException 403 if the path doesn't belong to the user.
    Raises HTTPException 400 if the path format is invalid.
    """
    if not path:
        return  # Empty paths are handled elsewhere

    parts = path.split("/")
    # Expected format: uploads/{user_id}/{timestamp}_{filename}
    if len(parts) < 3 or parts[0] != "uploads":
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name} path format"
        )

    path_user_id = parts[1]  # User ID is the second part after "uploads/"
    if path_user_id != user_id:
        logger.warning(
            f"User {user_id} attempted to use {field_name} belonging to {path_user_id}: {path}"
        )
        raise HTTPException(
            status_code=403,
            detail=f"Cannot use another user's {field_name}"
        )


async def validate_source_job(
    db,
    source_job_id: str,
    user_id: str
) -> dict:
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

    # Check ownership
    if job_data.get("user_id") != user_id:
        logger.warning(
            f"User {user_id} attempted to use job {source_job_id} belonging to {job_data.get('user_id')}"
        )
        raise HTTPException(
            status_code=403,
            detail="Cannot use another user's job as source"
        )

    # Check job is completed
    if job_data.get("status") != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Source job must be completed. Current status: {job_data.get('status')}"
        )

    # Check job has output video
    if not job_data.get("output_video_path"):
        raise HTTPException(
            status_code=400,
            detail="Source job has no output video"
        )

    return job_data


@router.post("", response_model=JobResponse)
async def create_job(
    request: CreateJobRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new video generation job.

    This endpoint:
    1. Validates inputs based on job_type
    2. Validates the user has sufficient credits
    3. Deducts credits from user's balance
    4. Creates job document in Firestore
    5. Returns job details

    The job will be picked up by the worker service for processing.

    **Job Types:**
    - ANIMATE: Requires reference_image_path and motion_video_path
    - EXTEND: Requires source_job_id, optional extension_prompt
    - UPSCALE: Requires source_job_id

    **Credit Calculation:**
    - ANIMATE: ~0.8-1.6 credits/second based on resolution
    - EXTEND: Fixed 5 credits (480p) or 10 credits (720p)
    - UPSCALE: 100% of source video's base credits
    """
    db = get_firestore_client()

    # Variables for source job (EXTEND/UPSCALE only)
    source_job_data = None
    input_video_path = None  # Named to match worker expectation
    source_base_credits = None

    # Check if this is a demo job (free, pre-generated output)
    demo_mode = False
    if request.job_type == JobType.ANIMATE:
        demo_mode = is_demo_job(
            request.reference_image_path or "",
            request.motion_video_path or ""
        )
        if demo_mode:
            logger.info(f"Demo job detected for user {user_id}")

    # Validate based on job type
    if request.job_type == JobType.ANIMATE:
        # ANIMATE requires reference_image_path and motion_video_path
        if not request.reference_image_path or not request.motion_video_path:
            raise HTTPException(
                status_code=400,
                detail="ANIMATE jobs require reference_image_path and motion_video_path"
            )
        # Skip ownership validation for demo jobs (demo files are shared)
        if not demo_mode:
            validate_gcs_path_ownership(request.reference_image_path, user_id, "reference image")
            validate_gcs_path_ownership(request.motion_video_path, user_id, "motion video")

    elif request.job_type in (JobType.EXTEND, JobType.UPSCALE):
        # EXTEND/UPSCALE require source_job_id
        if not request.source_job_id:
            raise HTTPException(
                status_code=400,
                detail=f"{request.job_type.value.upper()} jobs require source_job_id"
            )
        # Validate source job ownership and get its data
        source_job_data = await validate_source_job(db, request.source_job_id, user_id)
        input_video_path = source_job_data.get("output_video_path")  # Worker reads this as input
        source_base_credits = source_job_data.get("credits_charged", MIN_CREDITS)

    else:
        # FOLEY or other future types
        pass

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    current_credits = user_data.get("credits_balance", 0)

    # Calculate credit cost based on job type
    credits_to_charge = calculate_credits(
        request.job_type,
        request.resolution,
        duration_seconds=DEFAULT_DURATION_SECONDS,
        source_base_credits=source_base_credits
    )

    # Demo jobs are free
    if demo_mode:
        credits_to_charge = 0.0

    # Check sufficient credits (skip for demo jobs)
    if not demo_mode and current_credits < credits_to_charge:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "insufficient_credits",
                "message": f"Insufficient credits. Required: {credits_to_charge}, Available: {current_credits}",
                "required_credits": credits_to_charge,
                "available_credits": current_credits
            }
        )

    # Generate job ID and short ID for sharing
    job_id = generate_job_id()
    short_id = generate_short_id()
    now = datetime.now(timezone.utc)

    # Create job document - demo jobs are immediately completed
    # For demo jobs, store blob paths (not full URIs) for proper signed URL generation
    ref_image_path = DEMO_IMAGE_PATH if demo_mode else request.reference_image_path
    motion_path = DEMO_VIDEO_PATH if demo_mode else request.motion_video_path

    job_data = {
        "id": job_id,
        "short_id": short_id,  # For clean public URLs like nuumee.ai/v/{short_id}
        "user_id": user_id,
        "job_type": request.job_type.value,
        "status": JobStatus.COMPLETED.value if demo_mode else JobStatus.PENDING.value,
        # ANIMATE fields
        "reference_image_path": ref_image_path,
        "motion_video_path": motion_path,
        # EXTEND/UPSCALE fields
        "source_job_id": request.source_job_id,
        "input_video_path": input_video_path,  # Worker expects this field name
        "extension_prompt": request.extension_prompt,
        # Common fields
        "resolution": request.resolution.value,
        "seed": request.seed,
        "credits_charged": credits_to_charge,
        "wavespeed_request_id": "demo" if demo_mode else None,
        "output_video_path": DEMO_OUTPUT_PATH if demo_mode else None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": now if demo_mode else None,
        "view_count": 0,  # Track video views
        "is_demo": demo_mode,  # Flag for tracking
    }

    # Demo jobs: just create the job, no credit deduction or worker needed
    if demo_mode:
        try:
            job_ref = db.collection("jobs").document(job_id)
            job_ref.set(job_data)
            logger.info(f"Demo job {job_id} created for user {user_id}")

            return JobResponse(
                id=job_id,
                short_id=short_id,
                share_url=f"https://nuumee.ai/v/{short_id}",
                user_id=user_id,
                job_type=request.job_type,
                status=JobStatus.COMPLETED,
                reference_image_path=ref_image_path,
                motion_video_path=motion_path,
                source_job_id=request.source_job_id,
                input_video_path=input_video_path,
                extension_prompt=request.extension_prompt,
                resolution=request.resolution,
                seed=request.seed,
                credits_charged=0.0,
                wavespeed_request_id="demo",
                output_video_path=DEMO_OUTPUT_PATH,
                error_message=None,
                created_at=now,
                updated_at=now,
                completed_at=now,
                view_count=0,
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create demo job: {str(e)}"
            )

    # Regular jobs: use transaction to deduct credits and create job atomically
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
            short_id=short_id,
            share_url=f"https://nuumee.ai/v/{short_id}",
            user_id=user_id,
            job_type=request.job_type,
            status=job_status,
            # ANIMATE fields
            reference_image_path=request.reference_image_path,
            motion_video_path=request.motion_video_path,
            # EXTEND/UPSCALE fields
            source_job_id=request.source_job_id,
            input_video_path=input_video_path,
            extension_prompt=request.extension_prompt,
            # Common fields
            resolution=request.resolution,
            seed=request.seed,
            credits_charged=credits_to_charge,
            wavespeed_request_id=None,
            output_video_path=None,
            error_message=None,
            created_at=now,
            updated_at=now,
            completed_at=None,
            view_count=0,
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

    # Build query - filter by user_id only (soft-deleted jobs filtered client-side for now)
    # Note: Firestore doesn't support "field does not exist" queries
    query = db.collection("jobs").where("user_id", "==", user_id)

    if status:
        query = query.where("status", "==", status.value)

    # Order by created_at descending
    query = query.order_by("created_at", direction=firestore.Query.DESCENDING)

    # Get all docs and filter out soft-deleted ones
    # Note: Firestore doesn't support "field does not exist" queries,
    # so we filter after fetching
    all_docs = [doc for doc in query.stream() if not doc.to_dict().get("deleted_at")]
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

        short_id = data.get("short_id")
        jobs.append(JobResponse(
            id=data.get("id"),
            short_id=short_id,
            share_url=f"https://nuumee.ai/v/{short_id}" if short_id else None,
            user_id=data.get("user_id"),
            job_type=JobType(data.get("job_type", "animate")),
            status=JobStatus(data.get("status", "pending")),
            # ANIMATE fields
            reference_image_path=data.get("reference_image_path"),
            motion_video_path=data.get("motion_video_path"),
            # EXTEND/UPSCALE fields
            source_job_id=data.get("source_job_id"),
            input_video_path=data.get("input_video_path"),
            extension_prompt=data.get("extension_prompt"),
            # Common fields
            resolution=Resolution(data.get("resolution", "480p")),
            seed=data.get("seed"),
            credits_charged=data.get("credits_charged", 0),
            wavespeed_request_id=data.get("wavespeed_request_id"),
            output_video_path=data.get("output_video_path"),
            error_message=data.get("error_message"),
            created_at=created_at,
            updated_at=updated_at,
            completed_at=completed_at,
            view_count=data.get("view_count", 0),
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

    short_id = data.get("short_id")
    return JobResponse(
        id=data.get("id"),
        short_id=short_id,
        share_url=f"https://nuumee.ai/v/{short_id}" if short_id else None,
        user_id=data.get("user_id"),
        job_type=JobType(data.get("job_type", "animate")),
        status=JobStatus(data.get("status", "pending")),
        # ANIMATE fields
        reference_image_path=data.get("reference_image_path"),
        motion_video_path=data.get("motion_video_path"),
        # EXTEND/UPSCALE fields
        source_job_id=data.get("source_job_id"),
        input_video_path=data.get("input_video_path"),
        extension_prompt=data.get("extension_prompt"),
        # Common fields
        resolution=Resolution(data.get("resolution", "480p")),
        seed=data.get("seed"),
        credits_charged=data.get("credits_charged", 0),
        wavespeed_request_id=data.get("wavespeed_request_id"),
        output_video_path=data.get("output_video_path"),
        error_message=data.get("error_message"),
        created_at=created_at,
        updated_at=updated_at,
        completed_at=completed_at,
        view_count=data.get("view_count", 0),
    )


def generate_signed_download_url(bucket_name: str, blob_path: str, expiration: int = 3600) -> str:
    """
    Generate a signed URL for downloading a file from GCS.

    Uses IAM impersonation to get signing credentials on Cloud Run,
    since the default Compute Engine credentials cannot sign URLs.
    """
    import requests as http_requests
    from google.auth import default
    from google.auth import impersonated_credentials
    from datetime import timedelta

    # Get service account email from metadata server or environment
    sa_email = os.getenv("SERVICE_ACCOUNT_EMAIL")
    if not sa_email:
        try:
            response = http_requests.get(
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
                headers={"Metadata-Flavor": "Google"},
                timeout=2
            )
            if response.status_code == 200:
                sa_email = response.text
        except Exception:
            pass

    if not sa_email:
        sa_email = "nuumee-api@wanapi-prod.iam.gserviceaccount.com"

    # Get default credentials and create impersonated credentials with signing capability
    source_credentials, project = default()
    signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=sa_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,
    )

    # Create storage client
    client = storage.Client(project=project)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    # Generate signed URL using impersonated credentials
    # Pass credentials object directly (same approach as upload router)
    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
        credentials=signing_credentials,
    )
    return url


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Delete a job and its associated files.

    This performs a soft delete (sets deleted_at) and removes GCS files.
    Credits are NOT refunded.
    """
    db = get_firestore_client()

    # Get job document
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    # Verify ownership
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    # Delete associated files from GCS
    try:
        upload_bucket = os.getenv("UPLOAD_BUCKET", "nuumee-uploads")
        output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")
        client = storage.Client()

        # Delete reference image
        if data.get("reference_image_path"):
            try:
                bucket = client.bucket(upload_bucket)
                blob = bucket.blob(data["reference_image_path"])
                blob.delete()
            except Exception as e:
                logger.warning(f"Failed to delete reference image: {e}")

        # Delete motion video
        if data.get("motion_video_path"):
            try:
                bucket = client.bucket(upload_bucket)
                blob = bucket.blob(data["motion_video_path"])
                blob.delete()
            except Exception as e:
                logger.warning(f"Failed to delete motion video: {e}")

        # Delete output video
        if data.get("output_video_path"):
            try:
                bucket = client.bucket(output_bucket)
                blob = bucket.blob(data["output_video_path"])
                blob.delete()
            except Exception as e:
                logger.warning(f"Failed to delete output video: {e}")

    except Exception as e:
        logger.error(f"Error during file cleanup for job {job_id}: {e}")

    # Soft delete - set deleted_at timestamp
    job_ref.update({
        "deleted_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })

    return {"message": "Job deleted successfully", "job_id": job_id}


class ThumbnailUrls(JobOutputResponse):
    """Response model for job thumbnails."""
    reference_image_url: Optional[str] = None
    motion_video_url: Optional[str] = None


@router.get("/{job_id}/thumbnails")
async def get_job_thumbnails(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Get signed URLs for job input files (reference image and motion video).

    Returns URLs valid for 1 hour.
    """
    db = get_firestore_client()

    # Get job document
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    # Verify ownership
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

    # Buckets match what upload router uses
    image_bucket = os.getenv("GCS_IMAGE_BUCKET", "nuumee-images")
    video_bucket = os.getenv("GCS_VIDEO_BUCKET", "nuumee-videos")
    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    result = {
        "job_id": job_id,
        "reference_image_url": None,
        "motion_video_url": None,
        "input_video_url": None,  # For EXTEND/UPSCALE jobs
        "output_video_url": None,
    }

    # Generate signed URL for reference image (stored in images bucket)
    if data.get("reference_image_path"):
        try:
            result["reference_image_url"] = generate_signed_download_url(
                bucket_name=image_bucket,
                blob_path=data["reference_image_path"],
                expiration=3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate reference image URL: {e}")

    # Generate signed URL for motion video (stored in videos bucket)
    if data.get("motion_video_path"):
        try:
            result["motion_video_url"] = generate_signed_download_url(
                bucket_name=video_bucket,
                blob_path=data["motion_video_path"],
                expiration=3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate motion video URL: {e}")

    # Generate signed URL for input video (for EXTEND/UPSCALE jobs - stored in outputs bucket)
    if data.get("input_video_path"):
        try:
            result["input_video_url"] = generate_signed_download_url(
                bucket_name=output_bucket,  # Input comes from previous job's output
                blob_path=data["input_video_path"],
                expiration=3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate input video URL: {e}")

    # Generate signed URL for output video (stored in outputs bucket)
    if data.get("output_video_path"):
        try:
            result["output_video_url"] = generate_signed_download_url(
                bucket_name=output_bucket,
                blob_path=data["output_video_path"],
                expiration=3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate output video URL: {e}")

    return result


@router.get("/{job_id}/output", response_model=JobOutputResponse)
async def get_job_output(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Get download URL for completed job output video.

    Returns a signed GCS download URL valid for 1 hour.

    **Requirements:**
    - Job must exist and belong to the user
    - Job status must be "completed"
    - Output video must exist
    """
    db = get_firestore_client()

    # Get job document
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    # Verify ownership
    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

    # Verify job is completed
    job_status = data.get("status")
    if job_status != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "job_not_completed",
                "message": f"Job is not completed yet. Current status: {job_status}",
                "current_status": job_status
            }
        )

    # Verify output exists
    output_path = data.get("output_video_path")
    if not output_path:
        raise HTTPException(status_code=404, detail="No output video available for this job")

    # Get output bucket from environment
    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    # Generate signed download URL
    try:
        download_url = generate_signed_download_url(
            bucket_name=output_bucket,
            blob_path=output_path,
            expiration=3600
        )

        # Extract filename from path
        filename = output_path.split("/")[-1]

        return JobOutputResponse(
            job_id=job_id,
            download_url=download_url,
            expires_in_seconds=3600,
            filename=filename
        )

    except Exception as e:
        logger.error(f"Failed to generate download URL for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")


@router.post("/{job_id}/post-process", response_model=PostProcessResponse)
async def create_post_process_job(
    job_id: str,
    request: PostProcessRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Create a post-processing job for a completed video.

    This endpoint creates a new job that applies post-processing to an existing
    completed video. Currently supports:
    - **subtitles**: Auto-generate subtitles using Speech-to-Text
    - **watermark**: Add NuuMee watermark overlay

    **Requirements:**
    - Source job must exist and belong to the user
    - Source job must be completed with an output video

    **Pricing:**
    - Subtitles: FREE (0 credits)
    - Watermark: FREE (0 credits)
    """
    db = get_firestore_client()

    # Get and validate source job
    source_job_ref = db.collection("jobs").document(job_id)
    source_job_doc = source_job_ref.get()

    if not source_job_doc.exists:
        raise HTTPException(status_code=404, detail="Source job not found")

    source_data = source_job_doc.to_dict()

    # Verify ownership
    if source_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to process this job")

    # Verify job is completed
    if source_data.get("status") != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Source job must be completed. Current status: {source_data.get('status')}"
        )

    # Verify output exists
    input_video_path = source_data.get("output_video_path")
    if not input_video_path:
        raise HTTPException(status_code=400, detail="Source job has no output video")

    # Generate new job ID
    new_job_id = generate_job_id()
    now = datetime.now(timezone.utc)

    # Map post-process type to job type
    job_type_map = {
        PostProcessType.SUBTITLES: JobType.SUBTITLES,
        PostProcessType.WATERMARK: JobType.WATERMARK,
    }
    new_job_type = job_type_map[request.post_process_type]

    # Build options for FFmpeg worker
    options = {}
    if request.post_process_type == PostProcessType.SUBTITLES:
        options["subtitle_style"] = request.subtitle_style.value if request.subtitle_style else "classic"
    elif request.post_process_type == PostProcessType.WATERMARK:
        options["watermark_path"] = "assets/watermark.png"
        options["position"] = "bottom-right"
        options["opacity"] = 0.7

    # Post-processing is FREE (0 credits)
    credits_to_charge = 0.0

    # Create job document
    job_data = {
        "id": new_job_id,
        "user_id": user_id,
        "job_type": new_job_type.value,
        "status": JobStatus.PENDING.value,
        "source_job_id": job_id,
        "input_video_path": input_video_path,
        "options": options,
        "resolution": source_data.get("resolution", "480p"),
        "credits_charged": credits_to_charge,
        "output_video_path": None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }

    try:
        # Create job document
        job_ref = db.collection("jobs").document(new_job_id)
        job_ref.set(job_data)

        # Determine output path
        output_suffix = "subtitled" if request.post_process_type == PostProcessType.SUBTITLES else "watermarked"
        output_path = f"processed/{new_job_id}/{output_suffix}.mp4"

        # Enqueue to FFmpeg worker
        task_name = enqueue_ffmpeg_job(
            job_id=new_job_id,
            job_type=request.post_process_type.value,
            input_video_path=input_video_path,
            output_path=output_path,
            options=options
        )
        logger.info(f"Post-process job {new_job_id} enqueued: {task_name}")

        # Update status to queued
        job_ref.update({
            "status": JobStatus.QUEUED.value,
            "updated_at": datetime.now(timezone.utc),
        })

        return PostProcessResponse(
            job_id=new_job_id,
            source_job_id=job_id,
            post_process_type=request.post_process_type,
            status=JobStatus.QUEUED,
            credits_charged=credits_to_charge
        )

    except Exception as e:
        logger.error(f"Failed to create post-process job: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create post-process job: {str(e)}")
