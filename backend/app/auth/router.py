"""Auth router with register, login, and me endpoints."""
import secrets
import string
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from firebase_admin import auth as firebase_auth
import stripe

from .firebase import verify_id_token, get_firestore_client, initialize_firebase
from .models import TokenRequest, UserProfile, RegisterResponse, LoginResponse, UpdateProfileRequest, UpdateProfileResponse
from ..middleware.auth import get_current_user_id
from ..notifications import send as notify
from ..notifications.utils import build_welcome_payload

logger = logging.getLogger(__name__)


class DeleteAccountRequest(BaseModel):
    """Request to delete user account."""
    reason: Optional[str] = None
    feedback: Optional[str] = None


class DeleteAccountResponse(BaseModel):
    """Response after deleting account."""
    message: str
    deleted_data: dict


class DataExportResponse(BaseModel):
    """Response with exported user data."""
    message: str
    data: dict


router = APIRouter(prefix="/auth", tags=["auth"])


def generate_referral_code() -> str:
    """Generate a unique referral code like USER-XXXXX."""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(secrets.choice(chars) for _ in range(5))
    return f"USER-{random_part}"


def firestore_doc_to_user_profile(doc_data: dict, user_id: str) -> UserProfile:
    """Convert Firestore document to UserProfile model."""
    created_at = doc_data.get("created_at")
    updated_at = doc_data.get("updated_at")

    # Handle Firestore timestamps
    if hasattr(created_at, 'timestamp'):
        created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)
    elif created_at is None:
        created_at = datetime.now(timezone.utc)

    if hasattr(updated_at, 'timestamp'):
        updated_at = datetime.fromtimestamp(updated_at.timestamp(), tz=timezone.utc)
    elif updated_at is None:
        updated_at = datetime.now(timezone.utc)

    return UserProfile(
        user_id=user_id,
        email=doc_data.get("email", ""),
        email_verified=doc_data.get("email_verified", False),
        display_name=doc_data.get("display_name"),
        avatar_url=doc_data.get("avatar_url"),
        company=doc_data.get("company"),
        location=doc_data.get("location"),
        bio=doc_data.get("bio"),
        credits_balance=doc_data.get("credits_balance", 25),
        subscription_tier=doc_data.get("subscription_tier", "free"),
        billing_period=doc_data.get("billing_period"),  # "month" or "year", None for free
        referral_code=doc_data.get("referral_code", ""),
        referred_by=doc_data.get("referred_by"),
        is_affiliate=doc_data.get("is_affiliate", False),
        affiliate_status=doc_data.get("affiliate_status", "none"),
        created_at=created_at,
        updated_at=updated_at,
    )


@router.post("/register", response_model=RegisterResponse)
async def register(request: TokenRequest):
    """
    Register a new user after Firebase client-side signup.

    - Validates the Firebase ID token
    - Creates user document in Firestore with 25 credits
    - Generates unique referral code
    """
    try:
        # Verify the ID token
        decoded_token = verify_id_token(request.id_token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        email_verified = decoded_token.get("email_verified", False)
        display_name = decoded_token.get("name")

    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="ID token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

    # Get Firestore client
    db = get_firestore_client()
    user_ref = db.collection("users").document(uid)

    # Check if user already exists
    existing_user = user_ref.get()
    if existing_user.exists:
        raise HTTPException(
            status_code=409,
            detail="User already registered. Use /auth/login instead."
        )

    # Generate unique referral code
    referral_code = generate_referral_code()

    # Ensure referral code is unique
    max_attempts = 10
    for _ in range(max_attempts):
        existing_code = db.collection("users").where(
            "referral_code", "==", referral_code
        ).limit(1).get()
        if not list(existing_code):
            break
        referral_code = generate_referral_code()

    # Create user document
    now = datetime.now(timezone.utc)
    user_data = {
        "user_id": uid,
        "email": email,
        "email_verified": email_verified,
        "display_name": display_name,
        "avatar_url": None,
        "company": None,
        "location": None,
        "bio": None,
        "credits_balance": 25,  # Signup bonus
        "subscription_tier": "free",
        "stripe_customer_id": None,
        "founding_member": False,
        "founding_discount": 0,
        "founding_joined_at": None,
        "founding_number": None,
        "referral_code": referral_code,
        "referred_by": None,
        "referral_bonus_claimed": True,  # 25 credits is the signup bonus
        "referrer_bonus_paid": False,
        "is_affiliate": False,
        "affiliate_status": "none",
        "affiliate_code": None,
        "notifications": {
            "email_on_completion": True,
            "email_on_failure": True,
            "email_on_low_credits": True,
            "email_on_billing": True,
            "email_product_updates": True,
            "email_marketing": False,
            "browser_notifications": True,
        },
        "webhook_url": None,
        "webhook_secret": None,
        "webhook_events": [],
        "created_at": now,
        "updated_at": now,
        "last_login_at": now,
    }

    # Save to Firestore
    user_ref.set(user_data)

    # Also create referral_codes collection document so the code can be used
    db.collection("referral_codes").document(referral_code).set({
        "code": referral_code,
        "user_id": uid,
        "created_at": now,
    })

    # Send welcome email (non-blocking)
    try:
        payload = build_welcome_payload(user_data, credits_balance=25)
        result = notify(db, "account.welcome", uid, payload)
        if not result.sent:
            logger.warning(f"Welcome email not sent for {uid}: {result.reason}")
    except Exception as e:
        logger.warning(f"Failed to send welcome notification for {uid}: {e}")

    # Return user profile
    user_profile = firestore_doc_to_user_profile(user_data, uid)
    return RegisterResponse(
        message="User registered successfully",
        user=user_profile
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: TokenRequest):
    """
    Login an existing user.

    - Validates the Firebase ID token
    - Returns user profile from Firestore
    - Updates last_login_at
    """
    try:
        decoded_token = verify_id_token(request.id_token)
        uid = decoded_token["uid"]

    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="ID token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

    # Get user from Firestore
    db = get_firestore_client()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User not found. Please register first."
        )

    # Update last login time
    user_ref.update({"last_login_at": datetime.now(timezone.utc)})

    # Return user profile
    user_data = user_doc.to_dict()
    user_profile = firestore_doc_to_user_profile(user_data, uid)

    return LoginResponse(
        message="Login successful",
        user=user_profile
    )


