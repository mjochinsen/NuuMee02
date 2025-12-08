"""Preference checking logic."""
import logging
from .constants import should_always_send, get_preference_key

logger = logging.getLogger(__name__)


def should_send_notification(
    event_type: str,
    user_data: dict
) -> bool:
    """
    Check if a notification should be sent based on user preferences.

    Args:
        event_type: The event type (e.g., "job.completed")
        user_data: User document data from Firestore

    Returns:
        True if notification should be sent, False otherwise
    """
    # Events with always_send=True skip preference check
    if should_always_send(event_type):
        logger.debug(f"Event {event_type} has always_send=True, sending")
        return True

    # Get preference key for this event
    preference_key = get_preference_key(event_type)
    if preference_key is None:
        logger.warning(f"Event {event_type} has no preference key, skipping")
        return False

    # Get user's notification preferences
    notifications = user_data.get("notifications", {})

    # Default to True if preference not set (opt-out model)
    should_send = notifications.get(preference_key, True)

    logger.debug(
        f"User preference for {event_type} ({preference_key}): {should_send}"
    )

    return should_send
