"""GCS (Google Cloud Storage) utilities."""

import logging
from datetime import timedelta
from typing import Optional

import httpx

from .gcp import get_storage
from .auth_utils import get_signing_credentials

logger = logging.getLogger(__name__)


def generate_signed_url(
    bucket_name: str,
    blob_path: str,
    expiration: int = 3600,
    worker_type: str = "default"
) -> str:
    """Generate a signed URL for GCS object.

    Uses IAM impersonation to get signing credentials on Cloud Run,
    since the default Compute Engine credentials cannot sign URLs.

    Args:
        bucket_name: GCS bucket name
        blob_path: Path within bucket
        expiration: URL expiration in seconds (default 1 hour)
        worker_type: Worker type for credentials lookup

    Returns:
        Signed URL string
    """
    signing_creds = get_signing_credentials(worker_type)

    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
        credentials=signing_creds,
    )
    return url


def download_from_gcs(bucket_name: str, blob_path: str, local_path: str) -> None:
    """Download file from GCS to local path.

    Args:
        bucket_name: GCS bucket name
        blob_path: Path within bucket
        local_path: Local file path to download to
    """
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.download_to_filename(local_path)
    logger.info(f"Downloaded gs://{bucket_name}/{blob_path} to {local_path}")


def upload_to_gcs(
    local_path: str,
    bucket_name: str,
    blob_path: str,
    content_type: str = "video/mp4"
) -> str:
    """Upload local file to GCS.

    Args:
        local_path: Local file path to upload
        bucket_name: Target GCS bucket
        blob_path: Target path in bucket
        content_type: MIME content type (default video/mp4)

    Returns:
        GCS URI (gs://bucket/path)
    """
    client = get_storage()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)
    blob.upload_from_filename(local_path, content_type=content_type)
    logger.info(f"Uploaded {local_path} to gs://{bucket_name}/{blob_path}")
    return f"gs://{bucket_name}/{blob_path}"


def upload_from_url(
    source_url: str,
    bucket_name: str,
    blob_path: str,
    timeout: int = 300
) -> str:
    """Download file from URL and upload to GCS.

    Args:
        source_url: URL to download from
        bucket_name: Target GCS bucket
        blob_path: Target path in bucket
        timeout: Request timeout in seconds

    Returns:
        GCS URI (gs://bucket/path)
    """
    logger.info(f"Downloading from {source_url}")

    # Download file
    with httpx.Client(timeout=timeout) as client:
        response = client.get(source_url)
        response.raise_for_status()
        content = response.content

    logger.info(f"Downloaded {len(content)} bytes, uploading to gs://{bucket_name}/{blob_path}")

    # Upload to GCS
    storage_client = get_storage()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    # Detect content type from response
    content_type = response.headers.get("content-type", "video/mp4")
    blob.upload_from_string(content, content_type=content_type)

    return f"gs://{bucket_name}/{blob_path}"
