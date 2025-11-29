#!/usr/bin/env python3
"""
Verify credits were updated in Firestore.
"""
from google.cloud import firestore
import os

# Set project
os.environ["GOOGLE_CLOUD_PROJECT"] = "wanapi-prod"

USER_ID = "TYyXYnHonVhg2Lu0BTxWd4txvuQ2"

def verify_credits():
    """Check user credits in Firestore."""
    db = firestore.Client(project="wanapi-prod")

    print("=" * 60)
    print("FIRESTORE VERIFICATION")
    print("=" * 60)

    # Get user document
    user_ref = db.collection("users").document(USER_ID)
    user_doc = user_ref.get()

    if not user_doc.exists:
        print(f"✗ User {USER_ID} not found")
        return False

    user_data = user_doc.to_dict()
    credits_balance = user_data.get("credits_balance", 0)

    print(f"User ID: {USER_ID}")
    print(f"Credits Balance: {credits_balance}")
    print()

    # Check if it matches expected value
    expected = 145  # 25 (previous) + 120 (from webhook)

    if credits_balance == expected:
        print(f"✓ SUCCESS: Credits updated correctly!")
        print(f"  Expected: {expected}")
        print(f"  Actual: {credits_balance}")
    else:
        print(f"⚠ Credits don't match expected value")
        print(f"  Expected: {expected}")
        print(f"  Actual: {credits_balance}")

    print()

    # Get recent credit transactions
    print("=" * 60)
    print("RECENT CREDIT TRANSACTIONS")
    print("=" * 60)

    txns = db.collection("credit_transactions")\
        .where("user_id", "==", USER_ID)\
        .order_by("created_at", direction=firestore.Query.DESCENDING)\
        .limit(5)\
        .stream()

    for txn in txns:
        txn_data = txn.to_dict()
        print(f"Transaction: {txn.id}")
        print(f"  Type: {txn_data.get('type')}")
        print(f"  Amount: {txn_data.get('amount')}")
        print(f"  Balance Before: {txn_data.get('balance_before')}")
        print(f"  Balance After: {txn_data.get('balance_after')}")
        print(f"  Description: {txn_data.get('description')}")
        print(f"  Stripe Payment: {txn_data.get('related_stripe_payment_id')}")
        print()

    return credits_balance == expected


if __name__ == "__main__":
    success = verify_credits()
    exit(0 if success else 1)
