"""Subscription business logic service."""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Tuple
from google.cloud import firestore
import stripe

from ..models import SubscriptionTier, SubscriptionStatus, get_subscription_tiers

logger = logging.getLogger(__name__)


class SubscriptionService:
    """Service for subscription business logic."""

    @staticmethod
    def generate_subscription_id() -> str:
        """Generate a unique subscription ID."""
        return f"sub_{uuid.uuid4().hex[:12]}"

    @staticmethod
    def get_active_subscription(db, user_id: str) -> Optional[Tuple]:
        """
        Get user's active subscription.

        Returns:
            Tuple of (doc, data) or None if not found
        """
        subs_query = (
            db.collection("subscriptions")
            .where("user_id", "==", user_id)
            .where("status", "in", [SubscriptionStatus.ACTIVE.value, SubscriptionStatus.PAST_DUE.value])
            .limit(1)
            .get()
        )

        subs_list = list(subs_query)
        if not subs_list:
            return None

        return subs_list[0], subs_list[0].to_dict()

    @staticmethod
    def calculate_tier_change_credits(
        old_tier: SubscriptionTier,
        new_tier: SubscriptionTier,
        current_balance: int,
    ) -> Tuple[int, int, str]:
        """
        Calculate credits change for tier upgrade/downgrade.

        Args:
            old_tier: Current subscription tier
            new_tier: Target subscription tier
            current_balance: User's current credit balance

        Returns:
            Tuple of (credits_to_add, new_balance, action_type)
        """
        tiers = get_subscription_tiers()
        old_config = tiers.get(old_tier, {})
        new_config = tiers.get(new_tier, {})

        old_credits = old_config.get("monthly_credits", 0)
        new_credits = new_config.get("monthly_credits", 0)

        if new_credits > old_credits:
            # Upgrading - grant the difference
            credits_to_add = new_credits - old_credits
            return credits_to_add, current_balance + credits_to_add, "upgraded"
        else:
            # Downgrading - keep all credits (no removal)
            return 0, current_balance, "downgraded"

    @staticmethod
    def create_tier_change_transaction(
        db,
        user_id: str,
        old_tier: SubscriptionTier,
        new_tier: SubscriptionTier,
        credits_added: int,
        balance_before: int,
        balance_after: int,
        stripe_subscription_id: str,
        amount_cents: Optional[int] = None,
        receipt_url: Optional[str] = None,
    ) -> None:
        """Record a tier change transaction."""
        tx_type = "subscription_upgrade" if credits_added > 0 else "subscription_downgrade"
        description = (
            f"{'Upgraded' if credits_added > 0 else 'Downgraded'} from "
            f"{old_tier.value.capitalize()} to {new_tier.value.capitalize()}"
        )
        if credits_added > 0:
            description += f" (+{credits_added} credits)"
        else:
            description += " (credits preserved)"

        # Try to get invoice/receipt info from Stripe if not provided
        if credits_added > 0 and (amount_cents is None or receipt_url is None):
            try:
                # Fetch the latest invoice for this subscription
                invoices = stripe.Invoice.list(
                    subscription=stripe_subscription_id,
                    limit=1
                )
                if invoices.data:
                    latest_invoice = invoices.data[0]
                    if amount_cents is None:
                        amount_cents = latest_invoice.get("amount_paid", 0)
                    if receipt_url is None:
                        receipt_url = latest_invoice.get("hosted_invoice_url")
            except Exception as e:
                logger.warning(f"Failed to fetch invoice for tier change: {e}")

        db.collection("credit_transactions").add({
            "user_id": user_id,
            "type": tx_type,
            "amount": credits_added,
            "amount_cents": amount_cents,
            "status": "completed",
            "balance_before": balance_before,
            "balance_after": balance_after,
            "description": description,
            "related_stripe_payment_id": stripe_subscription_id,
            "receipt_url": receipt_url,
            "created_at": firestore.SERVER_TIMESTAMP,
        })

    @staticmethod
    def update_user_subscription(
        db,
        user_id: str,
        tier: str,
        credits_balance: Optional[int] = None,
        billing_period: Optional[str] = None,
        cancel_at_period_end: Optional[bool] = None,
    ) -> None:
        """Update user's subscription fields."""
        user_ref = db.collection("users").document(user_id)

        update_data = {
            "subscription_tier": tier,
            "updated_at": firestore.SERVER_TIMESTAMP,
        }

        if credits_balance is not None:
            update_data["credits_balance"] = credits_balance

        if billing_period is not None:
            update_data["billing_period"] = billing_period

        if cancel_at_period_end is not None:
            update_data["subscription_cancel_at_period_end"] = cancel_at_period_end

        user_ref.update(update_data)

    @staticmethod
    def update_subscription_record(
        sub_doc,
        tier: Optional[str] = None,
        monthly_credits: Optional[int] = None,
        credits_rollover_cap: Optional[int] = None,
        billing_period: Optional[str] = None,
        cancel_at_period_end: Optional[bool] = None,
        status: Optional[str] = None,
    ) -> None:
        """Update subscription document fields."""
        update_data = {"updated_at": firestore.SERVER_TIMESTAMP}

        if tier is not None:
            update_data["tier"] = tier
        if monthly_credits is not None:
            update_data["monthly_credits"] = monthly_credits
        if credits_rollover_cap is not None:
            update_data["credits_rollover_cap"] = credits_rollover_cap
        if billing_period is not None:
            update_data["billing_period"] = billing_period
        if cancel_at_period_end is not None:
            update_data["cancel_at_period_end"] = cancel_at_period_end
        if status is not None:
            update_data["status"] = status

        sub_doc.reference.update(update_data)

    @staticmethod
    def create_billing_switch_transaction(
        db,
        user_id: str,
        annual: bool,
        subscription_id: str,
        tier: str,
        stripe_subscription_id: str,
    ) -> None:
        """Record a billing period switch transaction."""
        tx_type = "billing_switch_annual" if annual else "billing_switch_monthly"
        billing_period = "year" if annual else "month"

        # Try to get invoice/receipt info from Stripe
        amount_cents = None
        receipt_url = None
        try:
            invoices = stripe.Invoice.list(
                subscription=stripe_subscription_id,
                limit=1
            )
            if invoices.data:
                latest_invoice = invoices.data[0]
                amount_cents = latest_invoice.get("amount_paid", 0)
                receipt_url = latest_invoice.get("hosted_invoice_url")
        except Exception as e:
            logger.warning(f"Failed to fetch invoice for billing switch: {e}")

        db.collection("credit_transactions").add({
            "user_id": user_id,
            "type": tx_type,
            "amount": 0,
            "amount_cents": amount_cents,
            "status": "completed",
            "balance_before": None,
            "balance_after": None,
            "description": f"Switched to {'annual' if annual else 'monthly'} billing",
            "related_stripe_payment_id": stripe_subscription_id,
            "receipt_url": receipt_url,
            "metadata": {
                "subscription_id": subscription_id,
                "tier": tier,
                "new_billing_period": billing_period,
            },
            "created_at": firestore.SERVER_TIMESTAMP,
        })

    @staticmethod
    def convert_firestore_timestamp(value) -> Optional[datetime]:
        """Convert Firestore timestamp to datetime."""
        if value is None:
            return None
        if hasattr(value, "timestamp"):
            return datetime.fromtimestamp(value.timestamp(), tz=timezone.utc)
        if isinstance(value, datetime):
            return value
        return None
