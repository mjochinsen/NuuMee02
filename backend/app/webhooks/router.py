"""Stripe webhook handler - Simplified for Stripe Portal integration."""
import logging
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Header
from google.cloud import secretmanager, firestore
import stripe

from ..auth.firebase import get_firestore_client
from ..subscriptions.models import SubscriptionTier, SubscriptionStatus, get_subscription_tiers
from ..notifications import send as notify
from ..notifications.utils import build_referral_conversion_payload

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# Minimum purchase amount for referrer bonus (in cents)
REFERRER_BONUS_MIN_CENTS = 1000  # $10
REFERRER_BONUS_CREDITS = 100


async def grant_referrer_bonus(db, user_id: str, amount_cents: int) -> bool:
    """
    Grant referrer bonus if this is user's first qualifying purchase.

    Requirements per PRICING_STRATEGY.md:
    - Purchase must be ≥ $10 (1000 cents)
    - Only first purchase counts
    - Referrer gets 100 credits

    Args:
        db: Firestore client
        user_id: The user who made the purchase
        amount_cents: Purchase amount in cents

    Returns:
        True if bonus was granted, False otherwise
    """
    # Check minimum amount
    if not amount_cents or amount_cents < REFERRER_BONUS_MIN_CENTS:
        logger.info(f"Purchase ${amount_cents/100:.2f} below $10 minimum for referrer bonus")
        return False

    # Get user to check if they were referred
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return False

    user_data = user_doc.to_dict()
    referred_by = user_data.get("referred_by")

    if not referred_by:
        # User was not referred
        return False

    # Find the referral record
    referrals = list(db.collection("referrals")
        .where("referred_user_id", "==", user_id)
        .where("referral_code", "==", referred_by)
        .limit(1).get())

    if not referrals:
        logger.warning(f"Referral record not found for user {user_id} with code {referred_by}")
        return False

    referral_doc = referrals[0]
    referral_data = referral_doc.to_dict()

    # Check if bonus already granted
    if referral_data.get("referrer_bonus_granted", False):
        logger.info(f"Referrer bonus already granted for referral {referral_doc.id}")
        return False

    referrer_id = referral_data.get("referrer_id")
    if not referrer_id:
        return False

    # Grant 100 credits to referrer
    referrer_ref = db.collection("users").document(referrer_id)
    referrer_doc = referrer_ref.get()

    if not referrer_doc.exists:
        logger.warning(f"Referrer user {referrer_id} not found")
        return False

    referrer_data = referrer_doc.to_dict()
    referrer_balance = referrer_data.get("credits_balance", 0)
    new_referrer_balance = referrer_balance + REFERRER_BONUS_CREDITS

    # Update referrer's credits
    referrer_ref.update({
        "credits_balance": new_referrer_balance,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Update referral record
    referral_doc.reference.update({
        "status": "converted",
        "referrer_bonus_granted": True,
        "converted_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Create credit transaction for referrer
    db.collection("credit_transactions").add({
        "user_id": referrer_id,
        "type": "referral",
        "amount": REFERRER_BONUS_CREDITS,
        "amount_cents": None,  # No dollar amount for referral bonus
        "status": "completed",
        "balance_before": referrer_balance,
        "balance_after": new_referrer_balance,
        "description": f"Referral bonus - referred user made first purchase",
        "related_referral_code": referred_by,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

    logger.info(f"Granted {REFERRER_BONUS_CREDITS} credits to referrer {referrer_id} for user {user_id}'s first purchase")

    # Send notification to referrer (non-blocking)
    try:
        # Refresh referrer data to get updated balance
        referrer_data["credits_balance"] = new_referrer_balance
        payload = build_referral_conversion_payload(referrer_data, REFERRER_BONUS_CREDITS)
        result = notify(db, "referral.conversion", referrer_id, payload)
        if not result.sent:
            logger.warning(f"Referrer conversion email not sent for {referrer_id}: {result.reason}")
    except Exception as e:
        logger.warning(f"Failed to send referrer conversion notification: {e}")

    return True


def get_stripe_webhook_secret() -> str:
    """Get Stripe webhook secret from Secret Manager."""
    project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

    if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/stripe-webhook-secret/versions/latest"
            response = client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8").strip()
        except Exception as e:
            print(f"Failed to get webhook secret from Secret Manager: {e}")

    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not secret:
        raise ValueError("STRIPE_WEBHOOK_SECRET not configured")
    return secret


@router.post("/stripe")
async def handle_stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature")
):
    """
    Handle Stripe webhook events.

    Simplified to only handle:
    - checkout.session.completed: New subscription or credit purchase
    - invoice.paid: Subscription renewal credits
    - customer.subscription.deleted: Cancellation

    All other billing management is handled by Stripe Customer Portal.
    """
    payload = await request.body()

    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    try:
        webhook_secret = get_stripe_webhook_secret()
    except ValueError as e:
        raise HTTPException(status_code=500, detail="Webhook configuration error")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    print(f"[WEBHOOK] {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("mode") == "subscription":
            await handle_subscription_created(session)
        else:
            await handle_checkout_completed(session)
    elif event_type in ("invoice.paid", "invoice.payment_succeeded"):
        invoice = event["data"]["object"]
        await handle_invoice_paid(invoice)
    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription)

    return {"received": True}


async def handle_checkout_completed(session: dict):
    """Handle credit purchase checkout completion."""
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    credits_str = metadata.get("credits")

    if not user_id or not credits_str:
        print(f"Missing metadata in checkout session: {session.get('id')}")
        return

    try:
        credits = int(credits_str)
    except ValueError:
        return

    db = get_firestore_client()

    @firestore.transactional
    def add_credits(transaction, user_ref, txn_ref):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + credits

        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        transaction.set(txn_ref, {
            "user_id": user_id,
            "type": "purchase",
            "amount": credits,
            "amount_cents": session.get("amount_total"),
            "status": "completed",
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"Credit purchase",
            "related_stripe_payment_id": session.get("payment_intent"),
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        print(f"Added {credits} credits to user {user_id}")

    user_ref = db.collection("users").document(user_id)
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        add_credits(transaction, user_ref, txn_ref)
    except Exception as e:
        print(f"Failed to add credits: {e}")

    # Check for referrer bonus (first purchase ≥ $10)
    amount_cents = session.get("amount_total", 0)
    try:
        await grant_referrer_bonus(db, user_id, amount_cents)
    except Exception as e:
        logger.warning(f"Failed to process referrer bonus for {user_id}: {e}")


async def handle_subscription_created(session: dict):
    """Handle new subscription creation."""
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    tier = metadata.get("tier")
    monthly_credits_str = metadata.get("monthly_credits")
    billing_period = metadata.get("billing_period", "month")
    stripe_subscription_id = session.get("subscription")
    stripe_customer_id = session.get("customer")

    if not user_id or not tier or not stripe_subscription_id:
        print(f"Missing metadata in subscription session")
        return

    try:
        monthly_credits = int(monthly_credits_str) if monthly_credits_str else 0
    except ValueError:
        tiers = get_subscription_tiers()
        monthly_credits = tiers.get(SubscriptionTier(tier), {}).get("monthly_credits", 0)

    db = get_firestore_client()

    # Idempotency check
    existing = list(db.collection("subscriptions")
        .where("stripe_subscription_id", "==", stripe_subscription_id)
        .limit(1).get())
    if existing:
        print(f"Subscription already exists: {stripe_subscription_id}")
        return

    subscription_id = f"sub_{uuid.uuid4().hex[:12]}"
    tiers = get_subscription_tiers()
    tier_config = tiers.get(SubscriptionTier(tier), {})

    @firestore.transactional
    def create_subscription(transaction, user_ref, sub_ref, txn_ref):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + monthly_credits

        # Update user
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "subscription_tier": tier,
            "billing_period": billing_period,
            "stripe_customer_id": stripe_customer_id,
            "stripe_subscription_id": stripe_subscription_id,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Create subscription record
        transaction.set(sub_ref, {
            "subscription_id": subscription_id,
            "user_id": user_id,
            "stripe_subscription_id": stripe_subscription_id,
            "stripe_customer_id": stripe_customer_id,
            "tier": tier,
            "status": SubscriptionStatus.ACTIVE.value,
            "monthly_credits": monthly_credits,
            "credits_rollover_cap": tier_config.get("credits_rollover_cap", monthly_credits * 2),
            "cancel_at_period_end": False,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })

        # Log credit transaction
        transaction.set(txn_ref, {
            "user_id": user_id,
            "type": "subscription",
            "amount": monthly_credits,
            "amount_cents": session.get("amount_total"),
            "status": "completed",
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"{tier.capitalize()} subscription - initial credits",
            "related_stripe_payment_id": stripe_subscription_id,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        print(f"Created subscription for user {user_id}, tier {tier}, +{monthly_credits} credits")

    user_ref = db.collection("users").document(user_id)
    sub_ref = db.collection("subscriptions").document(subscription_id)
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        create_subscription(transaction, user_ref, sub_ref, txn_ref)
    except Exception as e:
        print(f"Failed to create subscription: {e}")

    # Check for referrer bonus (first subscription ≥ $10)
    amount_cents = session.get("amount_total", 0)
    try:
        await grant_referrer_bonus(db, user_id, amount_cents)
    except Exception as e:
        logger.warning(f"Failed to process referrer bonus for subscription {user_id}: {e}")


async def handle_invoice_paid(invoice: dict):
    """
    Handle subscription invoice payments.

    Billing reasons:
    - subscription_create: Initial subscription (handled by checkout.session.completed)
    - subscription_cycle: Monthly/annual renewal - grant credits
    - subscription_update: Plan change or billing period switch - log transaction
    """
    subscription_id = invoice.get("subscription")
    if not subscription_id:
        return

    billing_reason = invoice.get("billing_reason")

    # Handle renewals (grant credits)
    if billing_reason == "subscription_cycle":
        await handle_subscription_renewal(invoice, subscription_id)
        return

    # Handle plan changes and billing period switches (log transaction only)
    if billing_reason == "subscription_update":
        await handle_subscription_update(invoice, subscription_id)
        return

    # Skip initial subscription (handled by checkout.session.completed)
    return


async def handle_subscription_renewal(invoice: dict, subscription_id: str):
    """Handle subscription renewal - grant monthly credits."""
    db = get_firestore_client()

    # Idempotency check
    payment_intent = invoice.get("payment_intent")
    if payment_intent:
        existing = list(db.collection("credit_transactions")
            .where("related_stripe_payment_id", "==", payment_intent)
            .where("type", "==", "subscription_renewal")
            .limit(1).get())
        if existing:
            return

    # Find subscription
    subs = list(db.collection("subscriptions")
        .where("stripe_subscription_id", "==", subscription_id)
        .limit(1).get())

    if not subs:
        return

    sub_doc = subs[0]
    sub_data = sub_doc.to_dict()
    user_id = sub_data.get("user_id")
    monthly_credits = sub_data.get("monthly_credits", 0)
    tier = sub_data.get("tier")
    credits_rollover_cap = sub_data.get("credits_rollover_cap")

    if not user_id or monthly_credits <= 0:
        return

    @firestore.transactional
    def add_renewal_credits(transaction, user_ref, txn_ref):
        user_doc = user_ref.get(transaction=transaction)
        if not user_doc.exists:
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + monthly_credits

        # Apply rollover cap
        if credits_rollover_cap and new_balance > credits_rollover_cap:
            new_balance = credits_rollover_cap

        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        transaction.set(txn_ref, {
            "user_id": user_id,
            "type": "subscription_renewal",
            "amount": monthly_credits,
            "amount_cents": invoice.get("amount_paid"),
            "status": "completed",
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"{tier.capitalize()} subscription renewal",
            "related_stripe_payment_id": payment_intent,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        print(f"Renewal: +{monthly_credits} credits for user {user_id}")

    user_ref = db.collection("users").document(user_id)
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        add_renewal_credits(transaction, user_ref, txn_ref)
    except Exception as e:
        print(f"Failed to add renewal credits: {e}")


async def handle_subscription_update(invoice: dict, subscription_id: str):
    """Handle subscription changes (upgrades, downgrades, billing period switches)."""
    db = get_firestore_client()

    # Idempotency check
    invoice_id = invoice.get("id")
    if invoice_id:
        existing = list(db.collection("credit_transactions")
            .where("related_stripe_payment_id", "==", invoice_id)
            .where("type", "==", "subscription_change")
            .limit(1).get())
        if existing:
            return

    # Find subscription
    subs = list(db.collection("subscriptions")
        .where("stripe_subscription_id", "==", subscription_id)
        .limit(1).get())

    if not subs:
        return

    sub_doc = subs[0]
    sub_data = sub_doc.to_dict()
    user_id = sub_data.get("user_id")
    tier = sub_data.get("tier", "unknown")

    if not user_id:
        return

    # Get amount from invoice (can be positive, negative, or zero due to proration)
    amount_paid = invoice.get("amount_paid", 0)  # In cents
    amount_due = invoice.get("amount_due", 0)

    # Determine description from invoice lines
    lines = invoice.get("lines", {}).get("data", [])
    description_parts = []
    for line in lines[:2]:  # Take first 2 lines for description
        line_desc = line.get("description", "")
        if line_desc:
            description_parts.append(line_desc)

    description = " | ".join(description_parts) if description_parts else f"{tier.capitalize()} subscription change"

    # Create transaction record
    txn_ref = db.collection("credit_transactions").document()
    txn_ref.set({
        "user_id": user_id,
        "type": "subscription_change",
        "amount": 0,  # No credits added for plan changes
        "amount_cents": amount_paid,
        "status": "completed",
        "description": description[:200],  # Truncate if too long
        "related_stripe_payment_id": invoice_id,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

    print(f"Logged subscription change for user {user_id}: {description[:50]}")


async def handle_subscription_deleted(subscription: dict):
    """Handle subscription cancellation."""
    stripe_subscription_id = subscription.get("id")
    if not stripe_subscription_id:
        return

    db = get_firestore_client()

    subs = list(db.collection("subscriptions")
        .where("stripe_subscription_id", "==", stripe_subscription_id)
        .limit(1).get())

    if not subs:
        return

    sub_doc = subs[0]
    sub_data = sub_doc.to_dict()
    user_id = sub_data.get("user_id")

    # Update subscription status
    sub_doc.reference.update({
        "status": SubscriptionStatus.CANCELED.value,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Update user tier to free
    if user_id:
        db.collection("users").document(user_id).update({
            "subscription_tier": "free",
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

    print(f"Subscription canceled for user {user_id}")


# Include WaveSpeed webhook router
from .wavespeed import router as wavespeed_router
router.include_router(wavespeed_router)
