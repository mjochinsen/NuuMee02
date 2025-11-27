"""Auth models and Pydantic schemas."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class TokenRequest(BaseModel):
    """Request body containing Firebase ID token."""
    id_token: str


class NotificationPreferences(BaseModel):
    """User notification preferences."""
    email_on_completion: bool = True
    email_on_failure: bool = True
    email_on_low_credits: bool = True
    email_on_billing: bool = True
    email_product_updates: bool = True
    email_marketing: bool = False
    browser_notifications: bool = True


class UserProfile(BaseModel):
    """User profile response."""
    user_id: str
    email: str
    email_verified: bool = False
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    credits_balance: int = 25
    subscription_tier: str = "free"
    referral_code: str
    referred_by: Optional[str] = None
    is_affiliate: bool = False
    affiliate_status: str = "none"
    created_at: datetime
    updated_at: datetime


class RegisterResponse(BaseModel):
    """Response after successful registration."""
    message: str
    user: UserProfile


class LoginResponse(BaseModel):
    """Response after successful login."""
    message: str
    user: UserProfile
