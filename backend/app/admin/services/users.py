"""User management service for admin panel."""
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from google.cloud import firestore

from ..schemas import (
    AdminUserSummary,
    AdminUserDetail,
    AdminJobSummary,
    CreditTransaction,
    CreditAdjustmentResponse,
    SubscriptionInfo,
    DashboardStats,
    UserStats,
    JobStats,
    RevenueStats,
    PromoStats,
    UserTier,
    JobStatus,
    CreditTransactionType,
)

logger = logging.getLogger(__name__)

# Firestore client (lazy initialization)
_db = None


def get_db():
    """Get Firestore client."""
    global _db
    if _db is None:
        _db = firestore.Client()
    return _db


async def get_dashboard_stats() -> DashboardStats:
    """Get aggregate statistics for dashboard."""
    db = get_db()
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)

    # User stats
    users_ref = db.collection("users")
    total_users = len(list(users_ref.stream()))

    new_today_query = users_ref.where("created_at", ">=", today_start)
    new_today = len(list(new_today_query.stream()))

    new_week_query = users_ref.where("created_at", ">=", week_ago)
    new_this_week = len(list(new_week_query.stream()))

    # Job stats
    jobs_ref = db.collection("jobs")
    total_jobs = len(list(jobs_ref.stream()))

    jobs_today_query = jobs_ref.where("created_at", ">=", today_start)
    jobs_today = len(list(jobs_today_query.stream()))

    failed_jobs_query = jobs_ref.where("status", "==", "failed")
    failed_jobs = len(list(failed_jobs_query.stream()))

    processing_jobs_query = jobs_ref.where("status", "==", "processing")
    processing_jobs = len(list(processing_jobs_query.stream()))

    # Promo stats
    promos_ref = db.collection("promo_codes")
    active_promos_query = promos_ref.where("active", "==", True)
    active_promos = len(list(active_promos_query.stream()))

    total_redemptions = 0
    for promo in promos_ref.stream():
        data = promo.to_dict()
        total_redemptions += data.get("current_uses", 0)

    # Revenue (placeholder - will be implemented in payments service)
    revenue_this_month = 0.0
    mrr = 0.0

    return DashboardStats(
        users=UserStats(
            total=total_users,
            new_today=new_today,
            new_this_week=new_this_week,
        ),
        jobs=JobStats(
            total=total_jobs,
            today=jobs_today,
            failed=failed_jobs,
            processing=processing_jobs,
        ),
        revenue=RevenueStats(
            this_month=revenue_this_month,
            mrr=mrr,
        ),
        promos=PromoStats(
            active=active_promos,
            total_redemptions=total_redemptions,
        ),
    )


async def list_users(
    page: int = 1,
    per_page: int = 25,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """List users with pagination and optional search."""
    db = get_db()
    users_ref = db.collection("users")

    # Build query
    query = users_ref.order_by("created_at", direction=firestore.Query.DESCENDING)

    # Search by prefix (email, display_name, or uid)
    if search:
        search_lower = search.lower()
        # Firestore doesn't support OR queries well, so we search by email prefix
        # For a real implementation, consider Algolia or Elasticsearch
        query = users_ref.where("email", ">=", search_lower).where(
            "email", "<=", search_lower + "\uf8ff"
        )

    # Get all matching documents (for pagination calculation)
    all_docs = list(query.stream())
    total = len(all_docs)
    pages = (total + per_page - 1) // per_page

    # Paginate
    start = (page - 1) * per_page
    end = start + per_page
    paginated_docs = all_docs[start:end]

    # Convert to response
    items = []
    for doc in paginated_docs:
        try:
            data = doc.to_dict()
            # Handle tier safely - default to FREE if unknown
            tier_value = data.get("subscription_tier", data.get("tier", "free"))
            try:
                tier = UserTier(tier_value)
            except ValueError:
                tier = UserTier.FREE

            # Handle credits - ensure it's an int
            credits_raw = data.get("credits_balance", 0)
            credits = int(credits_raw) if credits_raw is not None else 0

            # Handle jobs_count - ensure it's an int
            jobs_count_raw = data.get("jobs_count", 0)
            jobs_count = int(jobs_count_raw) if jobs_count_raw is not None else 0

            # Handle created_at - ensure it's a datetime
            created_at = data.get("created_at")
            if created_at is None:
                created_at = datetime.now(timezone.utc)

            items.append(AdminUserSummary(
                uid=doc.id,
                email=data.get("email") or "",
                display_name=data.get("display_name"),
                tier=tier,
                credits=credits,
                created_at=created_at,
                last_active=data.get("last_active"),
                jobs_count=jobs_count,
            ))
        except Exception as e:
            # Log and skip users with invalid data
            logger.warning(f"Skipping user {doc.id} due to validation error: {e}")

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "per_page": per_page,
    }


