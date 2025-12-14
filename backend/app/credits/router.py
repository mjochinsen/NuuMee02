"""Credit and payment routes."""
import os
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import secretmanager, firestore
import stripe

from .models import CreditPackage, CheckoutRequest, CheckoutResponse, CreditBalance, AutoRefillSettings, AutoRefillResponse, ReceiptResponse, PaymentMethodsResponse, PaymentMethod, PaymentMethodCard
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id


router = APIRouter(prefix="/credits", tags=["Credits"])


# Stripe key initialization (lazy loaded)
_stripe_key_loaded = False


def _ensure_stripe_key():
    """Ensure Stripe API key is set."""
    global _stripe_key_loaded
    if _stripe_key_loaded:
        return

    project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

    # Check if using Secret Manager
    if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/stripe-secret-key/versions/latest"
            response = client.access_secret_version(request={"name": name})
            stripe.api_key = response.payload.data.decode("UTF-8")
            _stripe_key_loaded = True
            return
        except Exception as e:
            print(f"Failed to get Stripe key from Secret Manager: {e}")

    # Fallback to environment variable (local dev)
    key = os.getenv("STRIPE_SECRET_KEY")
    if key:
        stripe.api_key = key
        _stripe_key_loaded = True
    else:
        raise ValueError("STRIPE_SECRET_KEY not configured")


# Credit package configuration (matches PRICING_STRATEGY.md)
CREDIT_PACKAGES = {
    "starter": CreditPackage(
        id="starter",
        name="Starter",
        price_cents=1000,
        credits=120,
        stripe_price_id=os.getenv("STRIPE_PRICE_STARTER", "price_starter_credits"),
        bonus_percent=0
    ),
    "popular": CreditPackage(
        id="popular",
        name="Popular",
        price_cents=3000,
        credits=400,
        stripe_price_id=os.getenv("STRIPE_PRICE_POPULAR", "price_popular_credits"),
        bonus_percent=10
    ),
    "pro": CreditPackage(
        id="pro",
        name="Pro",
        price_cents=7500,
        credits=1100,
        stripe_price_id=os.getenv("STRIPE_PRICE_PRO", "price_pro_credits"),
        bonus_percent=20
    ),
    "mega": CreditPackage(
        id="mega",
        name="Mega",
        price_cents=15000,
        credits=2500,
        stripe_price_id=os.getenv("STRIPE_PRICE_MEGA", "price_mega_credits"),
        bonus_percent=28
    ),
}


@router.get("/packages", response_model=List[CreditPackage])
async def list_credit_packages():
    """
    List all available credit packages.

    Returns available credit packages with pricing and Stripe Price IDs.
    This endpoint does not require authentication.
    """
    return list(CREDIT_PACKAGES.values())


