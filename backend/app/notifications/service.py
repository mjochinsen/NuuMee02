"""Main notification service."""
import logging
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timezone
from google.cloud import firestore

from .constants import is_valid_event_type
from .preferences import should_send_notification
from .templates import fetch_template, render_template, validate_template_variables

logger = logging.getLogger(__name__)


def mask_email(email: str) -> str:
    """
    Mask email address for privacy while keeping it identifiable.

    Shows first 4 chars + *** + last 2 chars for addresses with 6+ chars.
    Examples:
        john.doe@example.com -> john***oe@example.com
        referral9@gmail.com  -> refe***l9@gmail.com
        abc@test.com         -> ab***c@test.com
        ab@test.com          -> a***b@test.com
        a@test.com           -> ***@test.com
    """
    if not email or "@" not in email:
        return "***"

    local, domain = email.split("@", 1)

    # Very short emails - mask completely
    if len(local) <= 1:
        return f"***@{domain}"

    # 2-3 chars: show first and last
    if len(local) <= 3:
        return f"{local[0]}***{local[-1]}@{domain}"

    # 4-5 chars: show first 2 and last 1
    if len(local) <= 5:
        return f"{local[:2]}***{local[-1]}@{domain}"

    # 6+ chars: show first 4 and last 2
    return f"{local[:4]}***{local[-2:]}@{domain}"


@dataclass
class NotificationResult:
    """Result of a notification send attempt."""
    sent: bool
    reason: str  # "sent" | "preference_disabled" | "template_not_found" | "user_not_found" | "error"
    mail_doc_id: Optional[str] = None
    error: Optional[str] = None


def send(
    db,
    event_type: str,
    user_id: str,
    payload: dict,
) -> NotificationResult:
    """
    Send a notification to a user.

    Flow:
    1. Validate event_type
    2. Fetch user doc (get email + preferences)
    3. Check if user wants this notification type
    4. Fetch template from email_templates/{event_type}
    5. Render template with payload
    6. Write to mail collection
    7. Log to notification_log

    Args:
        db: Firestore client
        event_type: Event type (e.g., "job.completed")
        user_id: User ID
        payload: Variables for template rendering

    Returns:
        NotificationResult with sent status and details
    """
    # 1. Validate event type
    if not is_valid_event_type(event_type):
        logger.error(f"Invalid event type: {event_type}")
        return NotificationResult(
            sent=False,
            reason="invalid_event_type",
            error=f"Unknown event type: {event_type}"
        )

    try:
        # 2. Fetch user document
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            logger.warning(f"User not found: {user_id}")
            return NotificationResult(
                sent=False,
                reason="user_not_found"
            )

        user_data = user_doc.to_dict()
        user_email = user_data.get("email")

        if not user_email:
            logger.warning(f"User {user_id} has no email address")
            return NotificationResult(
                sent=False,
                reason="no_email"
            )

        # 3. Check preferences
        if not should_send_notification(event_type, user_data):
            logger.info(
                f"User {user_id} ({mask_email(user_email)}) has disabled "
                f"notifications for {event_type}"
            )
            return NotificationResult(
                sent=False,
                reason="preference_disabled"
            )

        # 4. Fetch template
        template = fetch_template(db, event_type)
        if template is None:
            logger.error(f"Template not found or inactive: {event_type}")
            return NotificationResult(
                sent=False,
                reason="template_not_found"
            )

        # Validate template variables (warn but don't block)
        validate_template_variables(template, payload)

        # 5. Render template
        rendered = render_template(template, payload)

        # 6. Write to mail collection
        mail_data = {
            "to": user_email,
            "message": {
                "subject": rendered["subject"],
                "html": rendered["html"],
            },
            "createdAt": firestore.SERVER_TIMESTAMP,
        }

        # Add plain text if available
        if rendered.get("text"):
            mail_data["message"]["text"] = rendered["text"]

        mail_ref = db.collection("mail").add(mail_data)
        mail_doc_id = mail_ref[1].id

        logger.info(
            f"Queued {event_type} notification to {mask_email(user_email)} "
            f"(mail_doc: {mail_doc_id})"
        )

        # 7. Log to notification_log
        try:
            log_data = {
                "user_id": user_id,
                "event_type": event_type,
                "email": user_email,
                "sent_at": datetime.now(timezone.utc),
                "mail_doc_id": mail_doc_id,
                "payload": payload,
            }
            db.collection("notification_log").add(log_data)
        except Exception as log_error:
            # Don't fail the whole operation if logging fails
            logger.warning(f"Failed to write notification log: {log_error}")

        return NotificationResult(
            sent=True,
            reason="sent",
            mail_doc_id=mail_doc_id
        )

    except Exception as e:
        logger.error(f"Error sending notification {event_type} to {user_id}: {e}")
        return NotificationResult(
            sent=False,
            reason="error",
            error=str(e)
        )
