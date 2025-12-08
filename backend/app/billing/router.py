"""Billing portal routes - Stripe Customer Portal integration."""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import stripe

from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id


router = APIRouter(prefix="/billing", tags=["Billing"])

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Portal return URL
PORTAL_RETURN_URL = os.getenv("PORTAL_RETURN_URL", "https://nuumee.ai/billing")


class PortalSessionResponse(BaseModel):
    """Response with portal session URL."""
    url: str


@router.post("/portal-session", response_model=PortalSessionResponse)
async def create_portal_session(user_id: str = Depends(get_current_user_id)):
    """
    Create a Stripe Customer Portal session.

    Returns a URL that redirects the user to Stripe's hosted billing portal
    where they can manage their subscription, payment methods, and view invoices.
    """
    db = get_firestore_client()

    # Get user's Stripe customer ID
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    stripe_customer_id = user_data.get("stripe_customer_id")

    if not stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No billing account found. Please subscribe to a plan first."
        )

    try:
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=PORTAL_RETURN_URL,
        )

        return PortalSessionResponse(url=session.url)

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")
