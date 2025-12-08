"""Template fetching and rendering."""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def fetch_template(db, event_type: str) -> Optional[dict]:
    """
    Fetch email template from Firestore.

    Args:
        db: Firestore client
        event_type: Event type (document ID in email_templates collection)

    Returns:
        Template dict with subject, html, text, variables, active
        or None if not found or inactive
    """
    try:
        template_ref = db.collection("email_templates").document(event_type)
        template_doc = template_ref.get()

        if not template_doc.exists:
            logger.warning(f"Template not found for event {event_type}")
            return None

        template_data = template_doc.to_dict()

        # Check if template is active
        if not template_data.get("active", True):
            logger.warning(f"Template for {event_type} is inactive")
            return None

        return template_data

    except Exception as e:
        logger.error(f"Error fetching template for {event_type}: {e}")
        return None


def render_template(template: dict, payload: dict) -> dict:
    """
    Render template with payload variables.

    Uses simple {{variable}} replacement.

    Args:
        template: Template dict with subject, html, text
        payload: Variables to substitute

    Returns:
        Dict with rendered subject, html, text
    """
    subject = template.get("subject", "")
    html = template.get("html", "")
    text = template.get("text", "")

    # Simple string replacement for each variable
    for key, value in payload.items():
        placeholder = f"{{{{{key}}}}}"  # {{variable}}

        # Convert value to string if not already
        str_value = str(value) if value is not None else ""

        subject = subject.replace(placeholder, str_value)
        html = html.replace(placeholder, str_value)
        text = text.replace(placeholder, str_value)

    return {
        "subject": subject,
        "html": html,
        "text": text
    }


def validate_template_variables(template: dict, payload: dict) -> list[str]:
    """
    Check if all required template variables are provided.

    Args:
        template: Template dict with variables list
        payload: Provided variables

    Returns:
        List of missing variable names (empty if all provided)
    """
    required_vars = template.get("variables", [])
    missing = [var for var in required_vars if var not in payload]

    if missing:
        logger.warning(f"Missing template variables: {missing}")

    return missing
