"""WaveSpeed webhook handler - receives completion callbacks."""
import logging
import os
import json
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, Query
from google.cloud import secretmanager, pubsub_v1

logger = logging.getLogger(__name__)

router = APIRouter()

# Cache for webhook secret
_webhook_secret: Optional[str] = None


def get_webhook_secret() -> str:
    """Get WaveSpeed webhook secret from Secret Manager."""
    global _webhook_secret
    if _webhook_secret:
        return _webhook_secret

    project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/wavespeed-webhook-token/versions/latest"
        response = client.access_secret_version(request={"name": name})
        _webhook_secret = response.payload.data.decode("UTF-8").strip()
        return _webhook_secret
    except Exception as e:
        logger.error(f"Failed to get webhook secret: {e}")
        raise HTTPException(status_code=500, detail="Webhook configuration error")


def get_pubsub_publisher():
    """Get Pub/Sub publisher client."""
    return pubsub_v1.PublisherClient()


@router.post("/wavespeed")
async def handle_wavespeed_webhook(
    request: Request,
    token: str = Query(..., description="Webhook authentication token")
):
    """
    Handle WaveSpeed webhook callbacks.

    WaveSpeed calls this endpoint when a job completes or fails.
    We verify the token, then publish to Pub/Sub for async processing.

    Query params:
        token: Secret token for authentication

    Body:
        WaveSpeed callback payload with request_id, status, outputs, etc.
    """
    # Verify token
    try:
        expected_token = get_webhook_secret()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify webhook token: {e}")
        raise HTTPException(status_code=500, detail="Token verification failed")

    if token != expected_token:
        logger.warning(f"Invalid webhook token received")
        raise HTTPException(status_code=401, detail="Invalid token")

    # Parse payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Extract key fields for logging
    request_id = payload.get("id") or payload.get("data", {}).get("id")
    status = payload.get("status") or payload.get("data", {}).get("status")

    if not request_id:
        logger.error(f"Webhook payload missing request_id: {payload}")
        raise HTTPException(status_code=400, detail="Missing request_id in payload")

    logger.info(f"[WEBHOOK] WaveSpeed callback: request_id={request_id}, status={status}")

    # Publish to Pub/Sub for async processing
    try:
        project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")
        topic_path = f"projects/{project_id}/topics/wavespeed-completions"

        publisher = get_pubsub_publisher()

        # Prepare message with attributes for filtering
        message_data = json.dumps(payload).encode("utf-8")
        attributes = {
            "request_id": str(request_id),
            "status": str(status) if status else "unknown",
        }

        future = publisher.publish(topic_path, message_data, **attributes)
        message_id = future.result(timeout=10)

        logger.info(f"Published to Pub/Sub: message_id={message_id}, request_id={request_id}")

    except Exception as e:
        logger.error(f"Failed to publish to Pub/Sub: {e}")
        # Return 500 so WaveSpeed will retry
        raise HTTPException(status_code=500, detail="Failed to queue for processing")

    # Return 200 immediately - processing happens async via Pub/Sub
    return {"received": True, "request_id": request_id}
