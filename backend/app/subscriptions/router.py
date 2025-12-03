"""Subscription management routes."""
import os
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from google.cloud import firestore
import stripe
from slowapi import Limiter
from slowapi.util import get_remote_address

from .models import (
    SubscriptionTier,
    SubscriptionStatus,
    get_subscription_tiers,
    SubscriptionTierInfo,
    CreateSubscriptionRequest,
    CreateSubscriptionResponse,
    SubscriptionResponse,
    CancelSubscriptionResponse,
    UpgradeSubscriptionRequest,
    UpgradeSubscriptionResponse,
    SwitchBillingPeriodRequest,
    SwitchBillingPeriodResponse,
)
from .services import StripeService, SubscriptionService
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

# Rate limiter - uses IP address for key
limiter = Limiter(key_func=get_remote_address)


@router.get("/tiers", response_model=list[SubscriptionTierInfo])
async def list_subscription_tiers():
    """
    List available subscription tiers.

    This endpoint does not require authentication.
    Returns details about available subscription plans.
    """
    tiers = get_subscription_tiers()
    return [
        SubscriptionTierInfo(
            tier=tier,
            name=config["name"],
            price_cents=config["price_cents"],
            monthly_credits=config["monthly_credits"],
            credits_rollover_cap=config["credits_rollover_cap"],
        )
        for tier, config in tiers.items()
    ]


