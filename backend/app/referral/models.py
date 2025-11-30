"""Pydantic models for referral system."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReferralStats(BaseModel):
    """Referral statistics for a user."""
    total_referrals: int = Field(0, description="Total number of users who used this code")
    converted_referrals: int = Field(0, description="Number of referrals who completed signup")
    total_credits_earned: int = Field(0, description="Total credits earned from referrals")

    class Config:
        json_schema_extra = {
            "example": {
                "total_referrals": 5,
                "converted_referrals": 3,
                "total_credits_earned": 300
            }
        }


class ReferralCodeResponse(BaseModel):
    """Response containing user's referral code and stats."""
    referral_code: str = Field(..., description="User's unique referral code")
    share_url: str = Field(..., description="Full URL to share with friends")
    stats: ReferralStats = Field(..., description="Referral statistics")

    class Config:
        json_schema_extra = {
            "example": {
                "referral_code": "USER-ABC12",
                "share_url": "https://nuumee.ai/signup?ref=USER-ABC12",
                "stats": {
                    "total_referrals": 5,
                    "converted_referrals": 3,
                    "total_credits_earned": 300
                }
            }
        }


class ReferralApplyRequest(BaseModel):
    """Request to apply a referral code."""
    code: str = Field(..., description="Referral code to apply", min_length=5, max_length=20)

    class Config:
        json_schema_extra = {
            "example": {
                "code": "USER-ABC12"
            }
        }


class ReferralApplyResponse(BaseModel):
    """Response from applying a referral code."""
    credits_granted: int = Field(..., description="Credits granted to new user")
    message: str = Field(..., description="Success message")
    referral_code: str = Field(..., description="The code that was applied")

    class Config:
        json_schema_extra = {
            "example": {
                "credits_granted": 25,
                "message": "Referral code applied successfully! 25 credits added to your account.",
                "referral_code": "USER-ABC12"
            }
        }
