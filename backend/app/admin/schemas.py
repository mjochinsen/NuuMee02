"""Pydantic schemas for Admin API."""
from datetime import datetime
from typing import Optional, List, Any, Dict
from enum import Enum
from pydantic import BaseModel, Field


# ==================== Enums ====================

class UserTier(str, Enum):
    FREE = "free"
    STARTER = "starter"
    CREATOR = "creator"
    PRO = "pro"
    BUSINESS = "business"


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JobType(str, Enum):
    VIDEO_GENERATION = "video_generation"
    SUBTITLES = "subtitles"
    WATERMARK = "watermark"


class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"


class CreditTransactionType(str, Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    ADMIN_ADJUSTMENT = "admin_adjustment"
    PROMO = "promo"
    REFERRAL = "referral"
    SUBSCRIPTION = "subscription"


class PaymentTransactionType(str, Enum):
    SUBSCRIPTION = "subscription"
    CREDIT_PURCHASE = "credit_purchase"
    REFUND = "refund"


class PaymentStatus(str, Enum):
    SUCCEEDED = "succeeded"
    PENDING = "pending"
    FAILED = "failed"
    REFUNDED = "refunded"


# ==================== Common ====================

class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List[Any]
    total: int
    page: int
    pages: int
    per_page: int


# ==================== Health ====================

class HealthResponse(BaseModel):
    """Admin health check response."""
    status: str = "healthy"
    admin: bool = True
    timestamp: datetime


# ==================== User ====================

class SubscriptionInfo(BaseModel):
    """User subscription information."""
    id: str
    status: SubscriptionStatus
    plan: str
    current_period_end: datetime


class CreditTransaction(BaseModel):
    """Credit transaction record."""
    id: str
    type: CreditTransactionType
    amount: int
    balance_after: int
    description: Optional[str] = None
    created_at: datetime


class AdminUserSummary(BaseModel):
    """User summary for list view."""
    uid: str
    email: str
    display_name: Optional[str] = None
    tier: UserTier = UserTier.FREE
    credits: int = 0
    created_at: datetime
    last_active: Optional[datetime] = None
    jobs_count: int = 0


class AdminJobSummary(BaseModel):
    """Job summary for list/detail views."""
    id: str
    user_id: str
    user_email: Optional[str] = None
    type: Optional[JobType] = None
    status: JobStatus
    credits_used: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class AdminUserDetail(AdminUserSummary):
    """Full user detail with recent activity."""
    subscription: Optional[SubscriptionInfo] = None
    recent_jobs: List[AdminJobSummary] = []
    recent_transactions: List[CreditTransaction] = []
    photo_url: Optional[str] = None


class CreditAdjustmentRequest(BaseModel):
    """Request to adjust user credits."""
    amount: int = Field(..., ge=-2000, le=2000, description="Amount to add/deduct (-2000 to 2000)")
    reason: Optional[str] = Field(None, max_length=500)


class CreditAdjustmentResponse(BaseModel):
    """Response after credit adjustment."""
    success: bool
    new_balance: int
    transaction_id: str


# ==================== Job ====================

class AdminJobDetail(AdminJobSummary):
    """Full job detail with error info."""
    input_path: Optional[str] = None
    output_path: Optional[str] = None
    error_details: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class JobRetryRequest(BaseModel):
    """Request to retry a failed job."""
    note: Optional[str] = Field(None, max_length=500)


class JobRetryResponse(BaseModel):
    """Response after job retry."""
    success: bool
    job_id: str
    new_status: str


# ==================== Payments ====================

class PaymentStats(BaseModel):
    """Payment statistics."""
    mrr: float
    total_revenue: float
    subscriber_count: int
    credits_purchased_today: int = 0
    credits_purchased_this_month: int = 0


class PaymentTransaction(BaseModel):
    """Payment transaction record."""
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    type: PaymentTransactionType
    amount: float
    status: PaymentStatus
    created_at: datetime


class PaymentsResponse(BaseModel):
    """Payments analytics response."""
    stats: PaymentStats
    recent_transactions: List[PaymentTransaction]


# ==================== Promo Codes ====================

class PromoCode(BaseModel):
    """Promo code record."""
    id: str
    code: str
    credits: int
    max_uses: Optional[int] = None
    current_uses: int = 0
    expires_at: Optional[datetime] = None
    active: bool = True
    created_at: datetime


class CreatePromoRequest(BaseModel):
    """Request to create a promo code."""
    code: str = Field(..., min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_-]+$")
    credits: int = Field(..., ge=1, le=10000)
    max_uses: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None


class DeletePromoResponse(BaseModel):
    """Response after deleting promo code."""
    success: bool
    message: str


# ==================== Dashboard Stats ====================

class UserStats(BaseModel):
    """User statistics."""
    total: int
    new_today: int
    new_this_week: int = 0


class JobStats(BaseModel):
    """Job statistics."""
    total: int
    today: int
    failed: int
    processing: int


class RevenueStats(BaseModel):
    """Revenue statistics."""
    this_month: float
    mrr: float


class PromoStats(BaseModel):
    """Promo code statistics."""
    active: int
    total_redemptions: int


class DashboardStats(BaseModel):
    """Dashboard aggregate statistics."""
    users: UserStats
    jobs: JobStats
    revenue: RevenueStats
    promos: PromoStats
