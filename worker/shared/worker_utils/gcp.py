"""GCP client initialization utilities."""

import os
import logging
from typing import Optional

from google.cloud import firestore, storage, secretmanager

from .config import PROJECT_ID

logger = logging.getLogger(__name__)

# Lazy-initialized clients
_db: Optional[firestore.Client] = None
_storage_client: Optional[storage.Client] = None
_secret_client: Optional[secretmanager.SecretManagerServiceClient] = None


def get_firestore() -> firestore.Client:
    """Get Firestore client (lazy initialization)."""
    global _db
    if _db is None:
        _db = firestore.Client(project=PROJECT_ID)
    return _db


def get_storage() -> storage.Client:
    """Get Storage client (lazy initialization)."""
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=PROJECT_ID)
    return _storage_client


def get_secret(secret_name: str, project_id: str = None) -> str:
    """Get secret value from Secret Manager.

    Args:
        secret_name: Name of the secret
        project_id: Optional project ID (defaults to PROJECT_ID)

    Returns:
        Secret value as string

    Raises:
        Exception: If secret cannot be retrieved
    """
    global _secret_client
    if _secret_client is None:
        _secret_client = secretmanager.SecretManagerServiceClient()

    project = project_id or PROJECT_ID
    name = f"projects/{project}/secrets/{secret_name}/versions/latest"

    try:
        response = _secret_client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        logger.error(f"Failed to get secret {secret_name}: {e}")
        raise
