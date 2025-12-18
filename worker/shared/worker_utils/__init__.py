"""Shared worker utilities for NuuMee.

This package provides common functionality used by both the main worker
and the FFmpeg worker, including:

- GCP client initialization (Firestore, Storage)
- GCS utilities (signed URLs, upload, download)
- Firestore operations (job status updates, credit refunds)
- Stripe utilities (auto-refill)
- Authentication utilities (service account, signing credentials)
"""

from .gcp import get_firestore, get_storage, get_secret, PROJECT_ID
from .gcs_utils import (
    generate_signed_url,
    download_from_gcs,
    upload_to_gcs,
    upload_from_url,
)
from .firestore_utils import (
    update_job_status,
    refund_credits,
    is_user_free_tier,
)
from .auth_utils import (
    get_service_account_email,
    get_signing_credentials,
)
from .config import (
    IMAGE_BUCKET,
    VIDEO_BUCKET,
    OUTPUT_BUCKET,
    ASSETS_BUCKET,
    CREDIT_PACKAGES,
)

__all__ = [
    # GCP clients
    "get_firestore",
    "get_storage",
    "get_secret",
    "PROJECT_ID",
    # GCS utilities
    "generate_signed_url",
    "download_from_gcs",
    "upload_to_gcs",
    "upload_from_url",
    # Firestore utilities
    "update_job_status",
    "refund_credits",
    "is_user_free_tier",
    # Auth utilities
    "get_service_account_email",
    "get_signing_credentials",
    # Config
    "IMAGE_BUCKET",
    "VIDEO_BUCKET",
    "OUTPUT_BUCKET",
    "ASSETS_BUCKET",
    "CREDIT_PACKAGES",
]
