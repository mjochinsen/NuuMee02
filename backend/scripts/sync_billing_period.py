#!/usr/bin/env python3
"""
Sync billing_period from Stripe for existing users.

This script queries all users with active subscriptions (subscription_tier != "free")
and syncs their billing_period field from Stripe.

Usage:
    python sync_billing_period.py                    # Dry run (no changes)
    python sync_billing_period.py --apply           # Apply changes
    python sync_billing_period.py --user USER_ID    # Single user
"""

import os
import sys
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import stripe
from google.cloud import firestore

# Initialize Stripe
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe.api_key:
    print("ERROR: STRIPE_SECRET_KEY environment variable not set")
    sys.exit(1)

# Initialize Firestore
db = firestore.Client()


def get_billing_period_from_stripe(stripe_subscription_id: str) -> str | None:
    """Get billing period from Stripe subscription."""
    try:
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)
        if subscription.status != "active":
            return None

        # Get the price interval
        if subscription.items and subscription.items.data:
            item = subscription.items.data[0]
            if item.price and item.price.recurring:
                interval = item.price.recurring.interval
                if interval == "month":
                    return "month"
                elif interval == "year":
                    return "year"
        return None
    except stripe.error.StripeError as e:
        print(f"  Stripe error: {e}")
        return None


def get_billing_period_from_customer(stripe_customer_id: str) -> tuple[str | None, str | None]:
    """Get billing period from Stripe customer's active subscription."""
    try:
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=1
        )

        if not subscriptions.data:
            return None, None

        subscription = subscriptions.data[0]
        subscription_id = subscription.id

        # Get the price interval
        if subscription.items and subscription.items.data:
            item = subscription.items.data[0]
            if item.price and item.price.recurring:
                interval = item.price.recurring.interval
                if interval == "month":
                    return "month", subscription_id
                elif interval == "year":
                    return "year", subscription_id

        return None, subscription_id
    except stripe.error.StripeError as e:
        print(f"  Stripe error: {e}")
        return None, None


def sync_user(user_id: str, apply: bool = False) -> dict:
    """Sync billing_period for a single user."""
    result = {
        "user_id": user_id,
        "status": "skipped",
        "old_billing_period": None,
        "new_billing_period": None,
        "message": ""
    }

    # Get user document
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        result["status"] = "error"
        result["message"] = "User document not found"
        return result

    user_data = user_doc.to_dict()
    subscription_tier = user_data.get("subscription_tier", "free")
    current_billing_period = user_data.get("billing_period")
    stripe_customer_id = user_data.get("stripe_customer_id")
    stripe_subscription_id = user_data.get("stripe_subscription_id")

    result["old_billing_period"] = current_billing_period

    # Skip free tier users
    if subscription_tier == "free":
        result["status"] = "skipped"
        result["message"] = "Free tier user"
        return result

    # Try to get billing period from Stripe
    new_billing_period = None
    new_subscription_id = stripe_subscription_id

    # First try using subscription ID if we have it
    if stripe_subscription_id:
        new_billing_period = get_billing_period_from_stripe(stripe_subscription_id)

    # If that didn't work, try using customer ID
    if not new_billing_period and stripe_customer_id:
        new_billing_period, found_subscription_id = get_billing_period_from_customer(stripe_customer_id)
        if found_subscription_id:
            new_subscription_id = found_subscription_id

    if not new_billing_period:
        result["status"] = "error"
        result["message"] = "Could not determine billing period from Stripe"
        return result

    result["new_billing_period"] = new_billing_period

    # Check if update is needed
    if current_billing_period == new_billing_period:
        result["status"] = "unchanged"
        result["message"] = f"Already set to '{new_billing_period}'"
        return result

    # Apply update if requested
    if apply:
        update_data = {
            "billing_period": new_billing_period,
            "updated_at": datetime.utcnow()
        }

        # Also update subscription ID if we found it
        if new_subscription_id and new_subscription_id != stripe_subscription_id:
            update_data["stripe_subscription_id"] = new_subscription_id

        user_ref.update(update_data)
        result["status"] = "updated"
        result["message"] = f"Updated from '{current_billing_period}' to '{new_billing_period}'"
    else:
        result["status"] = "would_update"
        result["message"] = f"Would update from '{current_billing_period}' to '{new_billing_period}'"

    return result


def sync_all_users(apply: bool = False) -> list[dict]:
    """Sync billing_period for all users with active subscriptions."""
    results = []

    # Query users with active subscriptions
    users_ref = db.collection("users")

    # Get creator tier users
    creator_query = users_ref.where("subscription_tier", "==", "creator")
    for doc in creator_query.stream():
        result = sync_user(doc.id, apply)
        results.append(result)
        print_result(result)

    # Get studio tier users
    studio_query = users_ref.where("subscription_tier", "==", "studio")
    for doc in studio_query.stream():
        result = sync_user(doc.id, apply)
        results.append(result)
        print_result(result)

    return results


def print_result(result: dict):
    """Print a single result."""
    status_emoji = {
        "updated": "[OK]",
        "would_update": "[DRY]",
        "unchanged": "[=]",
        "skipped": "[SKIP]",
        "error": "[ERR]"
    }

    emoji = status_emoji.get(result["status"], "[?]")
    print(f"  {emoji} {result['user_id'][:20]}... : {result['message']}")


def print_summary(results: list[dict]):
    """Print summary of results."""
    counts = {
        "updated": 0,
        "would_update": 0,
        "unchanged": 0,
        "skipped": 0,
        "error": 0
    }

    for result in results:
        counts[result["status"]] = counts.get(result["status"], 0) + 1

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"  Total users processed: {len(results)}")
    print(f"  Updated:               {counts['updated']}")
    print(f"  Would update:          {counts['would_update']}")
    print(f"  Unchanged:             {counts['unchanged']}")
    print(f"  Skipped:               {counts['skipped']}")
    print(f"  Errors:                {counts['error']}")


def main():
    parser = argparse.ArgumentParser(
        description="Sync billing_period from Stripe for existing users."
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes (default is dry run)"
    )
    parser.add_argument(
        "--user",
        type=str,
        help="Sync a single user by ID"
    )

    args = parser.parse_args()

    print("=" * 50)
    print("BILLING PERIOD SYNC SCRIPT")
    print("=" * 50)
    print(f"  Mode: {'APPLY' if args.apply else 'DRY RUN'}")
    print(f"  Target: {args.user or 'All users with active subscriptions'}")
    print("=" * 50)
    print()

    if args.user:
        result = sync_user(args.user, args.apply)
        print_result(result)
        print_summary([result])
    else:
        results = sync_all_users(args.apply)
        print_summary(results)

    if not args.apply:
        print("\nThis was a DRY RUN. Use --apply to make changes.")


if __name__ == "__main__":
    main()
