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
    REFERRAL = "referral"
    JOB_USAGE = "job_usage"
    REFUND = "refund"
    BONUS = "bonus"


class CreditTransaction(BaseModel):
    """Credit transaction record."""
    transaction_id: str
    type: TransactionType
    amount: int
    balance_before: Optional[int] = None
    balance_after: Optional[int] = None
    description: Optional[str] = None
    related_stripe_payment_id: Optional[str] = None
    related_referral_code: Optional[str] = None
    related_job_id: Optional[str] = None
    created_at: datetime


class TransactionListResponse(BaseModel):
    """Response for listing transactions."""
    transactions: List[CreditTransaction]
    total: int
    page: int
    page_size: int
    has_more: bool
