"""Payment analytics service for admin panel."""
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Optional
import time

import stripe

from ..schemas import (
    PaymentsResponse,
    PaymentStats,
    PaymentTransaction,
    PaymentTransactionType,
    PaymentStatus,
)

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Simple in-memory cache for Stripe data
_cache: dict = {}
CACHE_TTL = 300  # 5 minutes


def _get_cached(key: str) -> Optional[dict]:
    """Get cached value if not expired."""
    if key in _cache:
        data, timestamp = _cache[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
        del _cache[key]
    return None


def _set_cached(key: str, data: dict):
    """Set cached value with timestamp."""
    _cache[key] = (data, time.time())


async def get_payments(limit: int = 50) -> PaymentsResponse:
    """Get payment analytics and recent transactions."""
    # Try to get from cache
    cache_key = f"payments_{limit}"
    cached = _get_cached(cache_key)
    if cached:
        return PaymentsResponse(**cached)

    # Calculate stats from Stripe
    mrr = 0.0
    total_revenue = 0.0
    subscriber_count = 0

    try:
        # Get active subscriptions for MRR
        subscriptions = stripe.Subscription.list(status="active", limit=100)
        for sub in subscriptions.auto_paging_iter():
            subscriber_count += 1
            for item in sub.get("items", {}).get("data", []):
                price = item.get("price", {})
                unit_amount = price.get("unit_amount", 0) / 100  # Convert cents to dollars
                interval = price.get("recurring", {}).get("interval", "month")
                if interval == "month":
                    mrr += unit_amount
                elif interval == "year":
                    mrr += unit_amount / 12

        # Get total revenue from balance transactions
        # This is a simplified approach - production should use reporting API
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Get charges from this month
        charges = stripe.Charge.list(
            created={"gte": int(month_start.timestamp())},
            limit=100,
        )
        credits_purchased_this_month = 0
        for charge in charges.auto_paging_iter():
            if charge.status == "succeeded":
                total_revenue += charge.amount / 100
                # Check if it's a credit purchase (not subscription)
                if charge.metadata.get("type") == "credit_purchase":
                    credits_purchased_this_month += charge.metadata.get("credits", 0)

        # Get today's credit purchases
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_charges = stripe.Charge.list(
            created={"gte": int(today_start.timestamp())},
            limit=50,
        )
        credits_purchased_today = 0
        for charge in today_charges.auto_paging_iter():
            if charge.status == "succeeded" and charge.metadata.get("type") == "credit_purchase":
                credits_purchased_today += int(charge.metadata.get("credits", 0))

    except stripe.error.StripeError as e:
        logger.error(f"Stripe API error: {e}")
        # Return zeros if Stripe fails
        mrr = 0.0
        total_revenue = 0.0
        subscriber_count = 0
        credits_purchased_today = 0
        credits_purchased_this_month = 0

    # Get recent transactions (payment intents)
    recent_transactions = []
    try:
        payment_intents = stripe.PaymentIntent.list(limit=limit)
        for pi in payment_intents.data:
            # Determine transaction type
            tx_type = PaymentTransactionType.CREDIT_PURCHASE
            if pi.metadata.get("type") == "subscription":
                tx_type = PaymentTransactionType.SUBSCRIPTION

            # Determine status
            status_map = {
                "succeeded": PaymentStatus.SUCCEEDED,
                "processing": PaymentStatus.PENDING,
                "requires_payment_method": PaymentStatus.FAILED,
                "canceled": PaymentStatus.FAILED,
            }
            tx_status = status_map.get(pi.status, PaymentStatus.PENDING)

            # Get customer email if available
            user_email = None
            user_id = pi.metadata.get("user_id")
            if pi.customer:
                try:
                    customer = stripe.Customer.retrieve(pi.customer)
                    user_email = customer.email
                except:
                    pass

            recent_transactions.append(PaymentTransaction(
                id=pi.id,
                user_id=user_id,
                user_email=user_email,
                type=tx_type,
                amount=pi.amount / 100,  # Convert cents to dollars
                status=tx_status,
                created_at=datetime.fromtimestamp(pi.created, tz=timezone.utc),
            ))

    except stripe.error.StripeError as e:
        logger.error(f"Stripe API error getting transactions: {e}")

    stats = PaymentStats(
        mrr=round(mrr, 2),
        total_revenue=round(total_revenue, 2),
        subscriber_count=subscriber_count,
        credits_purchased_today=credits_purchased_today,
        credits_purchased_this_month=credits_purchased_this_month,
    )

    result = PaymentsResponse(
        stats=stats,
        recent_transactions=recent_transactions,
    )

    # Cache the result
    _set_cached(cache_key, result.model_dump())

    return result
