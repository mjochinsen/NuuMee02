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
