"""Pydantic models for credits and payments."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CreditPackage(BaseModel):
    """Credit package available for purchase."""
    id: str = Field(..., description="Package ID (starter, popular, pro, mega)")
    name: str = Field(..., description="Package name")
    price_cents: int = Field(..., description="Price in USD cents")
    credits: int = Field(..., description="Number of credits")
    stripe_price_id: str = Field(..., description="Stripe Price ID")
    bonus_percent: int = Field(0, description="Bonus percentage over base value")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "popular",
                "name": "Popular",
                "price_cents": 3000,
                "credits": 400,
                "stripe_price_id": "price_popular_credits",
                "bonus_percent": 10
            }
        }


class CheckoutRequest(BaseModel):
    """Request to create a Stripe checkout session."""
    package_id: str = Field(..., description="Package ID to purchase")

    @field_validator("package_id")
    @classmethod
    def validate_package_id(cls, v):
        """Validate package ID is one of the allowed values."""
        allowed = ["starter", "popular", "pro", "mega"]
        if v not in allowed:
            raise ValueError(f"Invalid package_id. Must be one of: {allowed}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "package_id": "popular"
            }
        }


class CheckoutResponse(BaseModel):
    """Response from creating a checkout session."""
    checkout_url: str = Field(..., description="Stripe Checkout URL")
    session_id: str = Field(..., description="Stripe Session ID")

    class Config:
        json_schema_extra = {
            "example": {
                "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
                "session_id": "cs_test_a1b2c3d4e5f6"
            }
        }


class CreditBalance(BaseModel):
    """User's current credit balance."""
    balance: float = Field(..., description="Current credit balance")
    last_updated: Optional[datetime] = Field(None, description="Last time balance was updated")

    class Config:
        json_schema_extra = {
            "example": {
                "balance": 125.5,
                "last_updated": "2025-01-21T10:00:00Z"
            }
        }


class AutoRefillSettings(BaseModel):
    """Auto-refill configuration for a user."""
    enabled: bool = Field(False, description="Whether auto-refill is enabled")
    threshold: int = Field(10, ge=5, le=100, description="Refill when balance drops below this")
    package_id: str = Field("starter", description="Package to purchase for refill")

    @field_validator("package_id")
    @classmethod
    def validate_package_id(cls, v):
        """Validate package ID is one of the allowed values."""
        allowed = ["starter", "popular", "pro", "mega"]
        if v not in allowed:
            raise ValueError(f"Invalid package_id. Must be one of: {allowed}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "enabled": True,
                "threshold": 10,
                "package_id": "starter"
            }
        }


class AutoRefillResponse(BaseModel):
    """Response after updating auto-refill settings."""
    message: str
    settings: AutoRefillSettings


class ReceiptResponse(BaseModel):
    """Receipt details from a completed checkout session."""
    session_id: str = Field(..., description="Stripe Checkout Session ID")
    transaction_id: str = Field(..., description="Stripe Payment Intent ID")
    package_name: str = Field(..., description="Package purchased")
    credits: int = Field(..., description="Credits added")
    amount_cents: int = Field(..., description="Amount paid in cents")
    currency: str = Field("usd", description="Currency code")
    payment_method_last4: Optional[str] = Field(None, description="Last 4 digits of card")
    payment_method_brand: Optional[str] = Field(None, description="Card brand (visa, mastercard, etc)")
    customer_email: str = Field(..., description="Customer email")
    created_at: datetime = Field(..., description="Payment timestamp")
    receipt_url: Optional[str] = Field(None, description="Stripe hosted receipt URL")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "cs_test_a1b2c3d4e5f6",
                "transaction_id": "pi_1234567890",
                "package_name": "Popular Credit Package",
                "credits": 400,
                "amount_cents": 3000,
                "currency": "usd",
                "payment_method_last4": "4242",
                "payment_method_brand": "visa",
                "customer_email": "user@example.com",
                "created_at": "2025-01-21T10:00:00Z",
                "receipt_url": "https://pay.stripe.com/receipts/..."
            }
        }


class PaymentMethodCard(BaseModel):
    """Card details for a payment method."""
    brand: str = Field(..., description="Card brand (visa, mastercard, amex, etc)")
    last4: str = Field(..., description="Last 4 digits")
    exp_month: int = Field(..., description="Expiration month")
    exp_year: int = Field(..., description="Expiration year")

    class Config:
        json_schema_extra = {
            "example": {
                "brand": "visa",
                "last4": "4242",
                "exp_month": 12,
                "exp_year": 2025
            }
        }


class PaymentMethod(BaseModel):
    """A saved payment method."""
    id: str = Field(..., description="Payment method ID")
    type: str = Field(..., description="Payment method type (card, etc)")
    card: Optional[PaymentMethodCard] = Field(None, description="Card details if type is card")
    is_default: bool = Field(False, description="Whether this is the default payment method")
    created_at: datetime = Field(..., description="When the payment method was added")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "pm_1234567890",
                "type": "card",
                "card": {
                    "brand": "visa",
                    "last4": "4242",
                    "exp_month": 12,
                    "exp_year": 2025
                },
                "is_default": True,
                "created_at": "2025-01-21T10:00:00Z"
            }
        }


class PaymentMethodsResponse(BaseModel):
    """List of saved payment methods."""
    payment_methods: list[PaymentMethod] = Field(default_factory=list, description="List of payment methods")
    default_payment_method_id: Optional[str] = Field(None, description="ID of default payment method")

    class Config:
        json_schema_extra = {
            "example": {
                "payment_methods": [
                    {
                        "id": "pm_1234567890",
                        "type": "card",
                        "card": {"brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2025},
                        "is_default": True,
                        "created_at": "2025-01-21T10:00:00Z"
                    }
                ],
                "default_payment_method_id": "pm_1234567890"
            }
        }
