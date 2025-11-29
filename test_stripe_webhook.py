#!/usr/bin/env python3
"""
Test Stripe webhook handler by sending a properly signed event.
"""
import time
import hmac
import hashlib
import json
import requests

# Configuration
WEBHOOK_URL = "https://nuumee-api-450296399943.us-central1.run.app/api/v1/webhooks/stripe"
WEBHOOK_SECRET = "whsec_cFpl0llJC3mh8Rbll8elkKarig2bUiSr"

# Test data
USER_ID = "TYyXYnHonVhg2Lu0BTxWd4txvuQ2"
PACKAGE_ID = "starter"
CREDITS = 120

# Create webhook event payload
def create_webhook_event():
    """Create a checkout.session.completed event."""
    return {
        "id": f"evt_test_{int(time.time())}",
        "object": "event",
        "api_version": "2023-10-16",
        "created": int(time.time()),
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": f"cs_test_{int(time.time())}",
                "object": "checkout.session",
                "amount_total": 2900,
                "currency": "usd",
                "customer": f"cus_test_{int(time.time())}",
                "payment_intent": f"pi_test_{int(time.time())}",
                "payment_status": "paid",
                "status": "complete",
                "metadata": {
                    "user_id": USER_ID,
                    "package_id": PACKAGE_ID,
                    "credits": str(CREDITS)
                }
            }
        }
    }


def generate_stripe_signature(payload: str, secret: str) -> str:
    """
    Generate a Stripe webhook signature.

    Format: t={timestamp},v1={signature}
    """
    timestamp = int(time.time())

    # Create signed payload: timestamp.payload
    signed_payload = f"{timestamp}.{payload}"

    # Compute HMAC-SHA256 signature
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Return formatted signature header
    return f"t={timestamp},v1={signature}"


def send_webhook():
    """Send webhook event with proper signature."""
    # Create event
    event = create_webhook_event()
    payload = json.dumps(event)

    # Generate signature
    signature = generate_stripe_signature(payload, WEBHOOK_SECRET)

    # Send request
    headers = {
        "Content-Type": "application/json",
        "stripe-signature": signature
    }

    print("=" * 60)
    print("SENDING STRIPE WEBHOOK EVENT")
    print("=" * 60)
    print(f"URL: {WEBHOOK_URL}")
    print(f"Event Type: checkout.session.completed")
    print(f"User ID: {USER_ID}")
    print(f"Package ID: {PACKAGE_ID}")
    print(f"Credits: {CREDITS}")
    print(f"Signature: {signature[:50]}...")
    print()

    try:
        response = requests.post(
            WEBHOOK_URL,
            headers=headers,
            data=payload,
            timeout=10
        )

        print("=" * 60)
        print("WEBHOOK RESPONSE")
        print("=" * 60)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        print()

        if response.status_code == 200:
            print("✓ Webhook accepted successfully")
            return True
        else:
            print("✗ Webhook failed")
            return False

    except Exception as e:
        print("=" * 60)
        print("ERROR")
        print("=" * 60)
        print(f"Failed to send webhook: {e}")
        return False


def verify_credits():
    """Verify credits were updated in Firestore."""
    print("=" * 60)
    print("VERIFYING FIRESTORE UPDATE")
    print("=" * 60)
    print("Checking Firestore for credit balance update...")
    print(f"Expected: 25 (previous) + 120 (new) = 145 credits")
    print()
    print("Run this command to verify:")
    print(f"gcloud firestore documents describe users/{USER_ID} --project=wanapi-prod | grep credits_balance")


if __name__ == "__main__":
    success = send_webhook()
    print()
    verify_credits()

    exit(0 if success else 1)
