"""Affiliate program routes."""
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore

from .models import (
    AffiliateApplyRequest,
    AffiliateApplyResponse,
    AffiliateStatus,
    AffiliateResponse,
    AffiliateStats,
    PayoutRequest,
    PayoutResponse,
    PayoutStatus,
)
from ..auth.firebase import get_firestore_client
from ..middleware.auth import get_current_user_id, get_optional_user_id
from fastapi import Request


logger = logging.getLogger(__name__)

# Admin email for affiliate notifications
ADMIN_EMAIL = "NuuMee@NuuMee.ai"

router = APIRouter(prefix="/affiliate", tags=["Affiliate"])


def generate_affiliate_id() -> str:
    """Generate a unique affiliate ID."""
    return f"aff_{uuid.uuid4().hex[:12]}"


def generate_payout_id() -> str:
    """Generate a unique payout ID."""
    return f"payout_{uuid.uuid4().hex[:12]}"


@router.post("/apply", response_model=AffiliateApplyResponse)
async def apply_for_affiliate(
    request: AffiliateApplyRequest,
    http_request: Request,
):
    """
    Apply to become an affiliate.

    This endpoint:
    1. Validates email doesn't already have an affiliate account
    2. Creates a pending affiliate record
    3. Sends confirmation email to applicant
    4. Sends notification email to admin

    Admins will review the application and approve/reject it.
    Once approved, an affiliate code (AFF-XXXXX) will be assigned.

    Authentication is optional - works for both logged-in and anonymous users.
    """
    db = get_firestore_client()

    # Get optional user_id if logged in
    user_id = await get_optional_user_id(http_request)

    # Check if email already has an affiliate account
    existing_affiliate = db.collection("affiliates")\
        .where("email", "==", request.email)\
        .limit(1)\
        .get()

    if list(existing_affiliate):
        existing_data = list(existing_affiliate)[0].to_dict()
        status = existing_data.get("status")

        if status == AffiliateStatus.PENDING.value:
            raise HTTPException(
                status_code=400,
                detail="An application with this email is already pending review"
            )
        elif status == AffiliateStatus.APPROVED.value:
            raise HTTPException(
                status_code=400,
                detail="This email is already registered as an affiliate"
            )
        elif status == AffiliateStatus.REJECTED.value:
            raise HTTPException(
                status_code=400,
                detail="A previous application with this email was rejected. Please contact support."
            )
        elif status == AffiliateStatus.SUSPENDED.value:
            raise HTTPException(
                status_code=400,
                detail="This affiliate account is suspended. Please contact support."
            )

    # Generate affiliate ID
    affiliate_id = generate_affiliate_id()

    # Create affiliate record
    affiliate_data = {
        "affiliate_id": affiliate_id,
        "user_id": user_id,  # May be None if not logged in
        "status": AffiliateStatus.PENDING.value,
        "affiliate_code": None,  # Assigned when approved
        "name": request.name,
        "email": request.email,
        "platform_url": request.platform_url,
        "platform_type": request.platform_type.value,
        "promotion_plan": request.promotion_plan,
        "paypal_email": request.paypal_email,
        "audience_size": request.audience_size,
        # Stats
        "total_clicks": 0,
        "total_signups": 0,
        "total_conversions": 0,
        "commission_earned": 0.0,
        "commission_pending": 0.0,
        "commission_paid": 0.0,
        # Timestamps
        "applied_at": firestore.SERVER_TIMESTAMP,
        "approved_at": None,
        "rejected_at": None,
        "rejection_reason": None,
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }

    try:
        db.collection("affiliates").document(affiliate_id).set(affiliate_data)

        logger.info(
            f"Affiliate application received: {affiliate_id} from {request.email} "
            f"(user_id: {user_id or 'anonymous'})"
        )

        # Send confirmation email to applicant
        try:
            applicant_email_data = {
                "to": request.email,
                "message": {
                    "subject": "NuuMee Affiliate Application Received",
                    "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #00F0D9;">Thanks for applying, {request.name}!</h2>
                        <p>We've received your application to join the NuuMee.AI Affiliate Program.</p>
                        <div style="background: #1E293B; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>What happens next:</strong></p>
                            <ol style="margin: 10px 0; padding-left: 20px;">
                                <li>We'll review your application (2-3 business days)</li>
                                <li>If approved, you'll receive your unique affiliate code</li>
                                <li>Start promoting and earn 30% on first purchases!</li>
                            </ol>
                        </div>
                        <p>Questions? Reply to this email or contact <a href="mailto:affiliates@nuumee.ai">affiliates@nuumee.ai</a></p>
                        <p style="color: #94A3B8; font-size: 12px; margin-top: 30px;">
                            Application ID: {affiliate_id}
                        </p>
                    </div>
                    """,
                },
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
            db.collection("mail").add(applicant_email_data)
            logger.info(f"Sent confirmation email to {request.email}")
        except Exception as email_err:
            logger.warning(f"Failed to send applicant confirmation email: {email_err}")

        # Send notification email to admin
        try:
            admin_email_data = {
                "to": ADMIN_EMAIL,
                "message": {
                    "subject": f"New Affiliate Application: {request.name}",
                    "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #00F0D9;">New Affiliate Application</h2>
                        <div style="background: #1E293B; padding: 20px; border-radius: 8px; margin: 20px 0; color: #F1F5F9;">
                            <p><strong>Name:</strong> {request.name}</p>
                            <p><strong>Email:</strong> {request.email}</p>
                            <p><strong>Platform:</strong> {request.platform_type.value}</p>
                            <p><strong>URL:</strong> <a href="{request.platform_url}">{request.platform_url}</a></p>
                            <p><strong>Audience Size:</strong> {request.audience_size:,}</p>
                            <p><strong>PayPal:</strong> {request.paypal_email}</p>
                        </div>
                        <div style="background: #0F172A; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Promotion Plan:</strong></p>
                            <p style="color: #94A3B8;">{request.promotion_plan}</p>
                        </div>
                        <p style="color: #94A3B8; font-size: 12px;">
                            Application ID: {affiliate_id}<br>
                            User ID: {user_id or 'Not logged in'}
                        </p>
                        <p>Review in <a href="https://console.firebase.google.com/project/wanapi-prod/firestore/data/~2Faffiliates~2F{affiliate_id}">Firebase Console</a></p>
                    </div>
                    """,
                },
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
            db.collection("mail").add(admin_email_data)
            logger.info(f"Sent admin notification to {ADMIN_EMAIL}")
        except Exception as email_err:
            logger.warning(f"Failed to send admin notification email: {email_err}")

        return AffiliateApplyResponse(
            affiliate_id=affiliate_id,
            status=AffiliateStatus.PENDING,
            message="Your affiliate application has been submitted successfully. We will review it within 2-3 business days."
        )

    except Exception as e:
        logger.error(f"Failed to create affiliate application: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to submit affiliate application. Please try again."
        )


@router.get("/stats", response_model=AffiliateResponse)
async def get_affiliate_stats(
    user_id: str = Depends(get_current_user_id),
):
    """
    Get affiliate dashboard stats.

    Returns full affiliate details including:
    - Status (pending, approved, rejected, suspended)
    - Affiliate code (if approved)
    - Statistics (clicks, signups, conversions, commissions)
    - Application and approval dates

    Only available for approved affiliates.

    Requires authentication.
    """
    db = get_firestore_client()

    # Get affiliate record
    affiliate_query = db.collection("affiliates")\
        .where("user_id", "==", user_id)\
        .limit(1)\
        .get()

    affiliate_list = list(affiliate_query)
    if not affiliate_list:
        raise HTTPException(
            status_code=404,
            detail="You are not registered as an affiliate. Please apply first."
        )

    affiliate_data = affiliate_list[0].to_dict()
    status = affiliate_data.get("status")

    # Only approved affiliates can view full stats
    if status != AffiliateStatus.APPROVED.value:
        raise HTTPException(
            status_code=403,
            detail=f"Your affiliate status is '{status}'. Stats are only available for approved affiliates."
        )

    # Parse timestamps
    applied_at = affiliate_data.get("applied_at")
    approved_at = affiliate_data.get("approved_at")

    if hasattr(applied_at, 'timestamp'):
        applied_at = datetime.fromtimestamp(applied_at.timestamp(), tz=timezone.utc)
    if approved_at and hasattr(approved_at, 'timestamp'):
        approved_at = datetime.fromtimestamp(approved_at.timestamp(), tz=timezone.utc)

    return AffiliateResponse(
        affiliate_id=affiliate_data.get("affiliate_id"),
        user_id=affiliate_data.get("user_id"),
        status=AffiliateStatus(status),
        affiliate_code=affiliate_data.get("affiliate_code"),
        stats=AffiliateStats(
            total_clicks=affiliate_data.get("total_clicks", 0),
            total_signups=affiliate_data.get("total_signups", 0),
            total_conversions=affiliate_data.get("total_conversions", 0),
            commission_earned=affiliate_data.get("commission_earned", 0.0),
            commission_pending=affiliate_data.get("commission_pending", 0.0),
            commission_paid=affiliate_data.get("commission_paid", 0.0),
        ),
        applied_at=applied_at,
        approved_at=approved_at,
    )


@router.post("/payout", response_model=PayoutResponse)
async def request_payout(
    request: PayoutRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Request payout of earned commissions.

    This endpoint:
    1. Validates user is an approved affiliate
    2. Validates requested amount <= commission_pending
    3. Creates a payout record (status: pending)
    4. Updates affiliate's commission_pending balance
    5. Returns payout details

    Payouts are processed manually by admins and sent via PayPal.

    Requires authentication.
    """
    db = get_firestore_client()

    # Get affiliate record
    affiliate_query = db.collection("affiliates")\
        .where("user_id", "==", user_id)\
        .limit(1)\
        .get()

    affiliate_list = list(affiliate_query)
    if not affiliate_list:
        raise HTTPException(
            status_code=404,
            detail="You are not registered as an affiliate"
        )

    affiliate_doc = affiliate_list[0]
    affiliate_data = affiliate_doc.to_dict()
    status = affiliate_data.get("status")

    # Only approved affiliates can request payouts
    if status != AffiliateStatus.APPROVED.value:
        raise HTTPException(
            status_code=403,
            detail="Only approved affiliates can request payouts"
        )

    # Validate payout amount
    commission_pending = affiliate_data.get("commission_pending", 0.0)
    if request.amount > commission_pending:
        raise HTTPException(
            status_code=400,
            detail=f"Requested amount (${request.amount:.2f}) exceeds available balance (${commission_pending:.2f})"
        )

    # Minimum payout amount
    MIN_PAYOUT = 50.0
    if request.amount < MIN_PAYOUT:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum payout amount is ${MIN_PAYOUT:.2f}"
        )

    # Generate payout ID
    payout_id = generate_payout_id()

    # Create payout record
    payout_data = {
        "payout_id": payout_id,
        "affiliate_id": affiliate_data.get("affiliate_id"),
        "amount": request.amount,
        "status": PayoutStatus.PENDING.value,
        "paypal_email": affiliate_data.get("paypal_email"),
        "paypal_transaction_id": None,
        "requested_at": firestore.SERVER_TIMESTAMP,
        "processed_at": None,
        "completed_at": None,
        "failed_at": None,
        "failure_reason": None,
    }

    try:
        # Create payout document
        db.collection("affiliate_payouts").document(payout_id).set(payout_data)

        # Update affiliate's commission_pending balance
        new_pending = commission_pending - request.amount
        affiliate_doc.reference.update({
            "commission_pending": new_pending,
            "updated_at": firestore.SERVER_TIMESTAMP,
        })

        logger.info(
            f"Payout requested: {payout_id} for affiliate {affiliate_data.get('affiliate_id')} "
            f"(${request.amount:.2f})"
        )

        return PayoutResponse(
            payout_id=payout_id,
            amount=request.amount,
            status=PayoutStatus.PENDING,
            message=f"Payout request submitted successfully. ${request.amount:.2f} will be sent to your PayPal within 5-7 business days."
        )

    except Exception as e:
        logger.error(f"Failed to create payout request: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create payout request. Please try again."
        )
