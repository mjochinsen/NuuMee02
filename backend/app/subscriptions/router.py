"""Subscription management routes."""
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore, secretmanager
import stripe

from .models import (
    SubscriptionTier,
    SubscriptionStatus,
    SUBSCRIPTION_TIERS,
    SubscriptionTierInfo,
    CreateSubscriptionRequest,
    CreateSubscriptionResponse,
    SubscriptionResponse,
    CancelSubscriptionResponse,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

# Stripe API key loading (same pattern as credits router)
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
            key = response.payload.data.decode("UTF-8").strip()
            if key:
                stripe.api_key = key
                _stripe_key_loaded = True
                return
        except Exception as e:
            print(f"Failed to get Stripe key from Secret Manager: {e}")

    # Fallback to environment variable (local dev)
    key = os.getenv("STRIPE_SECRET_KEY")
    if key:
        stripe.api_key = key
        _stripe_key_loaded = True


def generate_subscription_id() -> str:
    """Generate a unique subscription ID."""
    return f"sub_{uuid.uuid4().hex[:12]}"


@router.get("/tiers", response_model=list[SubscriptionTierInfo])
async def list_subscription_tiers():
    """
    List available subscription tiers.

    This endpoint does not require authentication.
    Returns details about available subscription plans.
    """
    return [
        SubscriptionTierInfo(
            tier=tier,
            name=config["name"],
            price_cents=config["price_cents"],
            monthly_credits=config["monthly_credits"],
            credits_rollover_cap=config["credits_rollover_cap"],
        )
        for tier, config in SUBSCRIPTION_TIERS.items()
    ]


@router.post("/create", response_model=CreateSubscriptionResponse)
async def create_subscription(
    request: CreateSubscriptionRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Create a Stripe checkout session for a subscription.

    This endpoint:
    1. Validates user doesn't have an active subscription
    2. Creates or retrieves Stripe customer
    3. Creates a Stripe checkout session for subscription
    4. Returns the checkout URL

    After successful payment, Stripe webhooks will:
    - Create subscription record
    - Grant initial credits
    """
    _ensure_stripe_key()
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()

    # Check for existing active subscription
    existing_sub = db.collection("subscriptions")\
        .where("user_id", "==", user_id)\
        .where("status", "==", SubscriptionStatus.ACTIVE.value)\
        .limit(1)\
        .get()

    if list(existing_sub):
        raise HTTPException(
            status_code=400,
            detail="User already has an active subscription. Cancel current subscription first."
        )

    # Get tier configuration
    tier_config = SUBSCRIPTION_TIERS.get(request.tier)
    if not tier_config:
        raise HTTPException(status_code=400, detail=f"Invalid subscription tier: {request.tier}")

    # Get or create Stripe customer
    stripe_customer_id = user_data.get("stripe_customer_id")
    if not stripe_customer_id:
        try:
            customer = stripe.Customer.create(
                email=user_data.get("email"),
                metadata={"user_id": user_id},
            )
            stripe_customer_id = customer.id

            # Store customer ID
            user_ref.update({
                "stripe_customer_id": stripe_customer_id,
                "updated_at": firestore.SERVER_TIMESTAMP,
            })
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create Stripe customer: {e}")
            raise HTTPException(status_code=500, detail="Failed to create payment customer")

    # Get frontend URL for redirects
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Create Stripe checkout session for subscription
    try:
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": tier_config["stripe_price_id"],
                "quantity": 1,
            }],
            success_url=f"{frontend_url}/billing?subscription=success",
            cancel_url=f"{frontend_url}/billing?subscription=canceled",
            metadata={
                "user_id": user_id,
                "tier": request.tier.value,
                "monthly_credits": str(tier_config["monthly_credits"]),
            },
            subscription_data={
                "metadata": {
                    "user_id": user_id,
                    "tier": request.tier.value,
                    "monthly_credits": str(tier_config["monthly_credits"]),
                },
            },
        )

        return CreateSubscriptionResponse(
            checkout_url=session.url,
            session_id=session.id,
        )

    except stripe.error.StripeError as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.get("/current", response_model=Optional[SubscriptionResponse])
async def get_current_subscription(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get the current user's active subscription.

    Returns subscription details or null if no active subscription.
    """
    db = get_firestore_client()

    # Query for active subscription
    subs_query = db.collection("subscriptions")\
        .where("user_id", "==", user_id)\
        .where("status", "in", [SubscriptionStatus.ACTIVE.value, SubscriptionStatus.PAST_DUE.value])\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        return None

    sub_data = subs_list[0].to_dict()

    # Handle Firestore timestamps
    current_period_start = sub_data.get("current_period_start")
    current_period_end = sub_data.get("current_period_end")
    created_at = sub_data.get("created_at")

    if hasattr(current_period_start, 'timestamp'):
        current_period_start = datetime.fromtimestamp(current_period_start.timestamp(), tz=timezone.utc)
    if hasattr(current_period_end, 'timestamp'):
        current_period_end = datetime.fromtimestamp(current_period_end.timestamp(), tz=timezone.utc)
    if hasattr(created_at, 'timestamp'):
        created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)

    return SubscriptionResponse(
        subscription_id=sub_data.get("subscription_id"),
        user_id=sub_data.get("user_id"),
        tier=SubscriptionTier(sub_data.get("tier")),
        status=SubscriptionStatus(sub_data.get("status")),
        stripe_subscription_id=sub_data.get("stripe_subscription_id"),
        monthly_credits=sub_data.get("monthly_credits", 0),
        current_period_start=current_period_start,
        current_period_end=current_period_end,
        cancel_at_period_end=sub_data.get("cancel_at_period_end", False),
        created_at=created_at,
    )


@router.post("/cancel", response_model=CancelSubscriptionResponse)
async def cancel_subscription(
    user_id: str = Depends(get_current_user_id),
):
    """
    Cancel the current user's subscription.

    The subscription will remain active until the end of the current billing period.
    User will retain access and credits until then.
    """
    _ensure_stripe_key()
    db = get_firestore_client()

    # Query for active subscription
    subs_query = db.collection("subscriptions")\
        .where("user_id", "==", user_id)\
        .where("status", "==", SubscriptionStatus.ACTIVE.value)\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        raise HTTPException(status_code=404, detail="No active subscription found")

    sub_doc = subs_list[0]
    sub_data = sub_doc.to_dict()
    stripe_subscription_id = sub_data.get("stripe_subscription_id")

    if not stripe_subscription_id:
        raise HTTPException(status_code=500, detail="Subscription missing Stripe ID")

    # Cancel at period end via Stripe
    try:
        stripe_sub = stripe.Subscription.modify(
            stripe_subscription_id,
            cancel_at_period_end=True,
        )

        # Update local subscription record
        sub_doc.reference.update({
            "cancel_at_period_end": True,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Handle timestamp
        current_period_end = sub_data.get("current_period_end")
        if hasattr(current_period_end, 'timestamp'):
            current_period_end = datetime.fromtimestamp(current_period_end.timestamp(), tz=timezone.utc)

        return CancelSubscriptionResponse(
            subscription_id=sub_data.get("subscription_id"),
            status=SubscriptionStatus.ACTIVE,
            cancel_at_period_end=True,
            current_period_end=current_period_end,
            message="Subscription will be canceled at the end of the billing period. You will retain access until then.",
        )

    except stripe.error.StripeError as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")
