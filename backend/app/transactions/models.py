"""Transaction models."""
from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel


class TransactionType(str, Enum):
    """Types of credit transactions."""
    PURCHASE = "purchase"
    SUBSCRIPTION = "subscription"
    SUBSCRIPTION_RENEWAL = "subscription_renewal"
    SUBSCRIPTION_UPGRADE = "subscription_upgrade"
    SUBSCRIPTION_DOWNGRADE = "subscription_downgrade"
    SUBSCRIPTION_CANCEL = "subscription_cancel"
    BILLING_SWITCH_ANNUAL = "billing_switch_annual"
    BILLING_SWITCH_MONTHLY = "billing_switch_monthly"
    REFERRAL = "referral"
    JOB_USAGE = "job_usage"
    REFUND = "refund"
    BONUS = "bonus"


class TransactionStatus(str, Enum):
    """Status of a transaction."""
    COMPLETED = "completed"
    PENDING = "pending"
    FAILED = "failed"
    REFUNDED = "refunded"


class CreditTransaction(BaseModel):
    """Credit transaction record."""
    transaction_id: str
    type: TransactionType
    amount: int  # Credits (positive = added, negative = deducted)
    amount_cents: Optional[int] = None  # Dollar amount in cents (for purchases/subscriptions)
    status: TransactionStatus = TransactionStatus.COMPLETED
    balance_before: Optional[int] = None
    balance_after: Optional[int] = None
    description: Optional[str] = None
    related_stripe_payment_id: Optional[str] = None
    related_referral_code: Optional[str] = None
    related_job_id: Optional[str] = None
    receipt_url: Optional[str] = None  # Stripe receipt URL for purchases
    created_at: datetime


class TransactionListResponse(BaseModel):
    """Response for listing transactions."""
    transactions: List[CreditTransaction]
    total: int
    page: int
    page_size: int
    has_more: bool
