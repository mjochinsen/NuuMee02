"""Email utility functions for NuuMee."""
import os
import logging
from google.cloud import firestore

logger = logging.getLogger(__name__)


def queue_email(
    db,
    to_email: str,
    subject: str,
    html: str,
):
    """
    Queue an email for Firebase Trigger Email extension.

    The extension watches the 'mail' collection and sends emails automatically.

    Args:
        db: Firestore client
        to_email: Recipient email
        subject: Email subject
        html: HTML content
    """
    mail_data = {
        "to": to_email,
        "message": {
            "subject": subject,
            "html": html,
        },
        "createdAt": firestore.SERVER_TIMESTAMP,
    }

    db.collection("mail").add(mail_data)
    logger.info(f"Queued email to {to_email}: {subject}")


def queue_welcome_email(
    db,
    to_email: str,
    to_name: str,
    credits_balance: int = 25,
):
    """
    Queue a welcome email for new signups (non-referral).

    Args:
        db: Firestore client
        to_email: Recipient email
        to_name: Recipient name (or "there" if unknown)
        credits_balance: Number of credits in their account
    """
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")

    subject = f"Welcome to NuuMee! Your {credits_balance} free credits are ready"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00F0D9;">Welcome to NuuMee, {to_name}!</h1>
        <p>We're excited to have you on board!</p>
        <p>You've received <strong>{credits_balance} free credits</strong> to get started creating amazing AI videos.</p>
        <p>Here's what you can do:</p>
        <ul style="color: #333; line-height: 1.8;">
            <li>Upload any image and bring it to life with AI</li>
            <li>Create stunning video content in minutes</li>
            <li>Download and share your creations anywhere</li>
        </ul>
        <a href="{frontend_url}/create" style="display: inline-block; background: linear-gradient(to right, #00F0D9, #3B1FE2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Create Your First Video</a>
        <p style="margin-top: 24px;">Want more credits? Invite your friends!</p>
        <a href="{frontend_url}/referral" style="color: #00F0D9;">Share your referral link</a> and earn 25 bonus credits for each friend who signs up.
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">You received this email because you signed up for NuuMee.AI</p>
    </div>
    """

    queue_email(db, to_email, subject, html)
    logger.info(f"Queued welcome email to {to_email}")


def queue_referral_welcome_email(
    db,
    to_email: str,
    to_name: str,
    bonus_credits: int = 25,
    total_credits: int = 50,
):
    """
    Queue a welcome email for referral signups (includes bonus credits info).

    Args:
        db: Firestore client
        to_email: Recipient email
        to_name: Recipient name
        bonus_credits: Number of bonus credits from referral
        total_credits: Total credits (signup + bonus)
    """
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")

    subject = f"Welcome to NuuMee! You received {bonus_credits} bonus credits"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00F0D9;">Welcome to NuuMee, {to_name}!</h1>
        <p>Great news! You've received <strong>{bonus_credits} bonus credits</strong> thanks to your referral link.</p>
        <p>Your current balance: <strong>{total_credits} credits</strong> (25 signup + {bonus_credits} referral bonus)</p>
        <p>Start creating amazing AI videos today!</p>
        <a href="{frontend_url}/create" style="display: inline-block; background: linear-gradient(to right, #00F0D9, #3B1FE2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Create Your First Video</a>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">You received this email because you signed up for NuuMee.AI</p>
    </div>
    """

    queue_email(db, to_email, subject, html)
    logger.info(f"Queued referral welcome email to {to_email}")


def queue_referrer_notification_email(
    db,
    to_email: str,
    to_name: str,
    referral_code: str,
    referred_user_name: str,
    pending_credits: int = 25,
):
    """
    Queue notification email to referrer when someone signs up with their code.

    Args:
        db: Firestore client
        to_email: Referrer's email
        to_name: Referrer's name
        referral_code: The referral code that was used
        referred_user_name: Name/email of the person who signed up
        pending_credits: Credits they'll earn when referred user converts
    """
    frontend_url = os.getenv("FRONTEND_URL", "https://nuumee.ai")

    subject = "Someone signed up with your referral code!"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00F0D9;">Great news, {to_name}!</h1>
        <p><strong>{referred_user_name or 'Someone'}</strong> just signed up using your referral code <strong>{referral_code}</strong>.</p>
        <p>You'll receive <strong>{pending_credits} credits</strong> when they create their first video!</p>
        <p>Keep sharing your link to earn more credits:</p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px; font-family: monospace;">{frontend_url}/ref/{referral_code}</p>
        <a href="{frontend_url}/referral" style="display: inline-block; background: linear-gradient(to right, #00F0D9, #3B1FE2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">View Your Referral Stats</a>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="color: #666; font-size: 12px;">You received this email because someone used your NuuMee referral link</p>
    </div>
    """

    queue_email(db, to_email, subject, html)
    logger.info(f"Queued referrer notification email to {to_email}")
