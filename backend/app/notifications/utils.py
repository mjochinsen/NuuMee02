"""Utility functions for notifications."""
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://nuumee.ai")


def get_user_first_name(user_data: dict, fallback: str = "there") -> str:
    """
    Extract first name from user data.

    Args:
        user_data: User document from Firestore
        fallback: Fallback value if no name found

    Returns:
        First name or fallback
    """
    display_name = user_data.get("display_name")

    if not display_name:
        return fallback

    # Try to extract first name
    name_parts = display_name.split()
    if name_parts:
        return name_parts[0]

    return fallback


def build_welcome_payload(user_data: dict, credits_balance: int = 25) -> dict:
    """
    Build payload for account.welcome event.

    Args:
        user_data: User document
        credits_balance: Starting credits

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(user_data),
        "credits_balance": credits_balance,
        "dashboard_url": f"{FRONTEND_URL}/videos/create",
        "referral_url": f"{FRONTEND_URL}/referral",
    }


def build_welcome_referral_payload(
    user_data: dict,
    bonus_credits: int = 25,
    total_credits: int = 50,
) -> dict:
    """
    Build payload for account.welcome_referral event.

    Args:
        user_data: User document
        bonus_credits: Bonus credits from referral
        total_credits: Total credits (signup + bonus)

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(user_data),
        "bonus_credits": bonus_credits,
        "total_credits": total_credits,
        "dashboard_url": f"{FRONTEND_URL}/videos/create",
    }


def build_job_completed_payload(
    user_data: dict,
    job_data: dict,
    download_url: str,
) -> dict:
    """
    Build payload for job.completed event.

    Args:
        user_data: User document
        job_data: Job document
        download_url: Signed URL for video download

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(user_data),
        "video_title": job_data.get("title", "Your video"),
        "download_url": download_url,
        "expires_in": "7 days",
        "dashboard_url": f"{FRONTEND_URL}/dashboard",
    }


def build_job_failed_payload(
    user_data: dict,
    job_data: dict,
    error_reason: str,
) -> dict:
    """
    Build payload for job.failed event.

    Args:
        user_data: User document
        job_data: Job document
        error_reason: Why the job failed

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(user_data),
        "video_title": job_data.get("title", "Your video"),
        "error_reason": error_reason,
        "retry_url": f"{FRONTEND_URL}/videos/create",
        "support_url": f"{FRONTEND_URL}/support",
    }


def build_credits_low_payload(user_data: dict) -> dict:
    """
    Build payload for credits.low_warning event.

    Args:
        user_data: User document

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(user_data),
        "current_balance": user_data.get("credits_balance", 0),
        "pricing_url": f"{FRONTEND_URL}/pricing",
    }


def build_referral_signup_payload(
    referrer_data: dict,
    referred_email: str,
    referral_code: str,
) -> dict:
    """
    Build payload for referral.signup event.

    Args:
        referrer_data: Referrer's user document
        referred_email: Email of person who signed up (will be masked)
        referral_code: The referral code that was used

    Returns:
        Payload dict for template rendering
    """
    from .service import mask_email

    return {
        "first_name": get_user_first_name(referrer_data),
        "referred_email": mask_email(referred_email),
        "referral_code": referral_code,
        "referral_url": f"{FRONTEND_URL}/ref/{referral_code}",
        "referral_stats_url": f"{FRONTEND_URL}/referral",
    }


def build_referral_conversion_payload(
    referrer_data: dict,
    bonus_credits: int,
) -> dict:
    """
    Build payload for referral.conversion event.

    Args:
        referrer_data: Referrer's user document
        bonus_credits: Credits earned from conversion

    Returns:
        Payload dict for template rendering
    """
    return {
        "first_name": get_user_first_name(referrer_data),
        "bonus_credits": bonus_credits,
        "new_balance": referrer_data.get("credits_balance", 0),
        "referral_stats_url": f"{FRONTEND_URL}/referral",
    }
