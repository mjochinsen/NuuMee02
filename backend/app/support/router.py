"""Support ticket router."""
import os
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, EmailStr

from ..middleware.auth import get_current_user_id
from ..auth.firebase import get_firestore_client
from ..email.utils import queue_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/support", tags=["support"])

SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@nuumee.ai")
MAX_ATTACHMENT_SIZE_KB = 500  # 500KB limit per attachment


class Attachment(BaseModel):
    """Inline attachment with base64 content."""
    filename: str = Field(..., max_length=255)
    content: str = Field(..., description="Base64 encoded file content")
    content_type: str = Field(..., description="MIME type")


class SubmitTicketRequest(BaseModel):
    """Request model for submitting a support ticket."""
    email: EmailStr = Field(..., description="User's email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Ticket subject")
    category: str = Field(..., description="Issue category")
    job_id: Optional[str] = Field(None, description="Related job ID if applicable")
    message: str = Field(..., min_length=10, max_length=5000, description="Ticket message")
    attachments: Optional[List[Attachment]] = Field(None, description="Inline attachments (max 500KB each)")


class TicketResponse(BaseModel):
    """Response after ticket submission."""
    success: bool
    message: str
    ticket_id: str


@router.post("/ticket", response_model=TicketResponse)
async def submit_ticket(
    request: SubmitTicketRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_firestore_client),
):
    """
    Submit a support ticket.

    Sends email notification to support team and saves ticket to Firestore.
    """
    try:
        # Validate attachment sizes
        if request.attachments:
            for att in request.attachments:
                # Base64 is ~4/3 of original size, so check decoded size
                size_kb = len(att.content) * 3 / 4 / 1024
                if size_kb > MAX_ATTACHMENT_SIZE_KB:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Attachment '{att.filename}' exceeds {MAX_ATTACHMENT_SIZE_KB}KB limit"
                    )

        # Create ticket document (store filenames only, not content)
        ticket_data = {
            "user_id": user_id,
            "email": request.email,
            "subject": request.subject,
            "category": request.category,
            "job_id": request.job_id,
            "message": request.message,
            "attachment_names": [a.filename for a in request.attachments] if request.attachments else [],
            "status": "open",
            "created_at": datetime.utcnow(),
        }

        # Save to Firestore
        ticket_ref = db.collection("support_tickets").add(ticket_data)
        ticket_id = ticket_ref[1].id

        # Format attachments info for email body
        attachments_html = ""
        if request.attachments:
            attachments_html = f"<p><strong>Attachments:</strong> {len(request.attachments)} file(s) attached</p>"

        # Format email to support team
        job_info = f"<p><strong>Related Job ID:</strong> {request.job_id}</p>" if request.job_id else ""

        support_email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00F0D9;">New Support Ticket</h2>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Ticket ID:</strong> {ticket_id}</p>
                <p><strong>From:</strong> {request.email}</p>
                <p><strong>User ID:</strong> {user_id}</p>
                <p><strong>Category:</strong> {request.category}</p>
                <p><strong>Subject:</strong> {request.subject}</p>
                {job_info}
                {attachments_html}
            </div>
            <h3>Message:</h3>
            <div style="background: #fff; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <p style="white-space: pre-wrap;">{request.message}</p>
            </div>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">Reply directly to this email to respond to the user at {request.email}</p>
        </div>
        """

        # Build email attachments for Firebase Trigger Email extension
        email_attachments = None
        if request.attachments:
            email_attachments = [
                {
                    "filename": att.filename,
                    "content": att.content,
                    "encoding": "base64",
                }
                for att in request.attachments
            ]

        # Queue email TO support team (with Reply-To set to user's email)
        queue_email(
            db,
            to_email=SUPPORT_EMAIL,
            subject=f"[Support Ticket] {request.category}: {request.subject}",
            html=support_email_html,
            reply_to=request.email,
            attachments=email_attachments,
        )

        # Queue confirmation email to user
        confirmation_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00F0D9;">We received your support request</h2>
            <p>Hi there,</p>
            <p>Thank you for contacting NuuMee support. We've received your message and will get back to you as soon as possible.</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Ticket ID:</strong> {ticket_id}</p>
                <p><strong>Subject:</strong> {request.subject}</p>
                <p><strong>Category:</strong> {request.category}</p>
            </div>
            <p>We typically respond within 24-48 hours.</p>
            <p>Best regards,<br>The NuuMee Team</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 12px;">This is an automated confirmation. Please don't reply to this email.</p>
        </div>
        """

        queue_email(
            db,
            to_email=request.email,
            subject=f"We received your support request - Ticket #{ticket_id[:8]}",
            html=confirmation_html,
        )

        logger.info(f"Support ticket {ticket_id} created by user {user_id}")

        return TicketResponse(
            success=True,
            message="Your support ticket has been submitted. We'll respond within 24-48 hours.",
            ticket_id=ticket_id,
        )

    except Exception as e:
        logger.error(f"Failed to submit support ticket: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit support ticket")
