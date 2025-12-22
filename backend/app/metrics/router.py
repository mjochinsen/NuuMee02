"""Metrics endpoint router."""
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends

from .collector import metrics

router = APIRouter(prefix="/metrics", tags=["Metrics"])


def verify_metrics_access(api_key: str = None):
    """Simple API key verification for metrics access."""
    # In production, metrics should be protected
    # For now, allow access in development or with correct key
    env = os.getenv("ENVIRONMENT", "development")
    if env == "development":
        return True

    expected_key = os.getenv("METRICS_API_KEY")
    if expected_key and api_key == expected_key:
        return True

    # Allow access without key for now (add proper auth later)
    return True


@router.get("")
async def get_metrics():
    """
    Get current metrics summary.

    Returns aggregated metrics including:
    - Uptime
    - Request counts and error rates
    - Job success/failure rates
    - Errors grouped by type
    """
    return {
        "summary": metrics.get_summary(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/all")
async def get_all_metrics():
    """
    Get all raw metrics.

    Returns every tracked metric with its value and timestamps.
    Use /metrics for a summarized view.
    """
    return {
        "metrics": metrics.get_all(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/prometheus")
async def get_prometheus_metrics():
    """
    Get metrics in Prometheus format.

    Returns metrics in Prometheus text exposition format
    for scraping by Prometheus/Cloud Monitoring.
    """
    lines = []
    lines.append("# HELP nuumee_requests_total Total number of API requests")
    lines.append("# TYPE nuumee_requests_total counter")
    lines.append(f"nuumee_requests_total {metrics.get('requests.total')}")

    lines.append("# HELP nuumee_requests_errors_total Total number of failed API requests")
    lines.append("# TYPE nuumee_requests_errors_total counter")
    lines.append(f"nuumee_requests_errors_total {metrics.get('requests.errors')}")

    lines.append("# HELP nuumee_jobs_created_total Total number of jobs created")
    lines.append("# TYPE nuumee_jobs_created_total counter")
    lines.append(f"nuumee_jobs_created_total {metrics.get('jobs.created')}")

    lines.append("# HELP nuumee_jobs_completed_total Total number of jobs completed")
    lines.append("# TYPE nuumee_jobs_completed_total counter")
    lines.append(f"nuumee_jobs_completed_total {metrics.get('jobs.completed')}")

    lines.append("# HELP nuumee_jobs_failed_total Total number of jobs failed")
    lines.append("# TYPE nuumee_jobs_failed_total counter")
    lines.append(f"nuumee_jobs_failed_total {metrics.get('jobs.failed')}")

    # Error breakdown
    summary = metrics.get_summary()
    for error_type, count in summary.get("errors_by_type", {}).items():
        safe_name = error_type.replace(".", "_").replace("-", "_")
        lines.append(f'nuumee_errors_total{{type="{safe_name}"}} {count}')

    return "\n".join(lines) + "\n"
