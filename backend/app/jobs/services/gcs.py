"""GCS signed URL generation for job outputs."""

import os
from datetime import timedelta
import requests as http_requests
from google.auth import default
from google.auth import impersonated_credentials
from google.cloud import storage


def generate_signed_download_url(bucket_name: str, blob_path: str, expiration: int = 3600) -> str:
    """
    Generate a signed URL for downloading a file from GCS.

    Uses IAM impersonation to get signing credentials on Cloud Run,
    since the default Compute Engine credentials cannot sign URLs.

    Args:
        bucket_name: GCS bucket name
        blob_path: Path to blob within bucket
        expiration: URL expiration in seconds (default 1 hour)

    Returns:
        Signed URL string
    """
    # Get service account email from metadata server or environment
    sa_email = os.getenv("SERVICE_ACCOUNT_EMAIL")
    if not sa_email:
        try:
            response = http_requests.get(
                "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email",
                headers={"Metadata-Flavor": "Google"},
                timeout=2
            )
            if response.status_code == 200:
                sa_email = response.text
        except Exception:
            pass

    if not sa_email:
        sa_email = "nuumee-api@wanapi-prod.iam.gserviceaccount.com"

    # Get default credentials and create impersonated credentials with signing capability
    source_credentials, project = default()
    signing_credentials = impersonated_credentials.Credentials(
        source_credentials=source_credentials,
        target_principal=sa_email,
        target_scopes=['https://www.googleapis.com/auth/cloud-platform'],
        lifetime=3600,
    )

    # Create storage client and generate signed URL
    client = storage.Client(project=project)
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_path)

    url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
        credentials=signing_credentials,
    )
    return url
