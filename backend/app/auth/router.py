"""Auth router with register, login, and me endpoints."""
import secrets
import string
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from firebase_admin import auth as firebase_auth

from .firebase import verify_id_token, get_firestore_client
from .models import TokenRequest, UserProfile, RegisterResponse, LoginResponse
from ..middleware.auth import get_current_user_id


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
        credits_balance=doc_data.get("credits_balance", 25),
        subscription_tier=doc_data.get("subscription_tier", "free"),
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
