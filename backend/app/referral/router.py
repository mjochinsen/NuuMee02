"""Referral system routes."""
import logging
import random
import string
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from google.cloud import firestore

from .models import (
    ReferralCodeResponse,
    ReferralApplyRequest,
    ReferralApplyResponse,
    ReferralStats,
)
from ..auth.firebase import get_firestore_client, verify_id_token
from ..middleware.auth import get_current_user_id
from ..email import queue_referral_welcome_email, queue_referrer_notification_email


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/referral", tags=["Referral"])


def generate_referral_code() -> str:
    """
    Generate a unique referral code in format USER-XXXXX.

    Returns:
        String in format USER-XXXXX where XXXXX is 5 random alphanumeric uppercase chars
    """
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"USER-{random_suffix}"


def create_credit_transaction(
    db,
    user_id: str,
    amount: int,
    description: str,
    related_referral_code: str,
    balance_before: int,
    balance_after: int
):
    """
    Create a credit transaction record.

    Args:
        db: Firestore client
        user_id: User ID
        amount: Credit amount (positive)
        description: Transaction description
        related_referral_code: Referral code related to this transaction
        balance_before: Balance before transaction
        balance_after: Balance after transaction
    """
    transaction_data = {
        "user_id": user_id,
        "type": "referral",
        "amount": amount,
        "amount_cents": None,  # Referral bonuses have no dollar amount
        "status": "completed",
        "balance_before": balance_before,
        "balance_after": balance_after,
        "description": description,
        "related_referral_code": related_referral_code,
        "receipt_url": None,  # No receipt for referral bonuses
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    db.collection("credit_transactions").add(transaction_data)
    logger.info(f"Created credit transaction for user {user_id}: {amount} credits (referral: {related_referral_code})")


@router.get("/code", response_model=ReferralCodeResponse)
async def get_referral_code(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get the current user's referral code and statistics.

    If the user doesn't have a referral code yet, one will be generated.
    Returns the code, share URL, and referral stats (total referrals, converted, credits earned).

    Requires authentication.
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    referral_code = user_data.get("referral_code")

    # If user has a code, ensure it exists in referral_codes collection
    if referral_code:
        code_doc = db.collection("referral_codes").document(referral_code).get()
        if not code_doc.exists:
            # Code exists in user doc but not in collection - create it
            logger.info(f"Creating missing referral_codes entry for {referral_code}")
            db.collection("referral_codes").document(referral_code).set({
                "code": referral_code,
                "user_id": user_id,
                "created_at": firestore.SERVER_TIMESTAMP,
            })

    # Generate referral code if user doesn't have one
    if not referral_code:
        # Keep trying until we get a unique code
        max_attempts = 10
        for attempt in range(max_attempts):
            referral_code = generate_referral_code()

            # Check if code already exists
            existing_code = db.collection("referral_codes").document(referral_code).get()

            if not existing_code.exists:
                # Code is unique, save it
                try:
                    # Create referral_codes document
                    db.collection("referral_codes").document(referral_code).set({
                        "code": referral_code,
                        "user_id": user_id,
                        "created_at": firestore.SERVER_TIMESTAMP,
                    })

                    # Update user document
                    user_ref.update({
                        "referral_code": referral_code,
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    })

                    logger.info(f"Generated referral code {referral_code} for user {user_id}")
                    break

                except Exception as e:
                    logger.error(f"Failed to save referral code: {e}")
                    if attempt == max_attempts - 1:
                        raise HTTPException(status_code=500, detail="Failed to generate referral code")
                    continue
        else:
            raise HTTPException(status_code=500, detail="Failed to generate unique referral code")

    # Get referral statistics
    # Count total referrals
    referrals_query = db.collection("referrals")\
        .where("referral_code", "==", referral_code)\
        .stream()

    total_referrals = 0
    converted_referrals = 0
    total_credits_earned = 0

    for referral_doc in referrals_query:
        referral_data = referral_doc.to_dict()
        total_referrals += 1

        # Count converted referrals (status = "converted")
        if referral_data.get("status") == "converted":
            converted_referrals += 1

            # Each conversion grants 100 credits to referrer (when referrer_bonus_granted is True)
            if referral_data.get("referrer_bonus_granted", False):
                total_credits_earned += 100

    # Build share URL
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")
    share_url = f"{frontend_url}/signup?ref={referral_code}"

    return ReferralCodeResponse(
        referral_code=referral_code,
        share_url=share_url,
        stats=ReferralStats(
            total_referrals=total_referrals,
            converted_referrals=converted_referrals,
            total_credits_earned=total_credits_earned,
        ),
    )


@router.post("/apply", response_model=ReferralApplyResponse)
async def apply_referral_code(
    request: ReferralApplyRequest,
    http_request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """
    Apply a referral code during signup.

    This endpoint:
    1. Validates the referral code exists
    2. Creates user document if it doesn't exist (new signups)
    3. Ensures user is not applying their own code
    4. Grants 25 credits to the new user (on top of 25 signup bonus = 50 total)
    5. Creates a referral record
    6. Updates user's referral status

    Requires authentication.
    """
    db = get_firestore_client()
    referral_code = request.code.strip().upper()

    # Get current user
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    # If user document doesn't exist, create it (handles new signups)
    if not user_doc.exists:
        logger.info(f"Creating user document for new signup via referral: {user_id}")

        # Get user info from the Firebase token
        auth_header = http_request.headers.get("Authorization", "")
        token = auth_header.split()[-1] if auth_header else ""
        try:
            decoded_token = verify_id_token(token)
            email = decoded_token.get("email", "")
            email_verified = decoded_token.get("email_verified", False)
            display_name = decoded_token.get("name")
        except Exception as e:
            logger.error(f"Failed to decode token for user creation: {e}")
            raise HTTPException(status_code=401, detail="Invalid authentication token")

        # Create user document with signup bonus (25 credits)
        now = datetime.now(timezone.utc)
        new_referral_code = generate_referral_code()
        new_user_data = {
            "user_id": user_id,
            "email": email,
            "email_verified": email_verified,
            "display_name": display_name,
            "avatar_url": None,
            "credits_balance": 25,  # Signup bonus
            "subscription_tier": "free",
            "referral_code": new_referral_code,
            "referred_by": None,  # Will be set below
            "referral_bonus_claimed": False,  # Will be set to True below
            "is_affiliate": False,
            "affiliate_status": "none",
            "created_at": now,
            "updated_at": now,
            "last_login_at": now,
        }
        user_ref.set(new_user_data)

        # Also create the referral_codes collection document so the code can be used
        db.collection("referral_codes").document(new_referral_code).set({
            "code": new_referral_code,
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        user_data = new_user_data
        logger.info(f"Created user document for {user_id} with 25 signup credits and referral code {new_referral_code}")
    else:
        user_data = user_doc.to_dict()

    # Check if user already used a referral code
    if user_data.get("referred_by"):
        raise HTTPException(
            status_code=400,
            detail="You have already applied a referral code"
        )

    # Note: We removed the redundant "referral_bonus_claimed" check.
    # The "referred_by" check above is sufficient to prevent double-claiming.

    # Validate referral code exists
    code_ref = db.collection("referral_codes").document(referral_code)
    code_doc = code_ref.get()

    if not code_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="Invalid referral code"
        )

    code_data = code_doc.to_dict()
    referrer_id = code_data.get("user_id")

    # Ensure user is not using their own code
    if referrer_id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot use your own referral code"
        )

    # Grant 25 credits to new user
    current_balance = user_data.get("credits_balance", 0)
    new_balance = current_balance + 25

    try:
        # Create referral record
        referral_data = {
            "referrer_id": referrer_id,
            "referred_user_id": user_id,
            "referral_code": referral_code,
            "status": "signed_up",  # Status will be updated to "converted" after first payment
            "referred_user_bonus_granted": True,
            "referrer_bonus_granted": False,  # Will be set to True when user makes first payment
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }

        referral_ref = db.collection("referrals").add(referral_data)
        referral_id = referral_ref[1].id

        # Update user document
        user_ref.update({
            "referred_by": referral_code,
            "referral_bonus_claimed": True,
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Create credit transaction record
        create_credit_transaction(
            db=db,
            user_id=user_id,
            amount=25,
            description=f"Referral signup bonus (code: {referral_code})",
            related_referral_code=referral_code,
            balance_before=current_balance,
            balance_after=new_balance,
        )

        logger.info(
            f"Applied referral code {referral_code} for user {user_id}. "
            f"Granted 25 credits. Referral ID: {referral_id}"
        )

        # Queue email notifications (non-blocking, don't fail if emails fail)
        try:
            # Email to new user: "Welcome! You received bonus credits"
            new_user_email = user_data.get("email")
            new_user_name = user_data.get("display_name") or "there"
            if new_user_email:
                queue_referral_welcome_email(
                    db=db,
                    to_email=new_user_email,
                    to_name=new_user_name,
                    bonus_credits=25,
                    total_credits=new_balance,
                )

            # Email to referrer: "Someone signed up with your code!"
            referrer_doc = db.collection("users").document(referrer_id).get()
            if referrer_doc.exists:
                referrer_data = referrer_doc.to_dict()
                referrer_email = referrer_data.get("email")
                referrer_name = referrer_data.get("display_name") or "there"

                if referrer_email:
                    queue_referrer_notification_email(
                        db=db,
                        to_email=referrer_email,
                        to_name=referrer_name,
                        referral_code=referral_code,
                        referred_user_name=user_data.get("display_name") or user_data.get("email"),
                        pending_credits=25,
                    )
        except Exception as email_error:
            # Don't fail the referral if emails fail
            logger.warning(f"Failed to queue referral emails: {email_error}")

        return ReferralApplyResponse(
            credits_granted=25,
            message="Referral code applied successfully! 25 credits added to your account.",
            referral_code=referral_code,
        )

    except Exception as e:
        logger.error(f"Failed to apply referral code: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to apply referral code. Please try again."
        )
