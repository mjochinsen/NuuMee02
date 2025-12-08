"""Firebase Admin SDK initialization and utilities."""
import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud import secretmanager


def get_firebase_credentials():
    """Get Firebase credentials from environment or Secret Manager."""
    # Option 1: FIREBASE_SERVICE_ACCOUNT env var (set by Cloud Run secret injection)
    firebase_sa = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if firebase_sa:
        try:
            cred_dict = json.loads(firebase_sa)
            return credentials.Certificate(cred_dict)
        except json.JSONDecodeError as e:
            print(f"Failed to parse FIREBASE_SERVICE_ACCOUNT: {e}")

    # Option 2: Secret Manager (fallback)
    if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
        project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")
        client = secretmanager.SecretManagerServiceClient()
        # Use correct secret name: firebase-admin-sdk
        secret_name = f"projects/{project_id}/secrets/firebase-admin-sdk/versions/latest"
        try:
            response = client.access_secret_version(request={"name": secret_name})
            cred_dict = json.loads(response.payload.data.decode("UTF-8"))
            return credentials.Certificate(cred_dict)
        except Exception as e:
            print(f"Failed to get credentials from Secret Manager: {e}")

    # Option 3: Local development - use GOOGLE_APPLICATION_CREDENTIALS
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        return credentials.Certificate(cred_path)

    # Option 4: Use Application Default Credentials (works on GCP)
    return credentials.ApplicationDefault()


def initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    if not firebase_admin._apps:
        try:
            cred = get_firebase_credentials()
            firebase_admin.initialize_app(cred, {
                "projectId": os.getenv("GCP_PROJECT_ID", "wanapi-prod"),
            })
        except Exception as e:
            # Fallback: initialize with default credentials
            firebase_admin.initialize_app()
            print(f"Firebase initialized with default credentials: {e}")


def verify_id_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded token.

    Args:
        id_token: The Firebase ID token from the client

    Returns:
        Decoded token containing uid, email, etc.

    Raises:
        firebase_admin.auth.InvalidIdTokenError: If token is invalid
        firebase_admin.auth.ExpiredIdTokenError: If token has expired
    """
    initialize_firebase()
    return auth.verify_id_token(id_token)


def get_firestore_client():
    """Get Firestore client instance."""
    initialize_firebase()
    return firestore.client()
