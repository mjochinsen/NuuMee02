"""Credit and payment routes."""
import os
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import secretmanager, firestore
import stripe

from .models import CreditPackage, CheckoutRequest, CheckoutResponse, CreditBalance
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id


router = APIRouter(prefix="/credits", tags=["Credits"])


# Stripe key initialization (lazy loaded)
_stripe_key_loaded = False


def _ensure_stripe_key():
    """Ensure Stripe API key is set."""
    global _stripe_key_loaded
    if _stripe_key_loaded:
        return

    project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

    # Check if using Secret Manager
    if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/stripe-secret-key/versions/latest"
            response = client.access_secret_version(request={"name": name})
            stripe.api_key = response.payload.data.decode("UTF-8")
            _stripe_key_loaded = True
            return
        except Exception as e:
            print(f"Failed to get Stripe key from Secret Manager: {e}")

    # Fallback to environment variable (local dev)
    key = os.getenv("STRIPE_SECRET_KEY")
    if key:
        stripe.api_key = key
        _stripe_key_loaded = True
    else:
        raise ValueError("STRIPE_SECRET_KEY not configured")


# Credit package configuration (matches PRICING_STRATEGY.md)
CREDIT_PACKAGES = {
    "starter": CreditPackage(
        id="starter",
        name="Starter",
        price_cents=1000,
        credits=120,
        stripe_price_id=os.getenv("STRIPE_PRICE_STARTER", "price_starter_credits"),
        bonus_percent=0
    ),
    "popular": CreditPackage(
        id="popular",
        name="Popular",
        price_cents=3000,
        credits=400,
        stripe_price_id=os.getenv("STRIPE_PRICE_POPULAR", "price_popular_credits"),
        bonus_percent=10
    ),
    "pro": CreditPackage(
        id="pro",
        name="Pro",
        price_cents=7500,
        credits=1100,
        stripe_price_id=os.getenv("STRIPE_PRICE_PRO", "price_pro_credits"),
        bonus_percent=20
    ),
    "mega": CreditPackage(
        id="mega",
        name="Mega",
        price_cents=15000,
        credits=2500,
        stripe_price_id=os.getenv("STRIPE_PRICE_MEGA", "price_mega_credits"),
        bonus_percent=28
    ),
}


@router.get("/packages", response_model=List[CreditPackage])
async def list_credit_packages():
    """
    List all available credit packages.

    Returns available credit packages with pricing and Stripe Price IDs.
    This endpoint does not require authentication.
    """
    return list(CREDIT_PACKAGES.values())


@router.get("/balance", response_model=CreditBalance)
async def get_credit_balance(user_id: str = Depends(get_current_user_id)):
    """
    Get the current user's credit balance.

    Requires authentication via Firebase ID token.
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    updated_at = user_data.get("updated_at")

    # Handle Firestore timestamps
    if hasattr(updated_at, 'timestamp'):
        updated_at = datetime.fromtimestamp(updated_at.timestamp(), tz=timezone.utc)

    return CreditBalance(
        balance=user_data.get("credits_balance", 0),
        last_updated=updated_at
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    checkout_req: CheckoutRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a Stripe Checkout session for purchasing credits.

    This endpoint:
    1. Creates a Stripe Customer if user doesn't have one
    2. Creates a Stripe Checkout Session for one-time payment
    3. Stores the Stripe Customer ID in the user's Firestore document

    Request body: {"package_id": "starter"|"popular"|"pro"|"mega"}
    """
    # Debug logging
    print(f"[CHECKOUT] Received request for user {user_id}")
    print(f"[CHECKOUT] Request body: package_id={checkout_req.package_id}")

    _ensure_stripe_key()

    # Validate package exists
    package = CREDIT_PACKAGES.get(checkout_req.package_id)
    if not package:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid package_id: {checkout_req.package_id}"
        )

    # Get user from Firestore
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    email = user_data.get("email")
    stripe_customer_id = user_data.get("stripe_customer_id")

    # Create Stripe Customer if doesn't exist
    if not stripe_customer_id:
        try:
            customer = stripe.Customer.create(
                email=email,
                metadata={
                    "firebase_uid": user_id,
                    "nuumee_user_id": user_id
                }
            )
            stripe_customer_id = customer.id

            # Save to Firestore
            user_ref.update({
                "stripe_customer_id": stripe_customer_id,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Stripe customer: {str(e)}"
            )

    # Get frontend URL for redirect
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")

    # Create Checkout Session
    try:
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"{package.name} Credit Package",
                            "description": f"{package.credits} credits for NuuMee AI video generation",
                        },
                        "unit_amount": package.price_cents,
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&credits={package.credits}",
            cancel_url=f"{frontend_url}/payment/cancelled",
            metadata={
                "user_id": user_id,
                "package_id": package.id,
                "credits": str(package.credits),
            }
        )

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )
