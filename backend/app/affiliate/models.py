"""Pydantic models for affiliate program."""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class PlatformType(str, Enum):
    """Platform types for affiliates."""
    YOUTUBE = "youtube"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    BLOG = "blog"
    TWITTER = "twitter"
    OTHER = "other"


class AffiliateStatus(str, Enum):
    """Affiliate status values."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class PayoutStatus(str, Enum):
    """Payout status values."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AffiliateApplyRequest(BaseModel):
    """Request to apply for affiliate program."""
    name: str = Field(..., description="Full name", min_length=2, max_length=100)
    email: EmailStr = Field(..., description="Email address")
    platform_url: str = Field(..., description="URL to social platform/website", max_length=500)
    platform_type: PlatformType = Field(..., description="Type of platform")
    promotion_plan: str = Field(..., description="How you plan to promote NuuMee", min_length=20, max_length=1000)
    paypal_email: EmailStr = Field(..., description="PayPal email for payouts")
    audience_size: int = Field(..., description="Approximate audience size", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "platform_url": "https://youtube.com/@johndoe",
                "platform_type": "youtube",
                "promotion_plan": "I will create tutorial videos showcasing NuuMee's AI video generation capabilities to my 50k subscribers interested in content creation tools.",
                "paypal_email": "john@example.com",
                "audience_size": 50000
            }
        }


class AffiliateApplyResponse(BaseModel):
    """Response from affiliate application."""
    affiliate_id: str = Field(..., description="Unique affiliate ID")
    status: AffiliateStatus = Field(..., description="Application status")
    message: str = Field(..., description="Response message")

    class Config:
        json_schema_extra = {
            "example": {
                "affiliate_id": "aff_abc123def456",
                "status": "pending",
                "message": "Your affiliate application has been submitted successfully. We will review it within 2-3 business days."
            }
        }


class AffiliateStats(BaseModel):
    """Statistics for an affiliate."""
    total_clicks: int = Field(0, description="Total clicks on affiliate link")
    total_signups: int = Field(0, description="Total signups using affiliate code")
    total_conversions: int = Field(0, description="Total paid conversions")
    commission_earned: float = Field(0.0, description="Total commission earned (USD)")
    commission_pending: float = Field(0.0, description="Commission available for payout (USD)")
    commission_paid: float = Field(0.0, description="Total commission paid out (USD)")

    class Config:
        json_schema_extra = {
            "example": {
                "total_clicks": 250,
                "total_signups": 45,
                "total_conversions": 12,
                "commission_earned": 360.00,
                "commission_pending": 180.00,
                "commission_paid": 180.00
            }
        }


class AffiliateResponse(BaseModel):
    """Full affiliate details and stats."""
    affiliate_id: str = Field(..., description="Unique affiliate ID")
    user_id: str = Field(..., description="Associated user ID")
    status: AffiliateStatus = Field(..., description="Affiliate status")
    affiliate_code: Optional[str] = Field(None, description="Unique affiliate code (AFF-XXXXX)")
    stats: AffiliateStats = Field(..., description="Affiliate statistics")
    applied_at: datetime = Field(..., description="Application submission time")
    approved_at: Optional[datetime] = Field(None, description="Approval time")

    class Config:
        json_schema_extra = {
            "example": {
                "affiliate_id": "aff_abc123def456",
                "user_id": "user123",
                "status": "approved",
                "affiliate_code": "AFF-JD5K2",
                "stats": {
                    "total_clicks": 250,
                    "total_signups": 45,
                    "total_conversions": 12,
                    "commission_earned": 360.00,
                    "commission_pending": 180.00,
                    "commission_paid": 180.00
                },
                "applied_at": "2025-01-01T00:00:00Z",
                "approved_at": "2025-01-02T00:00:00Z"
            }
        }


class PayoutRequest(BaseModel):
    """Request to withdraw earned commissions."""
    amount: float = Field(..., description="Amount to withdraw (USD)", gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 100.00
            }
        }


class PayoutResponse(BaseModel):
    """Response from payout request."""
    payout_id: str = Field(..., description="Unique payout ID")
    amount: float = Field(..., description="Payout amount (USD)")
    status: PayoutStatus = Field(..., description="Payout status")
    message: str = Field(..., description="Response message")

    class Config:
        json_schema_extra = {
            "example": {
                "payout_id": "payout_xyz789",
                "amount": 100.00,
                "status": "pending",
                "message": "Payout request submitted successfully. Funds will be sent to your PayPal within 5-7 business days."
            }
        }
