"""Pydantic models for upload endpoints."""
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class FileType(str, Enum):
    """Supported file types for upload."""
    IMAGE = "image"
    VIDEO = "video"


class SignedUrlRequest(BaseModel):
    """Request model for signed URL generation."""
    file_type: FileType = Field(..., description="Type of file (image or video)")
    file_name: str = Field(..., description="Original file name with extension")
    content_type: str = Field(..., description="MIME type (e.g., image/jpeg, video/mp4)")

    class Config:
        json_schema_extra = {
            "example": {
                "file_type": "image",
                "file_name": "reference.jpg",
                "content_type": "image/jpeg"
            }
        }


class SignedUrlResponse(BaseModel):
    """Response model with GCS signed URL."""
    upload_url: str = Field(..., description="GCS signed URL for direct upload")
    file_path: str = Field(..., description="GCS file path where the file will be stored")
    bucket_name: str = Field(..., description="GCS bucket name")
    expires_at: datetime = Field(..., description="When the signed URL expires")

    class Config:
        json_schema_extra = {
            "example": {
                "upload_url": "https://storage.googleapis.com/...",
                "file_path": "uploads/user123/1234567890_reference.jpg",
                "bucket_name": "nuumee-images",
                "expires_at": "2024-01-01T12:15:00Z"
            }
        }
