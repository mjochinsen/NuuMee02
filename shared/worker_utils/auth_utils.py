"""Authentication and credential utilities for GCS signing."""

import os
import logging
from typing import Optional

from google.auth import default as auth_default
from google.auth import impersonated_credentials
import requests

from .config import SERVICE_ACCOUNT_DEFAULTS

logger = logging.getLogger(__name__)

# Cached credentials
_signing_credentials = None
_service_account_email: Optional[str] = None


def get_service_account_email(worker_type: str = "default") -> str:
    """Get service account email from metadata server or environment.

    Args:
        worker_type: Type of worker ("worker", "ffmpeg-worker", "default")
                     Used to determine fallback email if not found elsewhere.

    Returns:
        Service account email string
    """
    global _service_account_email
    if _service_account_email is not None:
        return _service_account_email

    # Try environment variable first
    sa_email = os.environ.get("SERVICE_ACCOUNT_EMAIL")
    if sa_email:
        _service_account_email = sa_email
        return sa_email

    # Try metadata server (Cloud Run)
    try:
        response = requests.get(
            "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
            headers={"Metadata-Flavor": "Google"},
            timeout=2
        )
        if response.status_code == 200:
            _service_account_email = response.text
            return _service_account_email
    except Exception:
        pass

    # Fallback to worker-type-specific default
    _service_account_email = SERVICE_ACCOUNT_DEFAULTS.get(
        worker_type,
        SERVICE_ACCOUNT_DEFAULTS["default"]
    )
    return _service_account_email


def get_signing_credentials(worker_type: str = "default"):
    """Get impersonated credentials for signing GCS URLs.

    Args:
        worker_type: Type of worker for service account lookup

    Returns:
        Impersonated credentials with signing capability
    """
    global _signing_credentials

    if _signing_credentials is not None:
        return _signing_credentials

    # Get default credentials
    source_credentials, project = auth_default()

    # Get service account email
    sa_email = get_service_account_email(worker_type)

    # Create impersonated credentials with signing capability
    _signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=sa_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,
    )

    return _signing_credentials


def reset_credentials():
    """Reset cached credentials. Useful for testing."""
    global _signing_credentials, _service_account_email
    _signing_credentials = None
    _service_account_email = None
