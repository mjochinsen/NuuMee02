"""Notification service for NuuMee."""
from .service import send, NotificationResult
from .alerts import (
    send_alert,
    alert_job_failed,
    alert_health_check_failed,
    alert_high_error_rate,
    alert_critical_dependency_missing,
)

__all__ = [
    "send",
    "NotificationResult",
    "send_alert",
    "alert_job_failed",
    "alert_health_check_failed",
    "alert_high_error_rate",
    "alert_critical_dependency_missing",
]
