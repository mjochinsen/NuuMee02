"""Stripe webhook handler."""
import os
from fastapi import APIRouter, Request, HTTPException, Header
from google.cloud import secretmanager, firestore
import stripe

from ..auth.firebase import get_firestore_client


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
        await handle_checkout_completed(session)
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
