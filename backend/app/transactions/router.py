"""Transaction history routes."""
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query

from .models import (
    TransactionType,
    TransactionStatus,
    CreditTransaction,
    TransactionListResponse,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    transaction_type: Optional[TransactionType] = Query(
        None, description="Filter by transaction type"
    ),
):
    """
    List credit transactions for the authenticated user.

    Returns a paginated list of credit transactions including:
    - Credit purchases
    - Subscription credits
    - Subscription renewals
    - Referral bonuses
    - Job usage (credit deductions)

    Results are sorted by creation date (newest first).
    """
    db = get_firestore_client()

    # Build query
    query = db.collection("credit_transactions").where("user_id", "==", user_id)

    # Apply type filter if specified
    if transaction_type:
        query = query.where("type", "==", transaction_type.value)

    # Order by creation date (newest first)
    query = query.order_by("created_at", direction="DESCENDING")

    # Get total count (we need to execute a separate query for this)
    # For efficiency, we limit to a reasonable max
    count_query = db.collection("credit_transactions").where("user_id", "==", user_id)
    if transaction_type:
        count_query = count_query.where("type", "==", transaction_type.value)

    # Count documents (Firestore doesn't have a native count, so we stream and count)
    total = 0
    for _ in count_query.stream():
        total += 1
        if total > 1000:  # Cap at 1000 for performance
            break

    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size + 1)  # +1 to check if there's more

    # Execute query
    docs = list(query.stream())

    # Check if there are more results
    has_more = len(docs) > page_size
    if has_more:
        docs = docs[:page_size]

    # Convert to response models
    transactions = []
    for doc in docs:
        data = doc.to_dict()

        # Handle created_at - it might be a Firestore timestamp or datetime
        created_at = data.get("created_at")
        if created_at is None:
            created_at = datetime.now(timezone.utc)
        elif hasattr(created_at, "timestamp"):
            # Firestore timestamp
            created_at = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)

        # Map type to enum (handle legacy types)
        txn_type = data.get("type", "purchase")
        try:
            txn_type_enum = TransactionType(txn_type)
        except ValueError:
            # Handle unknown types
            txn_type_enum = TransactionType.PURCHASE

        # Map status to enum (default to completed for existing transactions)
        txn_status = data.get("status", "completed")
        try:
            txn_status_enum = TransactionStatus(txn_status)
        except ValueError:
            txn_status_enum = TransactionStatus.COMPLETED

        transactions.append(CreditTransaction(
            transaction_id=data.get("transaction_id", doc.id),
            type=txn_type_enum,
            amount=data.get("amount", 0),
            amount_cents=data.get("amount_cents"),
            status=txn_status_enum,
            balance_before=data.get("balance_before"),
            balance_after=data.get("balance_after"),
            description=data.get("description"),
            related_stripe_payment_id=data.get("related_stripe_payment_id"),
            related_referral_code=data.get("related_referral_code"),
            related_job_id=data.get("related_job_id"),
            receipt_url=data.get("receipt_url"),
            created_at=created_at,
        ))

    return TransactionListResponse(
        transactions=transactions,
        total=min(total, 1000),  # Cap at 1000
        page=page,
        page_size=page_size,
        has_more=has_more,
    )