@router.post("/create", response_model=CreateSubscriptionResponse)
@limiter.limit("5/minute")
async def create_subscription(
    request: Request,
    sub_request: CreateSubscriptionRequest,
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
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()

    # Check for existing active subscription
    existing_sub = SubscriptionService.get_active_subscription(db, user_id)
    if existing_sub:
        raise HTTPException(
            status_code=400,
            detail="User already has an active subscription. Cancel current subscription first."
        )

    # Get tier configuration (annual or monthly)
    tiers = get_subscription_tiers(annual=sub_request.annual)
    tier_config = tiers.get(sub_request.tier)
    if not tier_config:
        raise HTTPException(status_code=400, detail=f"Invalid subscription tier: {sub_request.tier}")

    # Validate Stripe price ID is configured
    if not tier_config.get("stripe_price_id"):
        logger.error(f"Missing Stripe price ID for tier: {sub_request.tier}")
        raise HTTPException(status_code=500, detail="Subscription tier not configured")

    # Get or create Stripe customer
    stripe_customer_id = user_data.get("stripe_customer_id")
    if not stripe_customer_id:
        try:
            stripe_customer_id = StripeService.get_or_create_customer(
                stripe_customer_id=None,
                email=user_data.get("email"),
                user_id=user_id,
            )
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
    billing_period = "year" if sub_request.annual else "month"

    # Prepare metadata
    metadata = {
        "user_id": user_id,
        "tier": sub_request.tier.value,
        "monthly_credits": str(tier_config["monthly_credits"]),
        "billing_period": billing_period,
        "founding_member": "true" if sub_request.founding else "false",
    }

    # Handle founding member coupon
    coupon_id = None
    if sub_request.founding:
        coupon_id = os.getenv("STRIPE_FOUNDING_COUPON_ID", "FOUNDING20")
        try:
            StripeService.ensure_coupon_exists(
                coupon_id,
                percent_off=20,
                name="Founding Member - 20% Lifetime Discount",
            )
        except stripe.error.StripeError as e:
            logger.warning(f"Failed to ensure coupon: {e}")
            coupon_id = None  # Continue without coupon

    # Create checkout session
    try:
        session = StripeService.create_checkout_session(
            customer_id=stripe_customer_id,
            price_id=tier_config["stripe_price_id"],
            success_url=f"{frontend_url}/billing?subscription=success",
            cancel_url=f"{frontend_url}/billing?subscription=canceled",
            metadata=metadata,
            subscription_metadata=metadata,
            coupon_id=coupon_id,
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
    result = SubscriptionService.get_active_subscription(db, user_id)
    if not result:
        return None

    _, sub_data = result

    # Handle Firestore timestamps
    current_period_start = SubscriptionService.convert_firestore_timestamp(
        sub_data.get("current_period_start")
    )
    current_period_end = SubscriptionService.convert_firestore_timestamp(
        sub_data.get("current_period_end")
    )
    created_at = SubscriptionService.convert_firestore_timestamp(
        sub_data.get("created_at")
    )

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


@router.post("/upgrade", response_model=UpgradeSubscriptionResponse)
@limiter.limit("5/minute")
async def upgrade_subscription(
    request: Request,
    upgrade_request: UpgradeSubscriptionRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Upgrade or change the current subscription to a new tier.

    This endpoint:
    1. Validates user has an active subscription
    2. Updates the Stripe subscription to the new price
    3. Prorates the billing (immediate charge for upgrade, credit for downgrade)
    4. Grants additional credits if upgrading

    Note: Downgrades take effect immediately but may have prorated credits.
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Find current active subscription
    result = SubscriptionService.get_active_subscription(db, user_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found. Please subscribe first."
        )

    sub_doc, sub_data = result
    old_tier = SubscriptionTier(sub_data.get("tier"))
    stripe_subscription_id = sub_data.get("stripe_subscription_id")

    if not stripe_subscription_id:
        raise HTTPException(status_code=500, detail="Subscription missing Stripe ID")

    # Check if already on requested tier
    if old_tier == upgrade_request.new_tier:
        raise HTTPException(
            status_code=400,
            detail=f"Already subscribed to {upgrade_request.new_tier.value} tier"
        )

    # Get tier configurations
    tiers = get_subscription_tiers()
    new_tier_config = tiers.get(upgrade_request.new_tier)

    if not new_tier_config:
        raise HTTPException(status_code=400, detail=f"Invalid tier: {upgrade_request.new_tier}")

    if not new_tier_config.get("stripe_price_id"):
        logger.error(f"Missing Stripe price ID for tier: {upgrade_request.new_tier}")
        raise HTTPException(status_code=500, detail="Subscription tier not configured")

    new_credits = new_tier_config.get("monthly_credits", 0)

    try:
        # Retrieve and update Stripe subscription
        stripe_sub = StripeService.get_subscription(stripe_subscription_id)
        subscription_item_id = stripe_sub["items"]["data"][0]["id"]

        StripeService.modify_subscription(
            stripe_subscription_id,
            items=[{"id": subscription_item_id, "price": new_tier_config["stripe_price_id"]}],
            proration_behavior="create_prorations",
            metadata={
                "user_id": user_id,
                "tier": upgrade_request.new_tier.value,
                "monthly_credits": str(new_credits),
            },
        )

        # Get user data and calculate credits
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        credits_added = 0

        if user_doc.exists:
            user_data = user_doc.to_dict()
            current_balance = user_data.get("credits_balance", 0)

            # Calculate credits change
            credits_added, new_balance, action = SubscriptionService.calculate_tier_change_credits(
                old_tier, upgrade_request.new_tier, current_balance
            )

            # Update user subscription
            SubscriptionService.update_user_subscription(
                db, user_id,
                tier=upgrade_request.new_tier.value,
                credits_balance=new_balance if credits_added > 0 else None,
            )

            # Log the transaction
            SubscriptionService.create_tier_change_transaction(
                db, user_id, old_tier, upgrade_request.new_tier,
                credits_added, current_balance, new_balance, stripe_subscription_id
            )
        else:
            logger.warning(f"User {user_id} not found when updating credits")

        # Update subscription record
        SubscriptionService.update_subscription_record(
            sub_doc,
            tier=upgrade_request.new_tier.value,
            monthly_credits=new_credits,
            credits_rollover_cap=new_tier_config.get("credits_rollover_cap", new_credits * 2),
        )

        # Determine action type
        tiers_config = get_subscription_tiers()
        old_credits = tiers_config.get(old_tier, {}).get("monthly_credits", 0)
        action = "upgraded" if new_credits > old_credits else "changed"

        return UpgradeSubscriptionResponse(
            subscription_id=sub_data.get("subscription_id"),
            old_tier=old_tier,
            new_tier=upgrade_request.new_tier,
            message=f"Subscription {action} from {old_tier.value} to {upgrade_request.new_tier.value}",
            credits_added=credits_added,
        )

    except stripe.error.StripeError as e:
        logger.error(f"Failed to upgrade subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upgrade subscription: {str(e)}")


@router.post("/cancel", response_model=CancelSubscriptionResponse)
@limiter.limit("5/minute")
async def cancel_subscription(
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """
    Cancel the current user's subscription.

    The subscription will remain active until the end of the current billing period.
    User will retain access and credits until then.
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # First, check user document for subscription info
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    user_subscription_tier = user_data.get("subscription_tier", "free")

    # If user is already on free tier, nothing to cancel
    if user_subscription_tier == "free":
        raise HTTPException(status_code=400, detail="You are already on the free tier")

    # Try to get stripe_subscription_id from user document first (more reliable)
    stripe_subscription_id = user_data.get("stripe_subscription_id")
    sub_doc = None
    sub_data = None

    # Query for active subscription
    result = SubscriptionService.get_active_subscription(db, user_id)
    if result:
        sub_doc, sub_data = result
        if not stripe_subscription_id:
            stripe_subscription_id = sub_data.get("stripe_subscription_id")

    # If we still don't have a stripe_subscription_id, try to find it from Stripe
    if not stripe_subscription_id:
        stripe_customer_id = user_data.get("stripe_customer_id")
        if stripe_customer_id:
            try:
                subscriptions = StripeService.list_active_subscriptions(stripe_customer_id, limit=1)
                if subscriptions:
                    stripe_subscription_id = subscriptions[0].id
                    logger.info(f"Found subscription {stripe_subscription_id} from Stripe for user {user_id}")
            except stripe.error.StripeError as e:
                logger.warning(f"Failed to list subscriptions from Stripe: {e}")

    if not stripe_subscription_id:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found. Please contact support if you believe this is an error."
        )

    # Cancel at period end via Stripe
    try:
        stripe_sub = StripeService.modify_subscription(
            stripe_subscription_id,
            cancel_at_period_end=True,
        )

        # Update local subscription record (if it exists)
        if sub_doc:
            SubscriptionService.update_subscription_record(sub_doc, cancel_at_period_end=True)

        # Also update the user document to mark subscription as canceling
        SubscriptionService.update_user_subscription(
            db, user_id,
            tier=user_subscription_tier,
            cancel_at_period_end=True,
        )

        # Get current_period_end from Stripe subscription (most accurate)
        current_period_end = None
        if stripe_sub.current_period_end:
            current_period_end = datetime.fromtimestamp(stripe_sub.current_period_end, tz=timezone.utc)
        elif sub_data and sub_data.get("current_period_end"):
            current_period_end = SubscriptionService.convert_firestore_timestamp(
                sub_data.get("current_period_end")
            )

        subscription_id = sub_doc.id if sub_doc else stripe_subscription_id

        return CancelSubscriptionResponse(
            subscription_id=subscription_id,
            status=SubscriptionStatus.ACTIVE,
            cancel_at_period_end=True,
            current_period_end=current_period_end,
            message="Subscription will be canceled at the end of the billing period. You will retain access until then.",
        )

    except stripe.error.StripeError as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")


@router.post("/switch-billing-period", response_model=SwitchBillingPeriodResponse)
@limiter.limit("5/minute")
async def switch_billing_period(
    request: Request,
    switch_request: SwitchBillingPeriodRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Switch between monthly and annual billing for an existing subscription.

    This endpoint:
    1. Finds the user's active subscription
    2. Updates the Stripe subscription to use the corresponding price
    3. Stripe prorates the difference (customer pays difference or gets credit)
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Find current active subscription
    subs_query = db.collection("subscriptions")\
        .where("user_id", "==", user_id)\
        .where("status", "==", SubscriptionStatus.ACTIVE.value)\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found"
        )

    sub_doc = subs_list[0]
    sub_data = sub_doc.to_dict()
    current_tier = SubscriptionTier(sub_data.get("tier"))
    stripe_subscription_id = sub_data.get("stripe_subscription_id")

    if not stripe_subscription_id:
        raise HTTPException(status_code=500, detail="Subscription missing Stripe ID")

    # Get the new price ID (annual or monthly)
    tiers = get_subscription_tiers(annual=switch_request.annual)
    tier_config = tiers.get(current_tier)

    if not tier_config or not tier_config.get("stripe_price_id"):
        raise HTTPException(status_code=500, detail="Price configuration not found")

    new_price_id = tier_config["stripe_price_id"]
    billing_period = "year" if switch_request.annual else "month"

    try:
        # Retrieve the Stripe subscription
        stripe_sub = stripe.Subscription.retrieve(stripe_subscription_id)
        subscription_item_id = stripe_sub["items"]["data"][0]["id"]

        # Update the subscription with new price
        updated_sub = stripe.Subscription.modify(
            stripe_subscription_id,
            items=[{
                "id": subscription_item_id,
                "price": new_price_id,
            }],
            proration_behavior="create_prorations",
            metadata={
                "billing_period": billing_period,
            },
        )

        # Update local subscription record
        sub_doc.reference.update({
            "billing_period": billing_period,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Update user's billing_period
        user_ref = db.collection("users").document(user_id)
        user_ref.update({
            "billing_period": billing_period,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Create transaction record for billing period switch
        # IMPORTANT: Use credit_transactions collection (not transactions) for visibility in billing history
        transaction_type = "billing_switch_annual" if switch_request.annual else "billing_switch_monthly"
        transaction_data = {
            "user_id": user_id,
            "type": transaction_type,
            "amount": 0,  # No credit change, billing cycle only
            "amount_cents": 0,  # Stripe handles prorated charges separately
            "status": "completed",
            "description": f"Switched to {'annual' if switch_request.annual else 'monthly'} billing" +
                          (" - Save 20%!" if switch_request.annual else ""),
            "balance_before": None,  # No credit change
            "balance_after": None,
            "related_stripe_payment_id": stripe_subscription_id,
            "metadata": {
                "subscription_id": sub_data.get("subscription_id"),
                "tier": current_tier.value,
                "previous_billing_period": "year" if not switch_request.annual else "month",
                "new_billing_period": billing_period,
                "stripe_subscription_id": stripe_subscription_id,
            },
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        db.collection("credit_transactions").add(transaction_data)

        return SwitchBillingPeriodResponse(
            subscription_id=sub_data.get("subscription_id"),
            billing_period=billing_period,
            message=f"Switched to {'annual' if switch_request.annual else 'monthly'} billing. Stripe will prorate your charges.",
        )

    except stripe.error.StripeError as e:
        logger.error(f"Failed to switch billing period: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to switch billing period: {str(e)}")


@router.post("/sync-from-stripe")
async def sync_subscription_from_stripe(
    user_id: str = Depends(get_current_user_id)
):
    """
    Sync subscription data from Stripe to Firestore.

    This endpoint:
    1. Looks up user's Stripe customer
    2. Finds their active subscription in Stripe
    3. Creates/updates the subscription in Firestore
    4. Updates user's subscription_tier and credits

    Useful for recovering from webhook failures or manual testing.
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    stripe_customer_id = user_data.get("stripe_customer_id")

    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="User has no Stripe customer ID")

    try:
        # List subscriptions for this customer
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=1
        )

        if not subscriptions.data:
            raise HTTPException(status_code=404, detail="No active subscription found in Stripe")

        stripe_sub = subscriptions.data[0]
        stripe_subscription_id = stripe_sub.id
        metadata = stripe_sub.metadata

        tier = metadata.get("tier", "creator")
        monthly_credits_str = metadata.get("monthly_credits", "400")
        try:
            monthly_credits = int(monthly_credits_str)
        except ValueError:
            monthly_credits = 400

        # Check if subscription already exists in Firestore
        existing_subs = db.collection("subscriptions")\
            .where("stripe_subscription_id", "==", stripe_subscription_id)\
            .limit(1)\
            .get()

        existing_list = list(existing_subs)
        now = datetime.now(timezone.utc)

        if existing_list:
            # Update existing subscription
            sub_doc = existing_list[0]
            sub_doc.reference.update({
                "status": SubscriptionStatus.ACTIVE.value,
                "tier": tier,
                "monthly_credits": monthly_credits,
                "current_period_start": datetime.fromtimestamp(stripe_sub.current_period_start, tz=timezone.utc),
                "current_period_end": datetime.fromtimestamp(stripe_sub.current_period_end, tz=timezone.utc),
                "cancel_at_period_end": stripe_sub.cancel_at_period_end,
                "updated_at": now,
            })
            subscription_id = sub_doc.to_dict().get("subscription_id")
        else:
            # Create new subscription document
            subscription_id = generate_subscription_id()
            tiers = get_subscription_tiers()
            tier_config = tiers.get(SubscriptionTier(tier), {})
            credits_rollover_cap = tier_config.get("credits_rollover_cap", monthly_credits * 2)

            sub_data = {
                "subscription_id": subscription_id,
                "user_id": user_id,
                "stripe_subscription_id": stripe_subscription_id,
                "stripe_customer_id": stripe_customer_id,
                "tier": tier,
                "status": SubscriptionStatus.ACTIVE.value,
                "monthly_credits": monthly_credits,
                "credits_rollover_cap": credits_rollover_cap,
                "current_period_start": datetime.fromtimestamp(stripe_sub.current_period_start, tz=timezone.utc),
                "current_period_end": datetime.fromtimestamp(stripe_sub.current_period_end, tz=timezone.utc),
                "cancel_at_period_end": stripe_sub.cancel_at_period_end,
                "created_at": now,
                "updated_at": now,
            }
            db.collection("subscriptions").document(subscription_id).set(sub_data)

        # Update user document
        current_balance = user_data.get("credits_balance", 0)

        # Only add credits if tier is changing from free
        credits_to_add = 0
        if user_data.get("subscription_tier") == "free":
            credits_to_add = monthly_credits

        user_ref.update({
            "subscription_tier": tier,
            "credits_balance": current_balance + credits_to_add,
            "updated_at": now,
        })

        return {
            "message": "Subscription synced successfully",
            "subscription_id": subscription_id,
            "tier": tier,
            "monthly_credits": monthly_credits,
            "credits_added": credits_to_add,
            "stripe_subscription_id": stripe_subscription_id,
        }

    except stripe.error.StripeError as e:
        logger.error(f"Failed to sync subscription: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync subscription: {str(e)}")


@router.post("/sync-billing-period")
async def sync_billing_period(
    user_id: str = Depends(get_current_user_id)
):
    """
    Sync billing_period from Stripe for the current user.

    This endpoint:
    1. Looks up user's active Stripe subscription
    2. Gets the billing interval (month/year) from the price
    3. Updates the user's billing_period field

    Useful for fixing missing billing_period on legacy accounts.
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    subscription_tier = user_data.get("subscription_tier", "free")

    # Skip free tier users
    if subscription_tier == "free":
        return {
            "billing_period": None,
            "message": "Free tier users do not have a billing period",
        }

    stripe_customer_id = user_data.get("stripe_customer_id")
    stripe_subscription_id = user_data.get("stripe_subscription_id")

    billing_period = None

    try:
        # First try using subscription ID if we have it
        if stripe_subscription_id:
            try:
                subscription = stripe.Subscription.retrieve(stripe_subscription_id)
                if subscription.status == "active" and subscription.items and subscription.items.data:
                    item = subscription.items.data[0]
                    if item.price and item.price.recurring:
                        interval = item.price.recurring.interval
                        billing_period = "year" if interval == "year" else "month"
            except stripe.error.StripeError as e:
                logger.warning(f"Failed to retrieve subscription {stripe_subscription_id}: {e}")

        # If that didn't work, try using customer ID
        if not billing_period and stripe_customer_id:
            subscriptions = stripe.Subscription.list(
                customer=stripe_customer_id,
                status="active",
                limit=1
            )

            if subscriptions.data:
                subscription = subscriptions.data[0]
                if subscription.items and subscription.items.data:
                    item = subscription.items.data[0]
                    if item.price and item.price.recurring:
                        interval = item.price.recurring.interval
                        billing_period = "year" if interval == "year" else "month"

                    # Also update the subscription ID if we found it
                    if subscription.id != stripe_subscription_id:
                        user_ref.update({
                            "stripe_subscription_id": subscription.id,
                        })

        if not billing_period:
            raise HTTPException(
                status_code=404,
                detail="No active subscription found in Stripe"
            )

        # Update user's billing_period
        user_ref.update({
            "billing_period": billing_period,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        return {
            "billing_period": billing_period,
            "message": f"Successfully synced billing period to '{billing_period}'",
        }

    except stripe.error.StripeError as e:
        logger.error(f"Failed to sync billing period: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync from Stripe: {str(e)}")


@router.post("/customer-portal")
async def create_customer_portal_session(
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a Stripe Customer Portal session.

    The Customer Portal allows users to:
    - Update payment methods
    - View billing history
    - Download invoices
    - Manage subscriptions
    """
    StripeService.ensure_api_key()
    db = get_firestore_client()

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    stripe_customer_id = user_data.get("stripe_customer_id")

    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found. Complete a purchase first.")

    try:
        # Create a Customer Portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url="https://nuumee.ai/billing",
        )

        return {
            "url": portal_session.url,
        }

    except stripe.error.InvalidRequestError as e:
        logger.error(f"Stripe Customer Portal not configured or invalid request: {e}")
        if "No portal configuration" in str(e) or "configuration" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Customer Portal not configured. Please configure it in Stripe Dashboard > Settings > Customer Portal."
            )
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    except stripe.error.StripeError as e:
        logger.error(f"Failed to create customer portal session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")
