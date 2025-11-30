"""Stripe webhook handler."""
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Header
from google.cloud import secretmanager, firestore
import stripe

from ..auth.firebase import get_firestore_client
from ..subscriptions.models import SubscriptionTier, SubscriptionStatus, SUBSCRIPTION_TIERS


router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def get_stripe_webhook_secret() -> str:
    """Get Stripe webhook secret from Secret Manager."""
    project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

    # Check if using Secret Manager
    if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/stripe-webhook-secret/versions/latest"
            response = client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8").strip()
        except Exception as e:
            print(f"Failed to get webhook secret from Secret Manager: {e}")

    # Fallback to environment variable (local dev)
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

    This endpoint:
    1. Verifies the webhook signature
    2. Handles checkout.session.completed events
    3. Adds purchased credits to user's balance
    4. Logs the transaction

    Events handled:
    - checkout.session.completed: Credit purchase completed
    """
    # Get raw body for signature verification
    payload = await request.body()

    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    # Get webhook secret
    try:
        webhook_secret = get_stripe_webhook_secret()
        print(f"[WEBHOOK] Got secret: {webhook_secret[:10]}... (len={len(webhook_secret)})")
    except ValueError as e:
        print(f"[WEBHOOK] Secret error: {e}")
        raise HTTPException(status_code=500, detail="Webhook configuration error")

    # Log signature header for debug
    sig_parts = stripe_signature.split(",")
    print(f"[WEBHOOK] Signature header parts: {len(sig_parts)}")
    for part in sig_parts:
        key_val = part.split("=", 1)
        if len(key_val) == 2:
            print(f"[WEBHOOK] Sig part: {key_val[0]}={key_val[1][:20]}...")
    print(f"[WEBHOOK] Payload length: {len(payload)}")
    print(f"[WEBHOOK] Payload preview: {payload[:100]}...")

    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=webhook_secret
        )
        print(f"[WEBHOOK] Signature verified! Event type: {event.get('type')}")
    except ValueError as e:
        print(f"[WEBHOOK] Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print(f"[WEBHOOK] Signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        # Check if this is a subscription checkout or one-time purchase
        mode = session.get("mode")
        if mode == "subscription":
            await handle_subscription_created(session)
        else:
            await handle_checkout_completed(session)
    elif event_type == "invoice.paid":
        invoice = event["data"]["object"]
        await handle_invoice_paid(invoice)
    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription)
    elif event_type == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription)
    else:
        print(f"Unhandled event type: {event_type}")

    # Return success immediately (Stripe requires quick response)
    return {"received": True}


async def handle_checkout_completed(session: dict):
    """
    Handle successful checkout completion.

    This function:
    1. Retrieves user by customer_id
    2. Adds credits to user's balance
    3. Creates a credit transaction record
    """
    # Extract metadata
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    package_id = metadata.get("package_id")
    credits_str = metadata.get("credits")

    if not user_id or not credits_str:
        print(f"Missing metadata in session: {session.get('id')}")
        return

    try:
        credits = int(credits_str)
    except ValueError:
        print(f"Invalid credits value: {credits_str}")
        return

    # Get Firestore client
    db = get_firestore_client()

    # Use transaction for atomic credit addition
    @firestore.transactional
    def add_credits_transaction(transaction, user_ref, txn_ref):
        """Atomic transaction to add credits and log it."""
        # Get current user data
        user_doc = user_ref.get(transaction=transaction)

        if not user_doc.exists:
            print(f"User not found: {user_id}")
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + credits

        # Update user's credit balance
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        # Create credit transaction record
        transaction.set(txn_ref, {
            "transaction_id": txn_ref.id,
            "user_id": user_id,
            "type": "purchase",
            "amount": credits,
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"{package_id.capitalize()} credit package purchase",
            "related_job_id": None,
            "related_transaction_id": None,
            "related_stripe_payment_id": session.get("payment_intent"),
            "related_referral_code": None,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        print(f"Added {credits} credits to user {user_id}. New balance: {new_balance}")

    # Execute transaction
    user_ref = db.collection("users").document(user_id)
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        add_credits_transaction(transaction, user_ref, txn_ref)
    except Exception as e:
        print(f"Failed to add credits: {e}")
        # Don't raise - we've already received the payment
        # Manual intervention may be needed


async def handle_subscription_created(session: dict):
    """
    Handle subscription checkout completion.

    This function:
    1. Creates subscription record in Firestore
    2. Grants initial monthly credits to user
    3. Updates user's subscription tier
    """
    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id")
    tier = metadata.get("tier")
    monthly_credits_str = metadata.get("monthly_credits")
    stripe_subscription_id = session.get("subscription")
    stripe_customer_id = session.get("customer")

    if not user_id or not tier or not stripe_subscription_id:
        print(f"Missing metadata in subscription session: {session.get('id')}")
        return

    try:
        monthly_credits = int(monthly_credits_str) if monthly_credits_str else 0
    except ValueError:
        monthly_credits = SUBSCRIPTION_TIERS.get(SubscriptionTier(tier), {}).get("monthly_credits", 0)

    db = get_firestore_client()
    now = datetime.now(timezone.utc)

    # Generate subscription ID
    subscription_id = f"sub_{uuid.uuid4().hex[:12]}"

    # Get tier config for rollover cap
    tier_config = SUBSCRIPTION_TIERS.get(SubscriptionTier(tier), {})
    credits_rollover_cap = tier_config.get("credits_rollover_cap", monthly_credits * 2)

    # Create subscription document
    sub_data = {
        "subscription_id": subscription_id,
        "user_id": user_id,
        "stripe_subscription_id": stripe_subscription_id,
        "stripe_customer_id": stripe_customer_id,
        "tier": tier,
        "status": SubscriptionStatus.ACTIVE.value,
        "monthly_credits": monthly_credits,
        "credits_rollover_cap": credits_rollover_cap,
        "current_period_start": now,
        "current_period_end": None,  # Will be updated from invoice
        "cancel_at_period_end": False,
        "created_at": now,
        "updated_at": now,
    }

    # Use transaction for atomic operations
    @firestore.transactional
    def create_subscription_transaction(transaction, user_ref, sub_ref, txn_ref):
        """Atomic transaction to create subscription and grant credits."""
        user_doc = user_ref.get(transaction=transaction)

        if not user_doc.exists:
            print(f"User not found: {user_id}")
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + monthly_credits

        # Update user with subscription info and credits
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "subscription_tier": tier,
            "stripe_customer_id": stripe_customer_id,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Create subscription document
        transaction.set(sub_ref, sub_data)

        # Create credit transaction record
        transaction.set(txn_ref, {
            "transaction_id": txn_ref.id,
            "user_id": user_id,
            "type": "subscription",
            "amount": monthly_credits,
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"{tier.capitalize()} subscription - initial credits",
            "related_job_id": None,
            "related_transaction_id": None,
            "related_stripe_payment_id": stripe_subscription_id,
            "related_referral_code": None,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        print(f"Created subscription for user {user_id}, tier {tier}, granted {monthly_credits} credits")

    user_ref = db.collection("users").document(user_id)
    sub_ref = db.collection("subscriptions").document(subscription_id)
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        create_subscription_transaction(transaction, user_ref, sub_ref, txn_ref)
    except Exception as e:
        print(f"Failed to create subscription: {e}")


async def handle_invoice_paid(invoice: dict):
    """
    Handle invoice.paid event for subscription renewals.

    This grants monthly credits on each successful payment.
    Skips the initial invoice (handled by handle_subscription_created).
    """
    # Check if this is a subscription invoice
    subscription_id = invoice.get("subscription")
    if not subscription_id:
        print(f"Invoice {invoice.get('id')} is not for a subscription")
        return

    # Skip if this is the first invoice (initial subscription)
    billing_reason = invoice.get("billing_reason")
    if billing_reason == "subscription_create":
        print(f"Skipping initial subscription invoice {invoice.get('id')}")
        return

    # Only process renewal invoices
    if billing_reason not in ["subscription_cycle", "subscription_update"]:
        print(f"Skipping invoice with billing_reason: {billing_reason}")
        return

    db = get_firestore_client()

    # Find subscription by Stripe subscription ID
    subs_query = db.collection("subscriptions")\
        .where("stripe_subscription_id", "==", subscription_id)\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        print(f"Subscription not found for Stripe ID: {subscription_id}")
        return

    sub_doc = subs_list[0]
    sub_data = sub_doc.to_dict()
    user_id = sub_data.get("user_id")
    monthly_credits = sub_data.get("monthly_credits", 0)
    tier = sub_data.get("tier")

    if not user_id or monthly_credits <= 0:
        print(f"Invalid subscription data: user_id={user_id}, credits={monthly_credits}")
        return

    # Get period dates from invoice
    period_start = invoice.get("period_start")
    period_end = invoice.get("period_end")

    if period_start:
        period_start = datetime.fromtimestamp(period_start, tz=timezone.utc)
    if period_end:
        period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)

    # Use transaction to add credits
    @firestore.transactional
    def add_renewal_credits_transaction(transaction, user_ref, sub_ref, txn_ref):
        """Atomic transaction to add renewal credits."""
        user_doc = user_ref.get(transaction=transaction)

        if not user_doc.exists:
            print(f"User not found: {user_id}")
            return

        user_data = user_doc.to_dict()
        current_balance = user_data.get("credits_balance", 0)
        new_balance = current_balance + monthly_credits

        # Apply rollover cap if configured
        credits_rollover_cap = sub_data.get("credits_rollover_cap")
        if credits_rollover_cap and new_balance > credits_rollover_cap:
            new_balance = credits_rollover_cap
            print(f"Applied rollover cap: {new_balance} (cap: {credits_rollover_cap})")

        # Update user credits
        transaction.update(user_ref, {
            "credits_balance": new_balance,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        # Update subscription period
        update_data = {"updated_at": firestore.SERVER_TIMESTAMP}
        if period_start:
            update_data["current_period_start"] = period_start
        if period_end:
            update_data["current_period_end"] = period_end
        transaction.update(sub_ref, update_data)

        # Create credit transaction record
        transaction.set(txn_ref, {
            "transaction_id": txn_ref.id,
            "user_id": user_id,
            "type": "subscription_renewal",
            "amount": monthly_credits,
            "balance_before": current_balance,
            "balance_after": new_balance,
            "description": f"{tier.capitalize()} subscription renewal credits",
            "related_job_id": None,
            "related_transaction_id": None,
            "related_stripe_payment_id": invoice.get("payment_intent"),
            "related_referral_code": None,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

        print(f"Added {monthly_credits} renewal credits to user {user_id}. New balance: {new_balance}")

    user_ref = db.collection("users").document(user_id)
    sub_ref = sub_doc.reference
    txn_ref = db.collection("credit_transactions").document()
    transaction = db.transaction()

    try:
        add_renewal_credits_transaction(transaction, user_ref, sub_ref, txn_ref)
    except Exception as e:
        print(f"Failed to add renewal credits: {e}")


async def handle_subscription_deleted(subscription: dict):
    """
    Handle subscription cancellation/deletion from Stripe.

    Updates subscription status to canceled.
    """
    stripe_subscription_id = subscription.get("id")
    if not stripe_subscription_id:
        return

    db = get_firestore_client()

    # Find subscription by Stripe subscription ID
    subs_query = db.collection("subscriptions")\
        .where("stripe_subscription_id", "==", stripe_subscription_id)\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        print(f"Subscription not found for deletion: {stripe_subscription_id}")
        return

    sub_doc = subs_list[0]
    sub_data = sub_doc.to_dict()
    user_id = sub_data.get("user_id")

    # Update subscription status
    sub_doc.reference.update({
        "status": SubscriptionStatus.CANCELED.value,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Update user's subscription tier to free
    if user_id:
        db.collection("users").document(user_id).update({
            "subscription_tier": "free",
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

    print(f"Subscription {stripe_subscription_id} deleted for user {user_id}")


async def handle_subscription_updated(subscription: dict):
    """
    Handle subscription updates from Stripe.

    Updates period dates and status changes.
    """
    stripe_subscription_id = subscription.get("id")
    if not stripe_subscription_id:
        return

    db = get_firestore_client()

    # Find subscription by Stripe subscription ID
    subs_query = db.collection("subscriptions")\
        .where("stripe_subscription_id", "==", stripe_subscription_id)\
        .limit(1)\
        .get()

    subs_list = list(subs_query)
    if not subs_list:
        print(f"Subscription not found for update: {stripe_subscription_id}")
        return

    sub_doc = subs_list[0]

    # Extract update data
    update_data = {"updated_at": firestore.SERVER_TIMESTAMP}

    # Status
    status = subscription.get("status")
    if status:
        status_map = {
            "active": SubscriptionStatus.ACTIVE.value,
            "past_due": SubscriptionStatus.PAST_DUE.value,
            "unpaid": SubscriptionStatus.UNPAID.value,
            "canceled": SubscriptionStatus.CANCELED.value,
        }
        if status in status_map:
            update_data["status"] = status_map[status]

    # Period dates
    current_period_start = subscription.get("current_period_start")
    current_period_end = subscription.get("current_period_end")
    if current_period_start:
        update_data["current_period_start"] = datetime.fromtimestamp(current_period_start, tz=timezone.utc)
    if current_period_end:
        update_data["current_period_end"] = datetime.fromtimestamp(current_period_end, tz=timezone.utc)

    # Cancel at period end
    cancel_at_period_end = subscription.get("cancel_at_period_end")
    if cancel_at_period_end is not None:
        update_data["cancel_at_period_end"] = cancel_at_period_end

    sub_doc.reference.update(update_data)
    print(f"Updated subscription {stripe_subscription_id}")
