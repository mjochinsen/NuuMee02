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
    WebhookReplayResponse,
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


@router.post("/jobs/{job_id}/replay-webhook", response_model=WebhookReplayResponse)
async def replay_webhook(
    job_id: str,
    _: bool = Depends(verify_admin_password),
):
    """Replay webhook processing for a stuck job.

    This checks WaveSpeed API for the actual job status and processes
    the result (download video, apply watermark, update status) if
    the job has completed but the webhook was missed.
    """
    try:
        result = await jobs_service.replay_webhook(job_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to replay webhook for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to replay webhook: {e}")


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


# ==================== System Maintenance ====================

@router.post("/seed-email-templates")
async def seed_email_templates(_: bool = Depends(verify_admin_password)):
    """Seed email templates to Firestore (safe to run multiple times)."""
    from google.cloud import firestore

    db = firestore.Client()

    BRAND_PRIMARY = "#00F0D9"
    BRAND_SECONDARY = "#3B1FE2"
    BRAND_GRADIENT = f"linear-gradient(to right, {BRAND_PRIMARY}, {BRAND_SECONDARY})"

    def wrap_email(content: str) -> str:
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            {content}
        </div>
        <div style="text-align: center; padding: 24px; color: #666; font-size: 12px;">
            <p>NuuMee - AI Video Generation</p>
            <p><a href="https://nuumee.ai" style="color: {BRAND_PRIMARY};">nuumee.ai</a></p>
        </div>
    </div>
</body>
</html>"""

    templates = {
        "account.welcome": {
            "subject": "Welcome to NuuMee! Your {{credits_balance}} free credits are ready",
            "html": wrap_email(f"""
            <h1 style="color: {BRAND_PRIMARY}; margin-top: 0;">Welcome to NuuMee, {{{{first_name}}}}!</h1>
            <p style="font-size: 16px; color: #333;">We're excited to have you on board!</p>
            <p style="font-size: 16px; color: #333;">
                You've received <strong>{{{{credits_balance}}}} free credits</strong> to get started creating amazing AI videos.
            </p>
            <p style="font-size: 16px; color: #333;">Here's what you can do:</p>
            <ul style="color: #333; line-height: 1.8; font-size: 16px;">
                <li>Upload any image and bring it to life with AI</li>
                <li>Create stunning video content in minutes</li>
                <li>Download and share your creations anywhere</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{dashboard_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Create Your First Video</a>
            </div>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666;">
                Want more credits? <a href="{{{{referral_url}}}}" style="color: {BRAND_PRIMARY};">Share your referral link</a> and earn 25 bonus credits for each friend who signs up!
            </p>
        """),
            "text": """Welcome to NuuMee, {{first_name}}!

We're excited to have you on board!

You've received {{credits_balance}} free credits to get started creating amazing AI videos.

Here's what you can do:
- Upload any image and bring it to life with AI
- Create stunning video content in minutes
- Download and share your creations anywhere

Create your first video: {{dashboard_url}}

Want more credits? Share your referral link ({{referral_url}}) and earn 25 bonus credits for each friend who signs up!
""",
            "variables": ["first_name", "credits_balance", "dashboard_url", "referral_url"],
            "active": True,
        },
        "account.welcome_referral": {
            "subject": "Welcome to NuuMee! You received {{bonus_credits}} bonus credits",
            "html": wrap_email(f"""
            <h1 style="color: {BRAND_PRIMARY}; margin-top: 0;">Welcome to NuuMee, {{{{first_name}}}}!</h1>
            <div style="background: linear-gradient(135deg, #e8fdf9, #f0e8ff); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 18px; color: #333; margin: 0; text-align: center;">
                    You received <strong style="color: {BRAND_PRIMARY};">{{{{bonus_credits}}}} bonus credits</strong> from your referral!
                </p>
            </div>
            <p style="font-size: 16px; color: #333;">
                Your current balance: <strong>{{{{total_credits}}}} credits</strong>
            </p>
            <p style="font-size: 16px; color: #333;">
                Start creating amazing AI videos today!
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{dashboard_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Create Your First Video</a>
            </div>
        """),
            "text": """Welcome to NuuMee, {{first_name}}!

Great news! You've received {{bonus_credits}} bonus credits thanks to your referral link.

Your current balance: {{total_credits}} credits

Start creating amazing AI videos today!

Create your first video: {{dashboard_url}}
""",
            "variables": ["first_name", "bonus_credits", "total_credits", "dashboard_url"],
            "active": True,
        },
        "job.completed": {
            "subject": "Your video is ready: {{video_title}}",
            "html": wrap_email(f"""
            <h1 style="color: {BRAND_PRIMARY}; margin-top: 0;">Your video is ready, {{{{first_name}}}}!</h1>
            <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 16px; color: #333; margin: 0;">
                    <strong>{{{{video_title}}}}</strong> has finished processing.
                </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{download_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Your Video</a>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">
                This download link expires in {{{{expires_in}}}}.
            </p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666;">
                View all your videos in your <a href="{{{{dashboard_url}}}}" style="color: {BRAND_PRIMARY};">dashboard</a>.
            </p>
        """),
            "text": """Your video is ready, {{first_name}}!

{{video_title}} has finished processing.

Download your video: {{download_url}}

This download link expires in {{expires_in}}.

View all your videos in your dashboard: {{dashboard_url}}
""",
            "variables": ["first_name", "video_title", "download_url", "expires_in", "dashboard_url"],
            "active": True,
        },
        "job.failed": {
            "subject": "Video processing failed: {{video_title}}",
            "html": wrap_email(f"""
            <h1 style="color: #e53e3e; margin-top: 0;">We're sorry, {{{{first_name}}}}</h1>
            <p style="font-size: 16px; color: #333;">
                Your video <strong>{{{{video_title}}}}</strong> couldn't be processed.
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #e53e3e; padding: 16px; margin: 24px 0;">
                <p style="color: #c53030; margin: 0; font-size: 14px;">
                    <strong>Reason:</strong> {{{{error_reason}}}}
                </p>
            </div>
            <p style="font-size: 16px; color: #333;">
                Don't worry - your credits have been refunded. You can try again with a different image or settings.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{retry_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Try Again</a>
            </div>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666;">
                Need help? <a href="{{{{support_url}}}}" style="color: {BRAND_PRIMARY};">Contact support</a>
            </p>
        """),
            "text": """We're sorry, {{first_name}}

Your video {{video_title}} couldn't be processed.

Reason: {{error_reason}}

Don't worry - your credits have been refunded. You can try again with a different image or settings.

Try again: {{retry_url}}

Need help? Contact support: {{support_url}}
""",
            "variables": ["first_name", "video_title", "error_reason", "retry_url", "support_url"],
            "active": True,
        },
        "credits.low_warning": {
            "subject": "Low credit balance: {{current_balance}} credits remaining",
            "html": wrap_email(f"""
            <h1 style="color: #ed8936; margin-top: 0;">Running low on credits, {{{{first_name}}}}</h1>
            <div style="background: #fffbeb; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="font-size: 32px; color: #ed8936; margin: 0; font-weight: bold;">
                    {{{{current_balance}}}}
                </p>
                <p style="color: #666; margin: 8px 0 0 0;">credits remaining</p>
            </div>
            <p style="font-size: 16px; color: #333;">
                Top up your credits to keep creating amazing AI videos without interruption.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{pricing_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Get More Credits</a>
            </div>
        """),
            "text": """Running low on credits, {{first_name}}

You have {{current_balance}} credits remaining.

Top up your credits to keep creating amazing AI videos without interruption.

Get more credits: {{pricing_url}}
""",
            "variables": ["first_name", "current_balance", "pricing_url"],
            "active": True,
        },
        "referral.signup": {
            "subject": "Someone signed up with your referral code!",
            "html": wrap_email(f"""
            <h1 style="color: {BRAND_PRIMARY}; margin-top: 0;">Great news, {{{{first_name}}}}!</h1>
            <div style="background: linear-gradient(135deg, #e8fdf9, #f0e8ff); border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="font-size: 18px; color: #333; margin: 0; text-align: center;">
                    <strong>{{{{referred_email}}}}</strong> just signed up using your referral code!
                </p>
            </div>
            <p style="font-size: 16px; color: #333;">
                You'll receive <strong style="color: {BRAND_PRIMARY};">25 credits</strong> when they create their first video!
            </p>
            <p style="font-size: 16px; color: #333;">Keep sharing your link to earn more:</p>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; font-family: monospace; text-align: center; margin: 16px 0;">
                {{{{referral_url}}}}
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{referral_stats_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Referral Stats</a>
            </div>
        """),
            "text": """Great news, {{first_name}}!

{{referred_email}} just signed up using your referral code!

You'll receive 25 credits when they create their first video!

Keep sharing your link to earn more:
{{referral_url}}

View your referral stats: {{referral_stats_url}}
""",
            "variables": ["first_name", "referred_email", "referral_code", "referral_url", "referral_stats_url"],
            "active": True,
        },
        "referral.conversion": {
            "subject": "You earned {{bonus_credits}} credits from a referral!",
            "html": wrap_email(f"""
            <h1 style="color: {BRAND_PRIMARY}; margin-top: 0;">You earned credits, {{{{first_name}}}}!</h1>
            <div style="background: linear-gradient(135deg, #e8fdf9, #f0e8ff); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="font-size: 32px; color: {BRAND_PRIMARY}; margin: 0; font-weight: bold;">
                    +{{{{bonus_credits}}}}
                </p>
                <p style="color: #666; margin: 8px 0 0 0;">credits added to your account</p>
            </div>
            <p style="font-size: 16px; color: #333;">
                Someone you referred just created their first video! As a thank you, we've added <strong>{{{{bonus_credits}}}} credits</strong> to your account.
            </p>
            <p style="font-size: 16px; color: #333;">
                Your new balance: <strong>{{{{new_balance}}}} credits</strong>
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{{{referral_stats_url}}}}" style="display: inline-block; background: {BRAND_GRADIENT}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Keep Earning Credits</a>
            </div>
        """),
            "text": """You earned credits, {{first_name}}!

+{{bonus_credits}} credits added to your account

Someone you referred just created their first video! As a thank you, we've added {{bonus_credits}} credits to your account.

Your new balance: {{new_balance}} credits

Keep earning credits: {{referral_stats_url}}
""",
            "variables": ["first_name", "bonus_credits", "new_balance", "referral_stats_url"],
            "active": True,
        },
    }

    seeded = []
    for template_id, template_data in templates.items():
        template_data["updated_at"] = datetime.now(timezone.utc)
        template_data["created_at"] = datetime.now(timezone.utc)
        db.collection("email_templates").document(template_id).set(template_data)
        seeded.append(template_id)

    return {"success": True, "seeded": seeded, "count": len(seeded)}
