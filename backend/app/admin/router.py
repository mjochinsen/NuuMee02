"""Admin API router with all admin endpoints."""
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from .dependencies import verify_admin_password
from .schemas import (
    HealthResponse,
    DashboardStats,
    UserStats,
    JobStats,
    RevenueStats,
    PromoStats,
    AdminUserSummary,
    AdminUserDetail,
    AdminJobSummary,
    AdminJobDetail,
    CreditAdjustmentRequest,
    CreditAdjustmentResponse,
    JobRetryRequest,
    JobRetryResponse,
    PaymentsResponse,
    PaymentStats,
    PaymentTransaction,
    PromoCode,
    CreatePromoRequest,
    DeletePromoResponse,
    PaginatedResponse,
    JobStatus,
)
from .services import users as users_service
from .services import jobs as jobs_service
from .services import payments as payments_service
from .services import promos as promos_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# ==================== Health ====================

@router.get("/health", response_model=HealthResponse)
async def admin_health(_: bool = Depends(verify_admin_password)):
    """
    Admin health check endpoint.
    Verifies admin authentication and API health.
    """
    return HealthResponse(
        status="healthy",
        admin=True,
        timestamp=datetime.now(timezone.utc)
    )


# ==================== Dashboard ====================

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(_: bool = Depends(verify_admin_password)):
    """Get aggregate statistics for admin dashboard."""
    try:
        stats = await users_service.get_dashboard_stats()
        return stats
    except Exception as e:
        logger.error(f"Failed to get dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")


# ==================== Users ====================

@router.get("/users")
async def list_users(
    _: bool = Depends(verify_admin_password),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
):
    """List users with pagination and search."""
    try:
        result = await users_service.list_users(page=page, per_page=per_page, search=search)
        return result
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.get("/users/{uid}", response_model=AdminUserDetail)
async def get_user(
    uid: str,
    _: bool = Depends(verify_admin_password),
):
    """Get full user details including recent jobs and transactions."""
    try:
        user = await users_service.get_user_detail(uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user {uid}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user details")


@router.post("/users/{uid}/credits", response_model=CreditAdjustmentResponse)
async def adjust_user_credits(
    uid: str,
    request: CreditAdjustmentRequest,
    _: bool = Depends(verify_admin_password),
):
    """Add or deduct credits from a user account (max 2000)."""
    try:
        result = await users_service.adjust_credits(uid, request.amount, request.reason)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to adjust credits for {uid}: {e}")
        raise HTTPException(status_code=500, detail="Failed to adjust credits")


# ==================== Jobs ====================

@router.get("/jobs")
async def list_jobs(
    _: bool = Depends(verify_admin_password),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    status: Optional[JobStatus] = Query(None),
    user_id: Optional[str] = Query(None),
):
    """List jobs with pagination and status filter."""
    try:
        result = await jobs_service.list_jobs(
            page=page,
            per_page=per_page,
            status=status.value if status else None,
            user_id=user_id
        )
        return result
    except Exception as e:
        logger.error(f"Failed to list jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")


@router.get("/jobs/{job_id}", response_model=AdminJobDetail)
async def get_job(
    job_id: str,
    _: bool = Depends(verify_admin_password),
):
    """Get full job details including error information."""
    try:
        job = await jobs_service.get_job_detail(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch job details")


@router.post("/jobs/{job_id}/retry", response_model=JobRetryResponse)
async def retry_job(
    job_id: str,
    request: Optional[JobRetryRequest] = None,
    _: bool = Depends(verify_admin_password),
):
    """Retry a failed job (resets to pending, uses already-charged credits)."""
    try:
        result = await jobs_service.retry_job(job_id, request.note if request else None)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to retry job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retry job")


# ==================== Payments ====================

@router.get("/payments", response_model=PaymentsResponse)
async def get_payments(
    _: bool = Depends(verify_admin_password),
    limit: int = Query(50, ge=1, le=100),
):
    """Get payment analytics and recent transactions."""
    try:
        result = await payments_service.get_payments(limit=limit)
        return result
    except Exception as e:
        logger.error(f"Failed to get payments: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payment data")


# ==================== Promo Codes ====================

@router.get("/promos", response_model=list[PromoCode])
async def list_promos(_: bool = Depends(verify_admin_password)):
    """List all promo codes (active and inactive)."""
    try:
        promos = await promos_service.list_promos()
        return promos
    except Exception as e:
        logger.error(f"Failed to list promos: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch promo codes")


@router.post("/promos", response_model=PromoCode, status_code=201)
async def create_promo(
    request: CreatePromoRequest,
    _: bool = Depends(verify_admin_password),
):
    """Create a new promo code."""
    try:
        promo = await promos_service.create_promo(request)
        return promo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create promo: {e}")
        raise HTTPException(status_code=500, detail="Failed to create promo code")


@router.delete("/promos/{promo_id}", response_model=DeletePromoResponse)
async def delete_promo(
    promo_id: str,
    _: bool = Depends(verify_admin_password),
):
    """Deactivate a promo code (soft delete)."""
    try:
        result = await promos_service.delete_promo(promo_id)
        if not result:
            raise HTTPException(status_code=404, detail="Promo code not found")
        return DeletePromoResponse(success=True, message="Promo code deactivated")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete promo {promo_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete promo code")