@router.get("/balance", response_model=CreditBalance)
async def get_credit_balance(user_id: str = Depends(get_current_user_id)):
    """
    Get the current user's credit balance.

    Requires authentication via Firebase ID token.
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    updated_at = user_data.get("updated_at")

    # Handle Firestore timestamps
    if hasattr(updated_at, 'timestamp'):
        updated_at = datetime.fromtimestamp(updated_at.timestamp(), tz=timezone.utc)

    return CreditBalance(
        balance=user_data.get("credits_balance", 0),
        last_updated=updated_at
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    checkout_req: CheckoutRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a Stripe Checkout session for purchasing credits.

    This endpoint:
    1. Creates a Stripe Customer if user doesn't have one
    2. Creates a Stripe Checkout Session for one-time payment
    3. Stores the Stripe Customer ID in the user's Firestore document

    Request body: {"package_id": "starter"|"popular"|"pro"|"mega"}
    """
    # Debug logging
    print(f"[CHECKOUT] Received request for user {user_id}")
    print(f"[CHECKOUT] Request body: package_id={checkout_req.package_id}")

    _ensure_stripe_key()

    # Validate package exists
    package = CREDIT_PACKAGES.get(checkout_req.package_id)
    if not package:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid package_id: {checkout_req.package_id}"
        )

    # Get user from Firestore
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    email = user_data.get("email")
    stripe_customer_id = user_data.get("stripe_customer_id")

    # Create Stripe Customer if doesn't exist
    if not stripe_customer_id:
        try:
            customer = stripe.Customer.create(
                email=email,
                metadata={
                    "firebase_uid": user_id,
                    "nuumee_user_id": user_id
                }
            )
            stripe_customer_id = customer.id

            # Save to Firestore
            user_ref.update({
                "stripe_customer_id": stripe_customer_id,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Stripe customer: {str(e)}"
            )

    # Get frontend URL for redirect
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")

    # Create Checkout Session
    try:
        session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"{package.name} Credit Package",
                            "description": f"{package.credits} credits for NuuMee AI video generation",
                        },
                        "unit_amount": package.price_cents,
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&credits={package.credits}",
            cancel_url=f"{frontend_url}/payment/cancelled",
            metadata={
                "user_id": user_id,
                "package_id": package.id,
                "credits": str(package.credits),
            }
        )

        return CheckoutResponse(
            checkout_url=session.url,
            session_id=session.id
        )

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.get("/auto-refill", response_model=AutoRefillSettings)
async def get_auto_refill_settings(user_id: str = Depends(get_current_user_id)):
    """
    Get the user's auto-refill settings.

    Returns current auto-refill configuration.
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    auto_refill = user_data.get("auto_refill", {})

    return AutoRefillSettings(
        enabled=auto_refill.get("enabled", False),
        threshold=auto_refill.get("threshold", 10),
        package_id=auto_refill.get("package_id", "starter")
    )


@router.put("/auto-refill", response_model=AutoRefillResponse)
async def update_auto_refill_settings(
    settings: AutoRefillSettings,
    user_id: str = Depends(get_current_user_id)
):
    print(f"[AUTO-REFILL] Received settings: enabled={settings.enabled}, threshold={settings.threshold}, package_id={settings.package_id}")
    """
    Update the user's auto-refill settings.

    When enabled, credits will be automatically purchased when balance
    drops below the threshold after a job completes.

    **Requirements for auto-refill:**
    - User must have a saved payment method (Stripe Customer with default payment)
    - Package must be valid (starter, popular, pro, mega)
    - Threshold must be between 5 and 100 credits
    """
    db = get_firestore_client()
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()

    # If enabling auto-refill, verify user has a Stripe customer ID
    if settings.enabled:
        stripe_customer_id = user_data.get("stripe_customer_id")
        if not stripe_customer_id:
            raise HTTPException(
                status_code=400,
                detail="Please make a purchase first to set up auto-refill. A payment method is required."
            )

    # Validate package exists
    if settings.package_id not in CREDIT_PACKAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid package_id: {settings.package_id}"
        )

    # Update settings in Firestore
    user_ref.update({
        "auto_refill": {
            "enabled": settings.enabled,
            "threshold": settings.threshold,
            "package_id": settings.package_id,
        },
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    return AutoRefillResponse(
        message="Auto-refill settings updated successfully",
        settings=settings
    )


@router.get("/receipt/{session_id}", response_model=ReceiptResponse)
async def get_receipt(
    session_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get receipt details for a completed checkout session.

    Returns payment details including transaction ID, amount, and payment method.
    Only the user who made the purchase can retrieve their receipt.
    """
    _ensure_stripe_key()

    try:
        # Retrieve the checkout session from Stripe
        session = stripe.checkout.Session.retrieve(
            session_id,
            expand=["payment_intent.payment_method", "line_items"]
        )

        # Verify this session belongs to the requesting user
        if session.metadata.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this receipt")

        # Check session is completed
        if session.status != "complete":
            raise HTTPException(status_code=400, detail="Payment not completed")

        payment_intent = session.payment_intent
        payment_method = payment_intent.payment_method if payment_intent else None

        # Get card details if available
        last4 = None
        brand = None
        if payment_method and hasattr(payment_method, "card") and payment_method.card:
            last4 = payment_method.card.last4
            brand = payment_method.card.brand

        # Get line item details
        package_name = "Credit Package"
        if session.line_items and session.line_items.data:
            first_item = session.line_items.data[0]
            package_name = first_item.description or package_name

        # Get receipt URL from charge if available
        receipt_url = None
        if payment_intent and payment_intent.latest_charge:
            try:
                charge = stripe.Charge.retrieve(payment_intent.latest_charge)
                receipt_url = charge.receipt_url
            except Exception:
                pass

        return ReceiptResponse(
            session_id=session_id,
            transaction_id=payment_intent.id if payment_intent else session.id,
            package_name=package_name,
            credits=int(session.metadata.get("credits", 0)),
            amount_cents=session.amount_total or 0,
            currency=session.currency or "usd",
            payment_method_last4=last4,
            payment_method_brand=brand,
            customer_email=session.customer_details.email if session.customer_details else "",
            created_at=datetime.fromtimestamp(session.created, tz=timezone.utc),
            receipt_url=receipt_url
        )

    except stripe.error.InvalidRequestError:
        raise HTTPException(status_code=404, detail="Session not found")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve receipt: {str(e)}")


@router.get("/payment-methods", response_model=PaymentMethodsResponse)
async def get_payment_methods(user_id: str = Depends(get_current_user_id)):
    """
    Get the user's saved payment methods from Stripe.

    Returns a list of payment methods attached to the user's Stripe customer.
    """
    _ensure_stripe_key()
    db = get_firestore_client()

    # Get user's Stripe customer ID
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    stripe_customer_id = user_data.get("stripe_customer_id")

    if not stripe_customer_id:
        # No Stripe customer yet, return empty list
        return PaymentMethodsResponse(payment_methods=[], default_payment_method_id=None)

    try:
        # Get customer to find default payment method
        customer = stripe.Customer.retrieve(stripe_customer_id)
        default_pm_id = None
        if customer.invoice_settings and customer.invoice_settings.default_payment_method:
            default_pm_id = customer.invoice_settings.default_payment_method

        # List all payment methods for this customer
        payment_methods_list = stripe.PaymentMethod.list(
            customer=stripe_customer_id,
            type="card",
            limit=10
        )

        methods = []
        for pm in payment_methods_list.data:
            card_details = None
            if pm.card:
                card_details = PaymentMethodCard(
                    brand=pm.card.brand or "unknown",
                    last4=pm.card.last4 or "****",
                    exp_month=pm.card.exp_month or 0,
                    exp_year=pm.card.exp_year or 0
                )

            methods.append(PaymentMethod(
                id=pm.id,
                type=pm.type,
                card=card_details,
                is_default=(pm.id == default_pm_id),
                created_at=datetime.fromtimestamp(pm.created, tz=timezone.utc)
            ))

        return PaymentMethodsResponse(
            payment_methods=methods,
            default_payment_method_id=default_pm_id
        )

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve payment methods: {str(e)}")
