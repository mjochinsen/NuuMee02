"""Firestore utilities for job management."""

import logging
from datetime import datetime, timezone
from typing import Optional

from google.cloud import firestore

from .gcp import get_firestore

logger = logging.getLogger(__name__)


def update_job_status(
    job_id: str,
    status: str,
    output_video_path: Optional[str] = None,
    error_message: Optional[str] = None,
    wavespeed_request_id: Optional[str] = None,
    collection: str = "jobs"
) -> None:
    """Update job document in Firestore.

    Args:
        job_id: Job document ID
        status: New status value
        output_video_path: Output video GCS path (if completed)
        error_message: Error message (if failed)
        wavespeed_request_id: WaveSpeed request ID (optional, for WaveSpeed jobs)
        collection: Firestore collection name (default "jobs")
    """
    db = get_firestore()
    job_ref = db.collection(collection).document(job_id)

    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc),
    }

    if wavespeed_request_id:
        update_data["wavespeed_request_id"] = wavespeed_request_id

    if output_video_path:
        update_data["output_video_path"] = output_video_path
        update_data["completed_at"] = datetime.now(timezone.utc)

    if error_message:
        update_data["error_message"] = error_message

    job_ref.update(update_data)
    logger.info(f"Updated job {job_id}: status={status}")


def refund_credits(user_id: str, credits: float, job_id: str) -> None:
    """Refund credits to user on job failure.

    Uses a Firestore transaction to ensure atomicity.

    Args:
        user_id: User document ID
        credits: Amount to refund
        job_id: Job ID for logging
    """
    db = get_firestore()
    user_ref = db.collection("users").document(user_id)

    @firestore.transactional
    def refund_transaction(transaction, user_ref, credits):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            logger.error(f"User {user_id} not found for refund")
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + credits

        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

    transaction = db.transaction()
    refund_transaction(transaction, user_ref, credits)
    logger.info(f"Refunded {credits} credits to user {user_id} for job {job_id}")


def is_user_free_tier(user_id: str) -> bool:
    """Check if user is on free tier (no subscription or 'free' tier).

    Args:
        user_id: User document ID

    Returns:
        True if user is on free tier, False otherwise
    """
    db = get_firestore()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return True  # Assume free tier if user not found

    user_data = user_doc.to_dict()
    subscription_tier = user_data.get("subscription_tier", "free")

    return subscription_tier == "free" or not subscription_tier


def get_user_subscription_tier(user_id: str) -> str:
    """Get user's subscription tier.

    Args:
        user_id: User document ID

    Returns:
        Subscription tier string (free, creator, pro, business, enterprise)
    """
    db = get_firestore()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return "free"

    user_data = user_doc.to_dict()
    return user_data.get("subscription_tier", "free") or "free"