@router.get("/me", response_model=UserProfile)
async def get_me(request: Request, uid: str = Depends(get_current_user_id)):
    """
    Get current user profile.

    Requires Authorization header with Firebase ID token:
    Authorization: Bearer <id_token>
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user_data = user_doc.to_dict()
    return firestore_doc_to_user_profile(user_data, uid)


@router.patch("/me", response_model=UpdateProfileResponse)
async def update_profile(
    request: UpdateProfileRequest,
    uid: str = Depends(get_current_user_id)
):
    """
    Update current user profile.

    Only provided fields will be updated. Omit fields to keep them unchanged.
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Build update dict with only provided fields
    update_data = {}
    if request.display_name is not None:
        update_data["display_name"] = request.display_name
    if request.company is not None:
        update_data["company"] = request.company
    if request.location is not None:
        update_data["location"] = request.location
    if request.bio is not None:
        # Limit bio to 500 characters
        update_data["bio"] = request.bio[:500] if request.bio else None

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )

    # Add updated_at timestamp
    update_data["updated_at"] = datetime.now(timezone.utc)

    # Update in Firestore
    user_ref.update(update_data)

    # Get updated user data
    updated_doc = user_ref.get()
    user_data = updated_doc.to_dict()

    return UpdateProfileResponse(
        message="Profile updated successfully",
        user=firestore_doc_to_user_profile(user_data, uid)
    )


@router.get("/export", response_model=DataExportResponse)
async def export_user_data(uid: str = Depends(get_current_user_id)):
    """
    Export all user data.

    Returns a JSON object containing:
    - Profile information
    - Subscription details
    - Transaction history
    - Job history (last 100)
    """
    db = get_firestore_client()

    # Get user profile
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()

    # Remove sensitive fields
    safe_user_data = {k: v for k, v in user_data.items()
                      if k not in ["stripe_customer_id", "webhook_secret"]}

    # Convert Firestore timestamps to ISO strings
    for key, value in safe_user_data.items():
        if hasattr(value, 'timestamp'):
            safe_user_data[key] = datetime.fromtimestamp(
                value.timestamp(), tz=timezone.utc
            ).isoformat()

    # Get subscriptions
    subscriptions = []
    subs_query = db.collection("subscriptions").where("user_id", "==", uid).get()
    for sub_doc in subs_query:
        sub_data = sub_doc.to_dict()
        for key, value in sub_data.items():
            if hasattr(value, 'timestamp'):
                sub_data[key] = datetime.fromtimestamp(
                    value.timestamp(), tz=timezone.utc
                ).isoformat()
        subscriptions.append(sub_data)

    # Get transactions (last 100)
    transactions = []
    txn_query = db.collection("credit_transactions")\
        .where("user_id", "==", uid)\
        .order_by("created_at", direction="DESCENDING")\
        .limit(100)\
        .get()
    for txn_doc in txn_query:
        txn_data = txn_doc.to_dict()
        for key, value in txn_data.items():
            if hasattr(value, 'timestamp'):
                txn_data[key] = datetime.fromtimestamp(
                    value.timestamp(), tz=timezone.utc
                ).isoformat()
        transactions.append(txn_data)

    # Get jobs (last 100)
    jobs = []
    jobs_query = db.collection("jobs")\
        .where("user_id", "==", uid)\
        .order_by("created_at", direction="DESCENDING")\
        .limit(100)\
        .get()
    for job_doc in jobs_query:
        job_data = job_doc.to_dict()
        # Remove internal fields
        job_data.pop("internal_status", None)
        for key, value in job_data.items():
            if hasattr(value, 'timestamp'):
                job_data[key] = datetime.fromtimestamp(
                    value.timestamp(), tz=timezone.utc
                ).isoformat()
        jobs.append(job_data)

    export_data = {
        "profile": safe_user_data,
        "subscriptions": subscriptions,
        "transactions": transactions,
        "jobs": jobs,
        "exported_at": datetime.now(timezone.utc).isoformat(),
    }

    return DataExportResponse(
        message="Data exported successfully",
        data=export_data
    )