async def get_user_detail(uid: str) -> Optional[AdminUserDetail]:
    """Get full user details with recent jobs and transactions."""
    db = get_db()

    # Get user document
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        return None

    data = user_doc.to_dict()

    # Get recent jobs (last 10)
    jobs_query = (
        db.collection("jobs")
        .where("user_id", "==", uid)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(10)
    )
    recent_jobs = []
    for job_doc in jobs_query.stream():
        try:
            job_data = job_doc.to_dict()
            # Defensive status handling (may have "queued" or other non-enum values)
            status_raw = job_data.get("status", "pending")
            try:
                status = JobStatus(status_raw)
            except ValueError:
                logger.warning(f"Unknown job status for {job_doc.id}: {status_raw}, defaulting to pending")
                status = JobStatus.PENDING
            # Defensive int conversion
            # Note: jobs store "credits_charged", but admin displays as "credits_used"
            credits_raw = job_data.get("credits_charged", 0)
            credits_used = int(credits_raw) if credits_raw is not None else 0
            recent_jobs.append(AdminJobSummary(
                id=job_doc.id,
                user_id=uid,
                user_email=data.get("email"),
                type=job_data.get("type"),
                status=status,
                credits_used=credits_used,
                created_at=job_data.get("created_at") or datetime.now(timezone.utc),
                completed_at=job_data.get("completed_at"),
                error_message=job_data.get("error_message"),
            ))
        except Exception as e:
            logger.warning(f"Skipping job {job_doc.id} in user detail: {e}")

    # Get recent transactions (last 10)
    transactions_query = (
        db.collection("credit_transactions")
        .where("user_id", "==", uid)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(10)
    )
    recent_transactions = []
    for tx_doc in transactions_query.stream():
        try:
            tx_data = tx_doc.to_dict()
            # Defensive type handling
            type_raw = tx_data.get("type", "usage")
            try:
                tx_type = CreditTransactionType(type_raw)
            except ValueError:
                logger.warning(f"Unknown transaction type for {tx_doc.id}: {type_raw}, defaulting to usage")
                tx_type = CreditTransactionType.USAGE
            # Defensive int conversion
            amount_raw = tx_data.get("amount", 0)
            amount = int(amount_raw) if amount_raw is not None else 0
            balance_raw = tx_data.get("balance_after", 0)
            balance_after = int(balance_raw) if balance_raw is not None else 0
            recent_transactions.append(CreditTransaction(
                id=tx_doc.id,
                type=tx_type,
                amount=amount,
                balance_after=balance_after,
                description=tx_data.get("description"),
                created_at=tx_data.get("created_at") or datetime.now(timezone.utc),
            ))
        except Exception as e:
            logger.warning(f"Skipping transaction {tx_doc.id} in user detail: {e}")

    # Get subscription info if exists
    subscription = None
    sub_data = data.get("subscription")
    if sub_data and sub_data.get("status") in ["active", "trialing", "past_due"]:
        subscription = SubscriptionInfo(
            id=sub_data.get("id", ""),
            status=sub_data.get("status", "active"),
            plan=sub_data.get("plan", ""),
            current_period_end=sub_data.get("current_period_end", datetime.now(timezone.utc)),
        )

    # Handle tier safely - default to FREE if unknown
    tier_value = data.get("subscription_tier", data.get("tier", "free"))
    try:
        tier = UserTier(tier_value)
    except ValueError:
        tier = UserTier.FREE

    # Defensive int conversion (Firestore may store as float)
    credits_raw = data.get("credits_balance", 0)
    credits = int(credits_raw) if credits_raw is not None else 0

    jobs_count_raw = data.get("jobs_count", 0)
    jobs_count = int(jobs_count_raw) if jobs_count_raw is not None else 0

    # Handle created_at - ensure it's a datetime
    created_at = data.get("created_at")
    if created_at is None:
        created_at = datetime.now(timezone.utc)

    return AdminUserDetail(
        uid=uid,
        email=data.get("email") or "",
        display_name=data.get("display_name"),
        tier=tier,
        credits=credits,
        created_at=created_at,
        last_active=data.get("last_active"),
        jobs_count=jobs_count,
        subscription=subscription,
        recent_jobs=recent_jobs,
        recent_transactions=recent_transactions,
        photo_url=data.get("photo_url"),
    )


async def adjust_credits(uid: str, amount: int, reason: Optional[str] = None) -> CreditAdjustmentResponse:
    """Add or deduct credits from a user account."""
    db = get_db()

    # Validate amount
    if abs(amount) > 2000:
        raise ValueError("Credit adjustment cannot exceed 2000")

    # Get user
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise ValueError("User not found")

    user_data = user_doc.to_dict()
    # Defensive: ensure current_balance is int (Firestore may have float)
    current_balance_raw = user_data.get("credits_balance", 0)
    current_balance = int(current_balance_raw) if current_balance_raw is not None else 0
    new_balance = current_balance + amount

    if new_balance < 0:
        raise ValueError("Cannot deduct more credits than user has")

    # Update user credits_balance (consistent with rest of codebase)
    user_ref.update({"credits_balance": new_balance})

    # Create transaction record
    transaction_data = {
        "user_id": uid,
        "type": "admin_adjustment",
        "amount": amount,
        "balance_after": new_balance,
        "description": reason or f"Admin adjustment: {'+' if amount > 0 else ''}{amount} credits",
        "created_at": datetime.now(timezone.utc),
    }
    tx_ref = db.collection("credit_transactions").add(transaction_data)

    logger.info(f"Admin adjusted {amount} credits for user {uid}. New balance: {new_balance}")

    return CreditAdjustmentResponse(
        success=True,
        new_balance=new_balance,
        transaction_id=tx_ref[1].id,
    )
