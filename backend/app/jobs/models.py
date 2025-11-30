"""Pydantic models for job management."""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Job status values."""
    PENDING = "pending"
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobType(str, Enum):
    """Job type values."""
    ANIMATE = "animate"  # Wan 2.2 Animate (image-to-video)
    EXTEND = "extend"  # Wan 2.5 Video Extend
    UPSCALE = "upscale"  # Video Upscaler Pro
    FOLEY = "foley"  # Hunyuan Video Foley (add audio)


class Resolution(str, Enum):
    """Supported resolutions."""
    RES_480P = "480p"
    RES_720P = "720p"


class CreateJobRequest(BaseModel):
    """Request to create a new video generation job."""
    job_type: JobType = Field(
        default=JobType.ANIMATE,
        description="Type of job to create"
    )
    reference_image_path: str = Field(
        ...,
        description="GCS path to reference image (from upload endpoint)"
    )
    motion_video_path: str = Field(
        ...,
        description="GCS path to motion source video (from upload endpoint)"
    )
    resolution: Resolution = Field(
        default=Resolution.RES_480P,
        description="Output resolution (480p or 720p)"
    )
    seed: Optional[int] = Field(
        default=None,
        description="Random seed (-1 for random)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "job_type": "animate",
                "reference_image_path": "uploads/user123/1234567890_reference.jpg",
                "motion_video_path": "uploads/user123/1234567890_video.mp4",
                "resolution": "720p",
                "seed": None
            }
        }


class JobResponse(BaseModel):
    """Response containing job details."""
    id: str = Field(..., description="Job ID")
    user_id: str = Field(..., description="User who created the job")
    job_type: JobType = Field(..., description="Type of job")
    status: JobStatus = Field(..., description="Current job status")
    reference_image_path: str = Field(..., description="GCS path to reference image")
    motion_video_path: str = Field(..., description="GCS path to motion video")
    resolution: Resolution = Field(..., description="Output resolution")
    seed: Optional[int] = Field(None, description="Random seed used")
    credits_charged: float = Field(..., description="Credits charged for this job")
    wavespeed_request_id: Optional[str] = Field(None, description="WaveSpeed API request ID")
    output_video_path: Optional[str] = Field(None, description="GCS path to output video")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="When job was created")
    updated_at: datetime = Field(..., description="When job was last updated")
    completed_at: Optional[datetime] = Field(None, description="When job completed")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "job_abc123",
                "user_id": "user_xyz",
                "job_type": "animate",
                "status": "processing",
                "reference_image_path": "uploads/user_xyz/1234567890_reference.jpg",
                "motion_video_path": "uploads/user_xyz/1234567890_video.mp4",
                "resolution": "720p",
                "seed": 42,
                "credits_charged": 5.0,
                "wavespeed_request_id": "pred_abc123",
                "output_video_path": None,
                "error_message": None,
                "created_at": "2025-01-01T10:00:00Z",
                "updated_at": "2025-01-01T10:05:00Z",
                "completed_at": None
            }
        }


class JobListResponse(BaseModel):
    """Response containing list of jobs."""
    jobs: List[JobResponse] = Field(..., description="List of jobs")
    total: int = Field(..., description="Total number of jobs")
    page: int = Field(..., description="Current page")
    page_size: int = Field(..., description="Items per page")

    class Config:
        json_schema_extra = {
            "example": {
                "jobs": [],
                "total": 0,
                "page": 1,
                "page_size": 20
            }
        }


class CreditCostResponse(BaseModel):
    """Response for credit cost calculation."""
    job_type: JobType = Field(..., description="Job type")
    resolution: Resolution = Field(..., description="Resolution")
    estimated_credits: float = Field(..., description="Estimated credit cost")
    estimated_duration_seconds: Optional[int] = Field(
        None,
        description="Estimated video duration in seconds"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "job_type": "animate",
                "resolution": "720p",
                "estimated_credits": 5.0,
                "estimated_duration_seconds": 30
            }
        }