@router.delete("/account", response_model=DeleteAccountResponse)
async def delete_account(
    request: DeleteAccountRequest,
    uid: str = Depends(get_current_user_id)
):
    """
    Permanently delete user account and all associated data.

    This will:
    1. Cancel any active Stripe subscription
    2. Delete user from Firebase Auth
    3. Delete all Firestore data (user profile, subscriptions, transactions, jobs)
    4. Store deletion feedback for improvement

    WARNING: This action is irreversible!
    """
    import os
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    deleted_counts = {
        "user_profile": 0,
        "subscriptions": 0,
        "transactions": 0,
        "jobs": 0,
        "stripe_subscription_canceled": False,
        "firebase_auth_deleted": False,
    }

    # 1. Cancel Stripe subscription if exists
    stripe_customer_id = user_data.get("stripe_customer_id")
    if stripe_customer_id:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        try:
            # List and cancel all active subscriptions
            subscriptions = stripe.Subscription.list(
                customer=stripe_customer_id,
                status="active",
                limit=10
            )
            for sub in subscriptions.data:
                stripe.Subscription.delete(sub.id)
                deleted_counts["stripe_subscription_canceled"] = True
                logger.info(f"Canceled Stripe subscription {sub.id} for user {uid}")
        except stripe.error.StripeError as e:
            logger.warning(f"Failed to cancel Stripe subscription for user {uid}: {e}")
            # Continue with deletion even if Stripe fails

    # 2. Delete Firestore data

    # Delete subscriptions
    subs_query = db.collection("subscriptions").where("user_id", "==", uid).get()
    for sub_doc in subs_query:
        sub_doc.reference.delete()
        deleted_counts["subscriptions"] += 1

    # Delete transactions
    txn_query = db.collection("credit_transactions").where("user_id", "==", uid).get()
    for txn_doc in txn_query:
        txn_doc.reference.delete()
        deleted_counts["transactions"] += 1

    # Delete jobs
    jobs_query = db.collection("jobs").where("user_id", "==", uid).get()
    for job_doc in jobs_query:
        job_doc.reference.delete()
        deleted_counts["jobs"] += 1

    # Store deletion feedback (if provided) before deleting user
    if request.reason or request.feedback:
        feedback_data = {
            "user_id": uid,
            "email": user_data.get("email"),
            "subscription_tier": user_data.get("subscription_tier"),
            "reason": request.reason,
            "feedback": request.feedback,
            "deleted_at": datetime.now(timezone.utc),
        }
        db.collection("account_deletion_feedback").add(feedback_data)

    # Delete user profile
    user_ref.delete()
    deleted_counts["user_profile"] = 1

    # 3. Delete from Firebase Auth
    # Explicitly ensure Firebase Admin SDK is initialized with proper credentials
    initialize_firebase()
    logger.info(f"Attempting to delete Firebase Auth user {uid}")
    try:
        firebase_auth.delete_user(uid)
        deleted_counts["firebase_auth_deleted"] = True
        logger.info(f"Successfully deleted Firebase Auth user {uid}")
    except firebase_auth.UserNotFoundError:
        logger.warning(f"Firebase Auth user {uid} not found (already deleted?)")
        deleted_counts["firebase_auth_deleted"] = True  # Consider it deleted
    except Exception as e:
        logger.error(f"Failed to delete Firebase Auth user {uid}: {type(e).__name__}: {e}")
        # This is critical - if Firebase Auth deletion fails, re-raise
        raise HTTPException(
            status_code=500,
            detail=f"Account partially deleted. Firebase Auth deletion failed: {str(e)}"
        )

    logger.info(f"Account {uid} deleted successfully: {deleted_counts}")

    return DeleteAccountResponse(
        message="Account deleted successfully. All your data has been permanently removed.",
        deleted_data=deleted_counts
    )
