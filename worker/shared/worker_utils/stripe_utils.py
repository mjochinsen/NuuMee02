"""Stripe utilities for auto-refill and payment processing."""

import os
import logging
from typing import Optional

from google.cloud import firestore
import stripe

from .gcp import get_firestore, get_secret, PROJECT_ID
from .config import CREDIT_PACKAGES

logger = logging.getLogger(__name__)

# Stripe key loaded flag
_stripe_key_loaded = False


def ensure_stripe_key() -> None:
    """Ensure Stripe API key is set (lazy load from Secret Manager)."""
    global _stripe_key_loaded
    if _stripe_key_loaded:
        return

    # Try environment variable first
    api_key = os.environ.get("STRIPE_SECRET_KEY")
    if api_key:
        stripe.api_key = api_key
        _stripe_key_loaded = True
        return

    # Fall back to Secret Manager
    try:
        stripe.api_key = get_secret("stripe-secret-key", PROJECT_ID)
        _stripe_key_loaded = True
    except Exception as e:
        logger.error(f"Failed to get Stripe key from Secret Manager: {e}")


def check_and_trigger_auto_refill(user_id: str) -> Optional[dict]:
    """Check if auto-refill should be triggered and process if needed.

    This is called after a job completes to check if the user's balance
    has dropped below their auto-refill threshold.

    Args:
        user_id: User document ID

    Returns:
        Dict with refill details if triggered, None otherwise
    """
    db = get_firestore()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return None

    user_data = user_doc.to_dict()
    auto_refill = user_data.get("auto_refill", {})

    # Check if auto-refill is enabled
    if not auto_refill.get("enabled", False):
        return None

    # Get current balance and threshold
    current_balance = user_data.get("credits_balance", 0)
    threshold = auto_refill.get("threshold", 10)
    package_id = auto_refill.get("package_id", "starter")

    # Check if balance is below threshold
    if current_balance >= threshold:
        return None

    # Get Stripe customer ID
    stripe_customer_id = user_data.get("stripe_customer_id")
    if not stripe_customer_id:
        logger.warning(f"Auto-refill enabled for user {user_id} but no Stripe customer ID")
        return None

    # Get package details
    package = CREDIT_PACKAGES.get(package_id)
    if not package:
        logger.error(f"Invalid auto-refill package_id: {package_id}")
        return None

    logger.info(f"Triggering auto-refill for user {user_id}: balance={current_balance}, threshold={threshold}")

    try:
        ensure_stripe_key()

        # Get customer's default payment method
        customer = stripe.Customer.retrieve(stripe_customer_id)
        default_pm = None
        if customer.invoice_settings and customer.invoice_settings.default_payment_method:
            default_pm = customer.invoice_settings.default_payment_method

        if not default_pm:
            # Try to get first attached payment method
            payment_methods = stripe.PaymentMethod.list(
                customer=stripe_customer_id,
                type="card",
                limit=1
            )
            if payment_methods.data:
                default_pm = payment_methods.data[0].id
            else:
                logger.warning(f"No payment method for auto-refill user {user_id}")
                return None

        # Create PaymentIntent and charge immediately
        payment_intent = stripe.PaymentIntent.create(
            amount=package["price_cents"],
            currency="usd",
            customer=stripe_customer_id,
            payment_method=default_pm,
            off_session=True,
            confirm=True,
            description=f"NuuMee Auto-Refill: {package['name']} Package",
            metadata={
                "user_id": user_id,
                "package_id": package_id,
                "credits": str(package["credits"]),
                "auto_refill": "true",
            }
        )

        if payment_intent.status == "succeeded":
            # Add credits to user's balance
            new_balance = current_balance + package["credits"]
            user_ref.update({
                "credits_balance": new_balance,
                "updated_at": firestore.SERVER_TIMESTAMP
            })

            # Record transaction
            transaction_ref = db.collection("transactions").document()
            transaction_ref.set({
                "id": transaction_ref.id,
                "user_id": user_id,
                "type": "credit_purchase",
                "amount": package["price_cents"] / 100,
                "credits": package["credits"],
                "description": f"Auto-Refill: {package['name']} Package",
                "stripe_payment_intent_id": payment_intent.id,
                "status": "completed",
                "metadata": {
                    "package_id": package_id,
                    "auto_refill": True,
                    "previous_balance": current_balance,
                    "new_balance": new_balance,
                },
                "created_at": firestore.SERVER_TIMESTAMP,
            })

            logger.info(f"Auto-refill successful for user {user_id}: +{package['credits']} credits, new balance={new_balance}")
            return {
                "triggered": True,
                "package_id": package_id,
                "credits_added": package["credits"],
                "amount_charged": package["price_cents"] / 100,
                "new_balance": new_balance,
            }
        else:
            logger.error(f"Auto-refill payment failed for user {user_id}: {payment_intent.status}")
            return None

    except stripe.error.CardError as e:
        logger.error(f"Auto-refill card declined for user {user_id}: {e}")
        return None
    except Exception as e:
        logger.exception(f"Auto-refill error for user {user_id}: {e}")
        return None
