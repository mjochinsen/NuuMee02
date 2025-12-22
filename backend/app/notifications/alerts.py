"""System alerting module with rate limiting."""
import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from google.cloud import firestore

from ..email.utils import queue_email

logger = logging.getLogger(__name__)

# Rate limiting: Track last alert time per alert type
_last_alerts: dict[str, datetime] = {}

# Cooldown period between alerts of the same type
ALERT_COOLDOWN = timedelta(hours=1)

# Admin email(s) for alerts
ALERT_EMAIL = os.getenv("ALERT_EMAIL", "mjochinsen@gmail.com")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")


def should_send_alert(alert_type: str) -> bool:
    """Check if we should send an alert (rate limiting)."""
    now = datetime.now(timezone.utc)
    last_sent = _last_alerts.get(alert_type)

    if last_sent is None:
        return True

    if now - last_sent >= ALERT_COOLDOWN:
        return True

    time_remaining = ALERT_COOLDOWN - (now - last_sent)
    logger.debug(
        f"Alert {alert_type} rate-limited. "
        f"Next allowed in {time_remaining.total_seconds():.0f}s"
    )
    return False


def record_alert_sent(alert_type: str):
    """Record that an alert was sent (for rate limiting)."""
    _last_alerts[alert_type] = datetime.now(timezone.utc)


def send_alert(
    alert_type: str,
    title: str,
    message: str,
    severity: str = "error",
    details: Optional[dict] = None,
    skip_rate_limit: bool = False,
):
    """
    Send an alert email to admin(s).

    Args:
        alert_type: Unique identifier for this alert type (for rate limiting)
        title: Alert title (will be in email subject)
        message: Alert message body
        severity: "info", "warning", "error", "critical"
        details: Optional dictionary of additional details
        skip_rate_limit: If True, always send (use sparingly)
    """
    # Rate limiting check
    if not skip_rate_limit and not should_send_alert(alert_type):
        logger.info(f"Alert {alert_type} skipped (rate limited)")
        return False

    try:
        db = firestore.Client()
        now = datetime.now(timezone.utc)

        # Color coding for severity
        severity_colors = {
            "info": "#3B82F6",      # Blue
            "warning": "#F59E0B",   # Amber
            "error": "#EF4444",     # Red
            "critical": "#DC2626",  # Dark red
        }
        color = severity_colors.get(severity, "#6B7280")

        # Build details HTML
        details_html = ""
        if details:
            details_html = "<h3>Details:</h3><ul>"
            for key, value in details.items():
                details_html += f"<li><strong>{key}:</strong> {value}</li>"
            details_html += "</ul>"

        # Build email
        subject = f"[{ENVIRONMENT.upper()}] [{severity.upper()}] {title}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: {color}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 20px;">🚨 System Alert: {title}</h1>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
                <p style="margin-top: 0;"><strong>Severity:</strong> {severity.upper()}</p>
                <p><strong>Environment:</strong> {ENVIRONMENT}</p>
                <p><strong>Time:</strong> {now.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
                <p><strong>Message:</strong></p>
                <p style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0;">{message}</p>
                {details_html}
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated alert from NuuMee monitoring.
                    <br>Alert type: {alert_type}
                    <br><a href="https://nuumee.ai/status">View Status Page</a>
                    | <a href="https://api.nuumee.ai/api/v1/status/deep">Deep Health Check</a>
                </p>
            </div>
        </div>
        """

        queue_email(db, ALERT_EMAIL, subject, html)
        record_alert_sent(alert_type)

        # Also log to Firestore for history
        db.collection("system_alerts").add({
            "type": alert_type,
            "title": title,
            "message": message,
            "severity": severity,
            "details": details,
            "environment": ENVIRONMENT,
            "created_at": now,
        })

        logger.info(f"Alert sent: [{severity}] {title}")
        return True

    except Exception as e:
        logger.exception(f"Failed to send alert: {e}")
        return False


# Convenience functions for common alerts

def alert_job_failed(job_id: str, error: str, user_id: Optional[str] = None):
    """Alert when a job fails with an error."""
    send_alert(
        alert_type=f"job_failure_{error[:30]}",
        title="Job Processing Failed",
        message=f"Job {job_id} failed with error: {error}",
        severity="error",
        details={
            "job_id": job_id,
            "error": error,
            "user_id": user_id or "unknown",
        }
    )


def alert_health_check_failed(check_name: str, error: str):
    """Alert when a health check fails."""
    send_alert(
        alert_type=f"health_check_{check_name}",
        title=f"Health Check Failed: {check_name}",
        message=f"The {check_name} health check is failing: {error}",
        severity="critical",
        details={
            "check": check_name,
            "error": error,
        }
    )


def alert_high_error_rate(error_rate: float, threshold: float = 5.0):
    """Alert when error rate exceeds threshold."""
    send_alert(
        alert_type="high_error_rate",
        title="High Error Rate Detected",
        message=f"API error rate is {error_rate:.1f}%, exceeding threshold of {threshold}%",
        severity="warning",
        details={
            "error_rate": f"{error_rate:.2f}%",
            "threshold": f"{threshold}%",
        }
    )


def alert_critical_dependency_missing(dependency: str, error: str):
    """Alert when a critical dependency is missing (e.g., ffmpeg)."""
    send_alert(
        alert_type=f"missing_dependency_{dependency}",
        title=f"Critical Dependency Missing: {dependency}",
        message=f"The required dependency '{dependency}' is not available: {error}",
        severity="critical",
        details={
            "dependency": dependency,
            "error": error,
        },
        skip_rate_limit=True,  # Always alert for missing dependencies
    )
