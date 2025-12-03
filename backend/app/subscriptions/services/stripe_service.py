"""Stripe integration service for subscriptions."""
import os
import logging
from typing import Optional
from google.cloud import secretmanager
import stripe

logger = logging.getLogger(__name__)


class StripeService:
    """Service for Stripe API interactions."""

    _key_loaded: bool = False

    @classmethod
    def ensure_api_key(cls) -> None:
        """Ensure Stripe API key is loaded."""
        if cls._key_loaded:
            return

        project_id = os.getenv("GCP_PROJECT_ID", "wanapi-prod")

        # Check if using Secret Manager
        if os.getenv("USE_SECRET_MANAGER", "false").lower() == "true":
            try:
                client = secretmanager.SecretManagerServiceClient()
                name = f"projects/{project_id}/secrets/stripe-secret-key/versions/latest"
                response = client.access_secret_version(request={"name": name})
                key = response.payload.data.decode("UTF-8").strip()
                if key:
                    stripe.api_key = key
                    cls._key_loaded = True
                    return
            except Exception as e:
                logger.warning(f"Failed to get Stripe key from Secret Manager: {e}")

        # Fallback to environment variable (local dev)
        key = os.getenv("STRIPE_SECRET_KEY")
        if key:
            stripe.api_key = key
            cls._key_loaded = True

    @classmethod
    def get_or_create_customer(
        cls,
        stripe_customer_id: Optional[str],
        email: Optional[str],
        user_id: str,
    ) -> str:
        """
        Get existing or create new Stripe customer.

        Args:
            stripe_customer_id: Existing customer ID if any
            email: User's email for new customer creation
            user_id: Firebase user ID for metadata

        Returns:
            Stripe customer ID

        Raises:
            stripe.error.StripeError: If customer creation fails
        """
        cls.ensure_api_key()

        if stripe_customer_id:
            return stripe_customer_id

        customer = stripe.Customer.create(
            email=email,
            metadata={"user_id": user_id},
        )
        return customer.id

    @classmethod
    def create_checkout_session(
        cls,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        metadata: dict,
        subscription_metadata: dict,
        coupon_id: Optional[str] = None,
    ) -> stripe.checkout.Session:
        """
        Create a Stripe checkout session for subscription.

        Args:
            customer_id: Stripe customer ID
            price_id: Stripe price ID for the subscription
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            metadata: Checkout session metadata
            subscription_metadata: Metadata for the subscription
            coupon_id: Optional coupon to apply

        Returns:
            Stripe Checkout Session
        """
        cls.ensure_api_key()

        session_params = {
            "customer": customer_id,
            "mode": "subscription",
            "payment_method_types": ["card"],
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": metadata,
            "subscription_data": {"metadata": subscription_metadata},
        }

        if coupon_id:
            session_params["discounts"] = [{"coupon": coupon_id}]

        return stripe.checkout.Session.create(**session_params)

    @classmethod
    def get_subscription(cls, subscription_id: str) -> stripe.Subscription:
        """Retrieve a Stripe subscription."""
        cls.ensure_api_key()
        return stripe.Subscription.retrieve(subscription_id)

    @classmethod
    def modify_subscription(
        cls,
        subscription_id: str,
        **kwargs,
    ) -> stripe.Subscription:
        """Modify a Stripe subscription."""
        cls.ensure_api_key()
        return stripe.Subscription.modify(subscription_id, **kwargs)

    @classmethod
    def list_active_subscriptions(
        cls,
        customer_id: str,
        limit: int = 1,
    ) -> list:
        """List active subscriptions for a customer."""
        cls.ensure_api_key()
        subscriptions = stripe.Subscription.list(
            customer=customer_id,
            status="active",
            limit=limit,
        )
        return subscriptions.data

    @classmethod
    def create_customer_portal_session(
        cls,
        customer_id: str,
        return_url: str,
    ) -> stripe.billing_portal.Session:
        """Create a Stripe Customer Portal session."""
        cls.ensure_api_key()
        return stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )

    @classmethod
    def ensure_coupon_exists(cls, coupon_id: str, percent_off: int, name: str) -> None:
        """Ensure a coupon exists, creating it if necessary."""
        cls.ensure_api_key()
        try:
            stripe.Coupon.retrieve(coupon_id)
        except stripe.error.InvalidRequestError:
            stripe.Coupon.create(
                id=coupon_id,
                percent_off=percent_off,
                duration="forever",
                name=name,
                metadata={"type": "founding_member"},
            )
            logger.info(f"Created coupon: {coupon_id}")
