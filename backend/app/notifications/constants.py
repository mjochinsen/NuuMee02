"""Event type constants and preference mappings."""

EVENT_TYPES = {
    "account.welcome": {
        "preference": None,
        "always_send": True,
        "description": "New user signup"
    },
    "account.welcome_referral": {
        "preference": None,
        "always_send": True,
        "description": "Signup via referral"
    },
    "job.completed": {
        "preference": "email_on_completion",
        "always_send": False,
        "description": "Video render finished"
    },
    "job.failed": {
        "preference": "email_on_failure",
        "always_send": False,
        "description": "Video render failed"
    },
    "credits.low_warning": {
        "preference": "email_on_low_credits",
        "always_send": False,
        "description": "Balance < 10 credits"
    },
    "referral.signup": {
        "preference": None,
        "always_send": True,
        "description": "Someone used your referral code"
    },
    "referral.conversion": {
        "preference": None,
        "always_send": True,
        "description": "Referral made first video"
    },
}


def is_valid_event_type(event_type: str) -> bool:
    """Check if event_type is valid."""
    return event_type in EVENT_TYPES


def get_preference_key(event_type: str) -> str | None:
    """Get the preference key for an event type."""
    if event_type not in EVENT_TYPES:
        return None
    return EVENT_TYPES[event_type]["preference"]


def should_always_send(event_type: str) -> bool:
    """Check if this event type should always be sent regardless of preferences."""
    if event_type not in EVENT_TYPES:
        return False
    return EVENT_TYPES[event_type]["always_send"]
