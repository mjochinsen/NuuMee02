"""Pydantic models for subscription management."""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SubscriptionTier(str, Enum):
    """Available subscription tiers."""
    CREATOR = "creator"
    STUDIO = "studio"


class SubscriptionStatus(str, Enum):
    """Subscription status values."""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"


# Subscription tier configuration
SUBSCRIPTION_TIERS = {
    SubscriptionTier.CREATOR: {
        "name": "Creator",
        "price_cents": 2900,  # $29/month
        "monthly_credits": 400,
        "stripe_price_id": "price_creator_monthly",  # Updated after Stripe product creation
        "credits_rollover_cap": 800,  # 2x monthly credits
    },
    SubscriptionTier.STUDIO: {
        "name": "Studio",
        "price_cents": 9900,  # $99/month
        "monthly_credits": 1600,
        "stripe_price_id": "price_studio_monthly",  # Updated after Stripe product creation
        "credits_rollover_cap": 3200,  # 2x monthly credits
    },
}


class SubscriptionTierInfo(BaseModel):
    """Information about a subscription tier."""
    tier: SubscriptionTier = Field(..., description="Tier ID")
    name: str = Field(..., description="Display name")
    price_cents: int = Field(..., description="Monthly price in USD cents")
    monthly_credits: int = Field(..., description="Credits granted each month")
    credits_rollover_cap: int = Field(..., description="Maximum credits that can roll over")

    class Config:
        json_schema_extra = {
            "example": {
                "tier": "creator",
                "name": "Creator",
                "price_cents": 2900,
                "monthly_credits": 400,
                "credits_rollover_cap": 800
            }
        }


class CreateSubscriptionRequest(BaseModel):
    """Request to create a subscription checkout session."""
    tier: SubscriptionTier = Field(..., description="Subscription tier to subscribe to")

    class Config:
        json_schema_extra = {
            "example": {
                "tier": "creator"
            }
        }


class CreateSubscriptionResponse(BaseModel):
    """Response from creating a subscription checkout session."""
    checkout_url: str = Field(..., description="Stripe Checkout URL")
    session_id: str = Field(..., description="Stripe Session ID")

    class Config:
        json_schema_extra = {
            "example": {
                "checkout_url": "https://checkout.stripe.com/pay/cs_test_...",
                "session_id": "cs_test_a1b2c3d4e5f6"
            }
        }


class SubscriptionResponse(BaseModel):
    """Current subscription details."""
    subscription_id: str = Field(..., description="Internal subscription ID")
    user_id: str = Field(..., description="User ID")
    tier: SubscriptionTier = Field(..., description="Subscription tier")
    status: SubscriptionStatus = Field(..., description="Subscription status")
    stripe_subscription_id: str = Field(..., description="Stripe subscription ID")
    monthly_credits: int = Field(..., description="Credits granted each month")
    current_period_start: datetime = Field(..., description="Current billing period start")
    current_period_end: datetime = Field(..., description="Current billing period end")
    cancel_at_period_end: bool = Field(False, description="Whether subscription cancels at period end")
    created_at: datetime = Field(..., description="Subscription creation time")

    class Config:
        json_schema_extra = {
            "example": {
                "subscription_id": "sub_abc123",
                "user_id": "user123",
                "tier": "creator",
                "status": "active",
                "stripe_subscription_id": "sub_1234567890",
                "monthly_credits": 400,
                "current_period_start": "2025-01-01T00:00:00Z",
                "current_period_end": "2025-02-01T00:00:00Z",
                "cancel_at_period_end": False,
                "created_at": "2025-01-01T00:00:00Z"
            }
        }


class CancelSubscriptionResponse(BaseModel):
    """Response from canceling a subscription."""
    subscription_id: str = Field(..., description="Internal subscription ID")
    status: SubscriptionStatus = Field(..., description="New subscription status")
    cancel_at_period_end: bool = Field(..., description="Subscription will cancel at period end")
    current_period_end: datetime = Field(..., description="When subscription access ends")
    message: str = Field(..., description="Cancellation message")

    class Config:
        json_schema_extra = {
            "example": {
                "subscription_id": "sub_abc123",
                "status": "active",
                "cancel_at_period_end": True,
                "current_period_end": "2025-02-01T00:00:00Z",
                "message": "Subscription will be canceled at the end of the billing period"
            }
        }
