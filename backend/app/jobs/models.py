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
    SUBTITLES = "subtitles"  # Auto-generated subtitles (FFmpeg worker)
    WATERMARK = "watermark"  # Watermark overlay (FFmpeg worker)


class SubtitleStyle(str, Enum):
    """Available subtitle styles."""
    SIMPLE = "simple"  # Clean white text with subtle glow
    RAINBOW_BOUNCE = "rainbow_bounce"  # Colorful cycling with pop animation
    BOLD_SHINE = "bold_shine"  # Yellow text with glow effect


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
    # ANIMATE job fields (required for ANIMATE, ignored for EXTEND/UPSCALE)
    reference_image_path: Optional[str] = Field(
        default=None,
        description="GCS path to reference image (required for ANIMATE jobs)"
    )
    motion_video_path: Optional[str] = Field(
        default=None,
        description="GCS path to motion source video (required for ANIMATE jobs)"
    )
    # EXTEND/UPSCALE job fields
    source_job_id: Optional[str] = Field(
        default=None,
        description="ID of the source job to extend/upscale (required for EXTEND/UPSCALE jobs)"
    )
    input_video_path: Optional[str] = Field(
        default=None,
        description="GCS path to input video for processing (auto-populated from source_job_id)"
    )
    extension_prompt: Optional[str] = Field(
        default=None,
        description="Prompt for video extension (optional for EXTEND jobs)"
    )
    # Common fields
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
            "examples": [
                {
                    "title": "ANIMATE job",
                    "job_type": "animate",
                    "reference_image_path": "uploads/user123/1234567890_reference.jpg",
                    "motion_video_path": "uploads/user123/1234567890_video.mp4",
                    "resolution": "720p",
                    "seed": None
                },
                {
                    "title": "EXTEND job",
                    "job_type": "extend",
                    "source_job_id": "job_abc123",
                    "extension_prompt": "The character continues walking forward",
                    "resolution": "720p"
                },
                {
                    "title": "UPSCALE job",
                    "job_type": "upscale",
                    "source_job_id": "job_abc123",
                    "resolution": "720p"
                }
            ]
        }


class JobResponse(BaseModel):
    """Response containing job details."""
    id: str = Field(..., description="Job ID")
    short_id: Optional[str] = Field(None, description="Short ID for public sharing URLs")
    share_url: Optional[str] = Field(None, description="Public share URL (nuumee.ai/v/{short_id})")
    user_id: str = Field(..., description="User who created the job")
    job_type: JobType = Field(..., description="Type of job")
    status: JobStatus = Field(..., description="Current job status")
    # ANIMATE job fields (may be empty for EXTEND/UPSCALE)
    reference_image_path: Optional[str] = Field(None, description="GCS path to reference image")
    motion_video_path: Optional[str] = Field(None, description="GCS path to motion video")
    # EXTEND/UPSCALE job fields
    source_job_id: Optional[str] = Field(None, description="ID of source job (for EXTEND/UPSCALE)")
    input_video_path: Optional[str] = Field(None, description="GCS path to input video for processing")
    extension_prompt: Optional[str] = Field(None, description="Extension prompt (for EXTEND)")
    # Common fields
    resolution: Resolution = Field(..., description="Output resolution")
    seed: Optional[int] = Field(None, description="Random seed used")
    credits_charged: float = Field(..., description="Credits charged for this job")
    wavespeed_request_id: Optional[str] = Field(None, description="WaveSpeed API request ID")
    output_video_path: Optional[str] = Field(None, description="GCS path to output video")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="When job was created")
    updated_at: datetime = Field(..., description="When job was last updated")
    completed_at: Optional[datetime] = Field(None, description="When job completed")
    view_count: int = Field(default=0, description="Number of video views")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "job_abc123",
                "short_id": "a1b2c3d4e5f6",
                "share_url": "https://nuumee.ai/v/a1b2c3d4e5f6",
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
                "completed_at": None,
                "view_count": 0
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


class JobOutputResponse(BaseModel):
    """Response containing signed download URL for job output."""
    job_id: str = Field(..., description="Job ID")
    download_url: str = Field(..., description="Signed GCS download URL")
    expires_in_seconds: int = Field(default=3600, description="URL expiration time in seconds")
    filename: str = Field(..., description="Output video filename")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_abc123",
                "download_url": "https://storage.googleapis.com/nuumee-outputs/...",
                "expires_in_seconds": 3600,
                "filename": "job_abc123.mp4"
            }
        }


class PostProcessType(str, Enum):
    """Post-processing types for completed videos."""
    SUBTITLES = "subtitles"
    WATERMARK = "watermark"


class PostProcessRequest(BaseModel):
    """Request to add post-processing to a completed video."""
    post_process_type: PostProcessType = Field(
        ...,
        description="Type of post-processing to apply"
    )
    subtitle_style: Optional[SubtitleStyle] = Field(
        default=SubtitleStyle.SIMPLE,
        description="Subtitle style (only for subtitles type)"
    )
    script_content: Optional[str] = Field(
        default=None,
        description="Original script text to improve STT accuracy (only for subtitles type)"
    )
    watermark_enabled: bool = Field(
        default=False,
        description="Enable watermark (only for watermark type)"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "title": "Add subtitles",
                    "post_process_type": "subtitles",
                    "subtitle_style": "rainbow"
                },
                {
                    "title": "Add watermark",
                    "post_process_type": "watermark",
                    "watermark_enabled": True
                }
            ]
        }


class PostProcessResponse(BaseModel):
    """Response for post-processing request."""
    job_id: str = Field(..., description="New job ID for the post-processing task")
    source_job_id: str = Field(..., description="Original job ID")
    post_process_type: PostProcessType = Field(..., description="Type of post-processing")
    status: JobStatus = Field(..., description="Job status")
    credits_charged: float = Field(..., description="Credits charged (0 for free features)")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_xyz789",
                "source_job_id": "job_abc123",
                "post_process_type": "subtitles",
                "status": "queued",
                "credits_charged": 0.0
            }
        }
