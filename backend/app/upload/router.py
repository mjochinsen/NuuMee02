"""Upload routes for GCS signed URL generation."""
import os
import requests
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import storage
from google.auth import default
from google.auth.transport import requests as google_requests
from google.auth import impersonated_credentials

from .models import SignedUrlRequest, SignedUrlResponse, FileType
from ..middleware.auth import get_current_user_id


router = APIRouter(prefix="/upload", tags=["Upload"])


# GCS bucket configuration
IMAGE_BUCKET = os.getenv("GCS_IMAGE_BUCKET", "nuumee-images")
VIDEO_BUCKET = os.getenv("GCS_VIDEO_BUCKET", "nuumee-videos")

# Signed URL expiration time (in minutes)
SIGNED_URL_EXPIRATION_MINUTES = 15

# Cache for signing credentials
_signing_credentials = None
_service_account_email = None


def _get_service_account_email():
    """
    Get the service account email from Cloud Run metadata server or environment.
    """
    # First check environment variable (can be set explicitly)
    sa_email = os.getenv("SERVICE_ACCOUNT_EMAIL")
    if sa_email:
        return sa_email

    # Try to get from Cloud Run metadata server
    try:
        response = requests.get(
            "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
            headers={"Metadata-Flavor": "Google"},
            timeout=2
        )
        if response.status_code == 200:
            return response.text
    except Exception:
        pass

    # Fallback to hardcoded value for this project
    return "nuumee-api@wanapi-prod.iam.gserviceaccount.com"


def _get_signing_credentials():
    """
    Get credentials that can sign blobs using IAM impersonation.

    On Cloud Run, we use credential impersonation to get signing capabilities.
    """
    global _signing_credentials, _service_account_email

    if _signing_credentials is not None:
        return _signing_credentials, _service_account_email

    # Get default credentials
    source_credentials, project = default()

    # Get service account email from metadata server
    _service_account_email = _get_service_account_email()

    # Create impersonated credentials with signing capability
    _signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=_service_account_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,  # 1 hour
    )

    return _signing_credentials, _service_account_email


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

        # Get signing credentials (impersonated for Cloud Run)
        signing_creds, service_account_email = _get_signing_credentials()

        # Generate signed URL using impersonated credentials
        # The impersonated credentials can sign blobs via IAM
        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=expiration,
            method="PUT",
            content_type=request.content_type,
            credentials=signing_creds,
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
