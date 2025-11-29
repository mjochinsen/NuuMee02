"""Upload routes for GCS signed URL generation."""
import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import storage

from .models import SignedUrlRequest, SignedUrlResponse, FileType
from ..middleware.auth import get_current_user_id


router = APIRouter(prefix="/upload", tags=["Upload"])


# GCS bucket configuration
IMAGE_BUCKET = os.getenv("GCS_IMAGE_BUCKET", "nuumee-images")
VIDEO_BUCKET = os.getenv("GCS_VIDEO_BUCKET", "nuumee-videos")

# Signed URL expiration time (in minutes)
SIGNED_URL_EXPIRATION_MINUTES = 15


def _get_storage_client():
    """Get GCS storage client."""
    return storage.Client()


def _get_bucket_name(file_type: FileType) -> str:
    """Get the appropriate bucket name based on file type."""
    if file_type == FileType.IMAGE:
        return IMAGE_BUCKET
    elif file_type == FileType.VIDEO:
        return VIDEO_BUCKET
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def _generate_unique_path(user_id: str, file_name: str) -> str:
    """
    Generate a unique file path for GCS.

    Format: uploads/{user_id}/{timestamp}_{filename}
    Example: uploads/abc123/1701432000_reference.jpg
    """
    timestamp = int(datetime.now(timezone.utc).timestamp())
    # Sanitize filename (keep extension)
    safe_filename = file_name.replace(" ", "_").replace("/", "_")
    return f"uploads/{user_id}/{timestamp}_{safe_filename}"


def _validate_content_type(content_type: str, file_type: FileType):
    """Validate that content_type matches file_type."""
    if file_type == FileType.IMAGE:
        allowed_types = [
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
        ]
        if content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid content type for image. Allowed: {', '.join(allowed_types)}"
            )
    elif file_type == FileType.VIDEO:
        allowed_types = [
            "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"
        ]
        if content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid content type for video. Allowed: {', '.join(allowed_types)}"
            )


@router.post("/signed-url", response_model=SignedUrlResponse)
async def generate_signed_url(
    request: SignedUrlRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate a GCS signed URL for direct file upload.

    This endpoint:
    1. Validates the file type and content type
    2. Generates a unique file path with user_id and timestamp
    3. Creates a signed URL valid for 15 minutes
    4. Returns the URL and metadata for the client to upload directly to GCS

    Requires authentication via Firebase ID token.

    **Usage:**
    1. Client calls this endpoint to get a signed URL
    2. Client uploads file directly to the signed URL using PUT request
    3. Client stores the file_path for later use (e.g., job creation)

    **Security:**
    - Each URL is unique to the authenticated user
    - URLs expire after 15 minutes
    - Only specified content type can be uploaded
    """
    # Validate content type matches file type
    _validate_content_type(request.content_type, request.file_type)

    # Get bucket name
    bucket_name = _get_bucket_name(request.file_type)

    # Generate unique file path
    file_path = _generate_unique_path(user_id, request.file_name)

    # Create storage client and get bucket
    try:
        client = _get_storage_client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(file_path)

        # Calculate expiration time
        expiration = datetime.now(timezone.utc) + timedelta(minutes=SIGNED_URL_EXPIRATION_MINUTES)

        # Generate signed URL for PUT operation
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=expiration,
            method="PUT",
            content_type=request.content_type,
        )

        return SignedUrlResponse(
            upload_url=signed_url,
            file_path=file_path,
            bucket_name=bucket_name,
            expires_at=expiration
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate signed URL: {str(e)}"
        )
