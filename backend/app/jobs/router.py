"""Job management routes."""

import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from google.cloud import firestore, storage

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
)
from ..metrics import metrics
from .services import (
    calculate_credits,
    generate_job_id,
    generate_short_id,
    validate_gcs_path_ownership,
    validate_source_job,
    is_demo_job,
    generate_signed_download_url,
    DEMO_IMAGE_PATH,
    DEMO_VIDEO_PATH,
    DEMO_OUTPUT_PATH,
    MIN_CREDITS,
    DEFAULT_DURATION_SECONDS,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id
from ..tasks.queue import enqueue_job, enqueue_ffmpeg_job

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


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

    source_job_data = None
    input_video_path = None
    source_base_credits = None

    # Check if this is a demo job
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
        if not request.reference_image_path or not request.motion_video_path:
            raise HTTPException(
                status_code=400,
                detail="ANIMATE jobs require reference_image_path and motion_video_path"
            )
        if not demo_mode:
            validate_gcs_path_ownership(request.reference_image_path, user_id, "reference image")
            validate_gcs_path_ownership(request.motion_video_path, user_id, "motion video")

    elif request.job_type in (JobType.EXTEND, JobType.UPSCALE):
        if not request.source_job_id:
            raise HTTPException(
                status_code=400,
                detail=f"{request.job_type.value.upper()} jobs require source_job_id"
            )
        source_job_data = await validate_source_job(db, request.source_job_id, user_id)
        input_video_path = source_job_data.get("output_video_path")
        source_base_credits = source_job_data.get("credits_charged", MIN_CREDITS)

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    current_credits = user_data.get("credits_balance", 0)

    # Calculate credit cost - use actual duration from request, fallback to default
    duration = request.motion_video_duration_seconds or DEFAULT_DURATION_SECONDS
    credits_to_charge = calculate_credits(
        request.job_type,
        request.resolution,
        duration_seconds=duration,
        source_base_credits=source_base_credits
    )

    if demo_mode:
        credits_to_charge = 0.0

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

    job_id = generate_job_id()
    short_id = generate_short_id()
    now = datetime.now(timezone.utc)

    ref_image_path = DEMO_IMAGE_PATH if demo_mode else request.reference_image_path
    motion_path = DEMO_VIDEO_PATH if demo_mode else request.motion_video_path

    job_data = {
        "id": job_id,
        "short_id": short_id,
        "user_id": user_id,
        "job_type": request.job_type.value,
        "status": JobStatus.COMPLETED.value if demo_mode else JobStatus.PENDING.value,
        "reference_image_path": ref_image_path,
        "motion_video_path": motion_path,
        "source_job_id": request.source_job_id,
        "input_video_path": input_video_path,
        "extension_prompt": request.extension_prompt,
        "resolution": request.resolution.value,
        "seed": request.seed,
        "credits_charged": credits_to_charge,
        "wavespeed_request_id": "demo" if demo_mode else None,
        "output_video_path": DEMO_OUTPUT_PATH if demo_mode else None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": now if demo_mode else None,
        "view_count": 0,
        "is_demo": demo_mode,
    }

    # Demo jobs: just create, no credit deduction
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
            raise HTTPException(status_code=500, detail=f"Failed to create demo job: {str(e)}")

    # Regular jobs: transaction to deduct credits
    @firestore.transactional
    def create_job_transaction(transaction, user_ref, job_ref, job_data, credits_to_charge):
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

        new_balance = current_balance - credits_to_charge
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        transaction.set(job_ref, job_data)
        return new_balance

    try:
        job_ref = db.collection("jobs").document(job_id)
        transaction = db.transaction()
        create_job_transaction(transaction, user_ref, job_ref, job_data, credits_to_charge)

        try:
            task_name = enqueue_job(job_id)
            logger.info(f"Job {job_id} enqueued: {task_name}")
            job_ref.update({
                "status": JobStatus.QUEUED.value,
                "updated_at": datetime.now(timezone.utc),
            })
            job_status = JobStatus.QUEUED
        except Exception as e:
            logger.error(f"Failed to enqueue job {job_id}: {e}")
            job_status = JobStatus.PENDING

        # Track job creation in metrics
        metrics.track_job_created()

        return JobResponse(
            id=job_id,
            short_id=short_id,
            share_url=f"https://nuumee.ai/v/{short_id}",
            user_id=user_id,
            job_type=request.job_type,
            status=job_status,
            reference_image_path=request.reference_image_path,
            motion_video_path=request.motion_video_path,
            source_job_id=request.source_job_id,
            input_video_path=input_video_path,
            extension_prompt=request.extension_prompt,
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
        raise HTTPException(status_code=500, detail=f"Failed to create job: {str(e)}")


@router.get("", response_model=JobListResponse)
async def list_jobs(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[JobStatus] = Query(None, description="Filter by status"),
):
    """List all jobs for the authenticated user."""
    db = get_firestore_client()

    query = db.collection("jobs").where("user_id", "==", user_id)
    if status:
        query = query.where("status", "==", status.value)
    query = query.order_by("created_at", direction=firestore.Query.DESCENDING)

    all_docs = [doc for doc in query.stream() if not doc.to_dict().get("deleted_at")]
    total = len(all_docs)

    offset = (page - 1) * page_size
    paginated_docs = all_docs[offset:offset + page_size]

    jobs = []
    for doc in paginated_docs:
        data = doc.to_dict()
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
            reference_image_path=data.get("reference_image_path"),
            motion_video_path=data.get("motion_video_path"),
            source_job_id=data.get("source_job_id"),
            input_video_path=data.get("input_video_path"),
            extension_prompt=data.get("extension_prompt"),
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

    return JobListResponse(jobs=jobs, total=total, page=page, page_size=page_size)


@router.get("/cost", response_model=CreditCostResponse)
async def estimate_cost(
    job_type: JobType = Query(JobType.ANIMATE, description="Job type"),
    resolution: Resolution = Query(Resolution.RES_480P, description="Resolution"),
    duration_seconds: int = Query(10, ge=5, le=120, description="Estimated video duration"),
):
    """Estimate credit cost for a job (no auth required)."""
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
    """Get details of a specific job."""
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this job")

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
        reference_image_path=data.get("reference_image_path"),
        motion_video_path=data.get("motion_video_path"),
        source_job_id=data.get("source_job_id"),
        input_video_path=data.get("input_video_path"),
        extension_prompt=data.get("extension_prompt"),
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


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a job (soft delete) and its associated files."""
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    # Delete associated files from GCS
    try:
        upload_bucket = os.getenv("UPLOAD_BUCKET", "nuumee-uploads")
        output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")
        client = storage.Client()

        if data.get("reference_image_path"):
            try:
                bucket = client.bucket(upload_bucket)
                bucket.blob(data["reference_image_path"]).delete()
            except Exception as e:
                logger.warning(f"Failed to delete reference image: {e}")

        if data.get("motion_video_path"):
            try:
                bucket = client.bucket(upload_bucket)
                bucket.blob(data["motion_video_path"]).delete()
            except Exception as e:
                logger.warning(f"Failed to delete motion video: {e}")

        if data.get("output_video_path"):
            try:
                bucket = client.bucket(output_bucket)
                bucket.blob(data["output_video_path"]).delete()
            except Exception as e:
                logger.warning(f"Failed to delete output video: {e}")

    except Exception as e:
        logger.error(f"Error during file cleanup for job {job_id}: {e}")

    # Soft delete
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
    """Get signed URLs for job input files."""
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

    image_bucket = os.getenv("GCS_IMAGE_BUCKET", "nuumee-images")
    video_bucket = os.getenv("GCS_VIDEO_BUCKET", "nuumee-videos")
    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    result = {
        "job_id": job_id,
        "reference_image_url": None,
        "motion_video_url": None,
        "input_video_url": None,
        "output_video_url": None,
    }

    if data.get("reference_image_path"):
        try:
            result["reference_image_url"] = generate_signed_download_url(
                image_bucket, data["reference_image_path"], 3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate reference image URL: {e}")

    if data.get("motion_video_path"):
        try:
            result["motion_video_url"] = generate_signed_download_url(
                video_bucket, data["motion_video_path"], 3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate motion video URL: {e}")

    if data.get("input_video_path"):
        try:
            result["input_video_url"] = generate_signed_download_url(
                output_bucket, data["input_video_path"], 3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate input video URL: {e}")

    if data.get("output_video_path"):
        try:
            result["output_video_url"] = generate_signed_download_url(
                output_bucket, data["output_video_path"], 3600
            )
        except Exception as e:
            logger.warning(f"Failed to generate output video URL: {e}")

    return result


@router.get("/{job_id}/output", response_model=JobOutputResponse)
async def get_job_output(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get download URL for completed job output video."""
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    data = job_doc.to_dict()

    if data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

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

    output_path = data.get("output_video_path")
    if not output_path:
        raise HTTPException(status_code=404, detail="No output video available for this job")

    output_bucket = os.getenv("OUTPUT_BUCKET", "nuumee-outputs")

    try:
        download_url = generate_signed_download_url(output_bucket, output_path, 3600)
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
    """Create a post-processing job (subtitles or watermark)."""
    db = get_firestore_client()

    source_job_ref = db.collection("jobs").document(job_id)
    source_job_doc = source_job_ref.get()

    if not source_job_doc.exists:
        raise HTTPException(status_code=404, detail="Source job not found")

    source_data = source_job_doc.to_dict()

    if source_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to process this job")

    if source_data.get("status") != JobStatus.COMPLETED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Source job must be completed. Current status: {source_data.get('status')}"
        )

    input_video_path = source_data.get("output_video_path")
    if not input_video_path:
        raise HTTPException(status_code=400, detail="Source job has no output video")

    new_job_id = generate_job_id()
    now = datetime.now(timezone.utc)

    job_type_map = {
        PostProcessType.SUBTITLES: JobType.SUBTITLES,
        PostProcessType.WATERMARK: JobType.WATERMARK,
    }
    new_job_type = job_type_map[request.post_process_type]

    options = {}
    if request.post_process_type == PostProcessType.SUBTITLES:
        options["subtitle_style"] = request.subtitle_style.value if request.subtitle_style else "simple"
        if request.script_content:
            options["script_content"] = request.script_content
    elif request.post_process_type == PostProcessType.WATERMARK:
        options["watermark_path"] = "assets/watermark.png"
        options["position"] = "bottom-right"
        options["opacity"] = 0.7

    job_data = {
        "id": new_job_id,
        "user_id": user_id,
        "job_type": new_job_type.value,
        "status": JobStatus.PENDING.value,
        "source_job_id": job_id,
        "input_video_path": input_video_path,
        "options": options,
        "resolution": source_data.get("resolution", "480p"),
        "credits_charged": 0.0,
        "output_video_path": None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }

    try:
        job_ref = db.collection("jobs").document(new_job_id)
        job_ref.set(job_data)

        output_suffix = "subtitled" if request.post_process_type == PostProcessType.SUBTITLES else "watermarked"
        output_path = f"processed/{new_job_id}/{output_suffix}.mp4"

        task_name = enqueue_ffmpeg_job(
            job_id=new_job_id,
            job_type=request.post_process_type.value,
            input_video_path=input_video_path,
            output_path=output_path,
            options=options
        )
        logger.info(f"Post-process job {new_job_id} enqueued: {task_name}")

        job_ref.update({
            "status": JobStatus.QUEUED.value,
            "updated_at": datetime.now(timezone.utc),
        })

        return PostProcessResponse(
            job_id=new_job_id,
            source_job_id=job_id,
            post_process_type=request.post_process_type,
            status=JobStatus.QUEUED,
            credits_charged=0.0
        )

    except Exception as e:
        logger.error(f"Failed to create post-process job: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create post-process job: {str(e)}")


@router.post("/{job_id}/watermark", response_model=PostProcessResponse)
async def create_watermark_job(
    job_id: str,
    position: str = Form(default="bottom-right"),
    opacity: str = Form(default="0.7"),
    watermark_image: Optional[UploadFile] = File(default=None),
    user_id: str = Depends(get_current_user_id),
):
    """Create a watermark job with custom image upload."""
    db = get_firestore_client()

    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    source_data = job_doc.to_dict()

    if source_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

    if source_data.get("status") != JobStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Source job must be completed")

    input_video_path = source_data.get("output_video_path")
    if not input_video_path:
        raise HTTPException(status_code=400, detail="Source job has no output video")

    new_job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    try:
        opacity_float = max(0.0, min(1.0, float(opacity)))
    except ValueError:
        opacity_float = 0.7

    valid_positions = ["bottom-right", "bottom-left", "top-right", "top-left"]
    if position not in valid_positions:
        position = "bottom-right"

    watermark_gcs_path = "assets/watermark.png"
    if watermark_image:
        try:
            content = await watermark_image.read()
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Watermark image must be under 5MB")

            storage_client = storage.Client()
            bucket = storage_client.bucket("nuumee-assets")
            watermark_gcs_path = f"watermarks/{new_job_id}/watermark.png"
            blob = bucket.blob(watermark_gcs_path)
            content_type = watermark_image.content_type or "image/png"
            blob.upload_from_string(content, content_type=content_type)
            logger.info(f"Uploaded custom watermark to gs://nuumee-assets/{watermark_gcs_path}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to upload watermark: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload watermark image")

    options = {
        "watermark_path": watermark_gcs_path,
        "position": position,
        "opacity": opacity_float,
    }

    job_data = {
        "id": new_job_id,
        "user_id": user_id,
        "job_type": JobType.WATERMARK.value,
        "status": JobStatus.PENDING.value,
        "source_job_id": job_id,
        "input_video_path": input_video_path,
        "options": options,
        "resolution": source_data.get("resolution", "480p"),
        "credits_charged": 0.0,
        "output_video_path": None,
        "error_message": None,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }

    try:
        job_ref = db.collection("jobs").document(new_job_id)
        job_ref.set(job_data)

        output_path = f"processed/{new_job_id}/watermarked.mp4"

        task_name = enqueue_ffmpeg_job(
            job_id=new_job_id,
            job_type="watermark",
            input_video_path=input_video_path,
            output_path=output_path,
            options=options
        )
        logger.info(f"Watermark job {new_job_id} enqueued: {task_name}")

        job_ref.update({
            "status": JobStatus.QUEUED.value,
            "updated_at": datetime.now(timezone.utc),
        })

        return PostProcessResponse(
            job_id=new_job_id,
            source_job_id=job_id,
            post_process_type=PostProcessType.WATERMARK,
            status=JobStatus.QUEUED,
            credits_charged=0.0
        )

    except Exception as e:
        logger.error(f"Failed to create watermark job: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create watermark job: {str(e)}")
