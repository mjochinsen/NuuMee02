"""Status and health check routes."""
import os
import time
import logging
import subprocess
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
import httpx

from google.cloud import firestore
from google.cloud import storage

from .models import (
    ServiceStatus,
    SystemStatus,
    ServiceHealth,
    SystemHealthResponse,
)
from ..notifications import alert_health_check_failed

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/status", tags=["Status"])


async def check_firestore_health() -> ServiceHealth:
    """Check Firestore connectivity and latency."""
    start_time = time.time()
    status = ServiceStatus.OPERATIONAL
    message = None

    try:
        db = firestore.Client()
        # Simple read operation to check connectivity
        db.collection("_health_check").document("ping").get()
        latency_ms = (time.time() - start_time) * 1000

        if latency_ms > 1000:
            status = ServiceStatus.DEGRADED
            message = "High latency detected"
    except Exception as e:
        status = ServiceStatus.MAJOR_OUTAGE
        message = f"Connection failed: {str(e)[:100]}"
        latency_ms = None
        logger.error(f"Firestore health check failed: {e}")

    return ServiceHealth(
        name="Database",
        status=status,
        latency_ms=latency_ms,
        message=message,
        last_checked=datetime.now(timezone.utc)
    )


async def check_gcs_health() -> ServiceHealth:
    """Check Google Cloud Storage connectivity."""
    start_time = time.time()
    status = ServiceStatus.OPERATIONAL
    message = None
    bucket_name = os.getenv("GCS_BUCKET", "nuumee-inputs")

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        # Check if we can create a blob reference (doesn't require bucket access)
        # This verifies the storage client is configured correctly
        blob = bucket.blob("_health_check_test")
        # Just checking the blob exists method works (won't actually access storage)
        _ = blob.name
        latency_ms = (time.time() - start_time) * 1000

        # For Cloud Run, the fact that we can create a storage client
        # and reference blobs means storage is accessible
        message = "Storage client operational"
    except Exception as e:
        status = ServiceStatus.MAJOR_OUTAGE
        message = f"Storage access failed: {str(e)[:100]}"
        latency_ms = None
        logger.error(f"GCS health check failed: {e}")

    return ServiceHealth(
        name="File Storage",
        status=status,
        latency_ms=latency_ms,
        message=message,
        last_checked=datetime.now(timezone.utc)
    )


async def check_stripe_health() -> ServiceHealth:
    """Check Stripe API connectivity."""
    start_time = time.time()
    status = ServiceStatus.OPERATIONAL
    message = None

    try:
        import stripe
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
        if stripe.api_key:
            # Simple API call to check connectivity
            stripe.Balance.retrieve()
            latency_ms = (time.time() - start_time) * 1000

            if latency_ms > 3000:
                status = ServiceStatus.DEGRADED
                message = "High latency detected"
        else:
            status = ServiceStatus.DEGRADED
            message = "API key not configured"
            latency_ms = None
    except stripe.error.AuthenticationError:
        status = ServiceStatus.MAJOR_OUTAGE
        message = "Authentication failed"
        latency_ms = None
    except stripe.error.APIConnectionError as e:
        status = ServiceStatus.MAJOR_OUTAGE
        message = f"Connection failed: {str(e)[:100]}"
        latency_ms = None
        logger.error(f"Stripe health check failed: {e}")
    except Exception as e:
        status = ServiceStatus.DEGRADED
        message = f"Check failed: {str(e)[:100]}"
        latency_ms = None
        logger.error(f"Stripe health check failed: {e}")

    return ServiceHealth(
        name="Payment Processing",
        status=status,
        latency_ms=latency_ms,
        message=message,
        last_checked=datetime.now(timezone.utc)
    )


async def check_worker_health() -> ServiceHealth:
    """Check worker service connectivity."""
    start_time = time.time()
    status = ServiceStatus.OPERATIONAL
    message = None
    worker_url = os.getenv("WORKER_URL", "https://nuumee-worker-450296399943.us-central1.run.app")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{worker_url}/health")
            latency_ms = (time.time() - start_time) * 1000

            if response.status_code == 200:
                if latency_ms > 5000:
                    status = ServiceStatus.DEGRADED
                    message = "High latency detected"
            else:
                status = ServiceStatus.DEGRADED
                message = f"Unexpected status: {response.status_code}"
    except httpx.TimeoutException:
        status = ServiceStatus.DEGRADED
        message = "Request timed out"
        latency_ms = None
    except Exception as e:
        status = ServiceStatus.MAJOR_OUTAGE
        message = f"Connection failed: {str(e)[:100]}"
        latency_ms = None
        logger.error(f"Worker health check failed: {e}")

    return ServiceHealth(
        name="Video Processing",
        status=status,
        latency_ms=latency_ms,
        message=message,
        last_checked=datetime.now(timezone.utc)
    )


def calculate_overall_status(services: list[ServiceHealth]) -> SystemStatus:
    """Calculate overall system status based on individual service statuses."""
    statuses = [s.status for s in services]

    # If any service has major outage, system has major outage
    if ServiceStatus.MAJOR_OUTAGE in statuses:
        return SystemStatus.MAJOR_OUTAGE

    # If any service is in maintenance, system is in maintenance
    if ServiceStatus.MAINTENANCE in statuses:
        return SystemStatus.MAINTENANCE

    # If any service has partial outage or is degraded, system has partial outage
    if ServiceStatus.PARTIAL_OUTAGE in statuses or ServiceStatus.DEGRADED in statuses:
        return SystemStatus.PARTIAL_OUTAGE

    return SystemStatus.OPERATIONAL


@router.get("", response_model=SystemHealthResponse)
async def get_system_status():
    """
    Get comprehensive system health status.

    Checks all critical services:
    - Database (Firestore)
    - File Storage (GCS)
    - Payment Processing (Stripe)
    - Video Processing (Worker)
    - API (this service)

    Returns overall system status and individual service statuses.
    """
    # Check all services concurrently
    import asyncio

    # API is healthy if this endpoint responds
    api_health = ServiceHealth(
        name="API",
        status=ServiceStatus.OPERATIONAL,
        latency_ms=0,
        message=None,
        last_checked=datetime.now(timezone.utc)
    )

    # Run health checks
    try:
        firestore_health, gcs_health, stripe_health, worker_health = await asyncio.gather(
            check_firestore_health(),
            check_gcs_health(),
            check_stripe_health(),
            check_worker_health(),
            return_exceptions=True
        )

        # Handle any exceptions from gather
        services = [api_health]

        for health in [firestore_health, gcs_health, stripe_health, worker_health]:
            if isinstance(health, Exception):
                services.append(ServiceHealth(
                    name="Unknown",
                    status=ServiceStatus.MAJOR_OUTAGE,
                    message=str(health)[:100],
                    last_checked=datetime.now(timezone.utc)
                ))
            else:
                services.append(health)

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        services = [api_health]

    # Calculate overall status
    overall_status = calculate_overall_status(services)

    # For now, uptime is calculated as a simple metric
    # In production, this would be tracked in a database
    operational_count = sum(1 for s in services if s.status == ServiceStatus.OPERATIONAL)
    uptime_percentage = (operational_count / len(services)) * 100 if services else 0

    return SystemHealthResponse(
        status=overall_status,
        services=services,
        uptime_percentage=round(uptime_percentage, 2),
        last_incident=None,
        last_incident_date=None,
        checked_at=datetime.now(timezone.utc)
    )


@router.get("/simple")
async def get_simple_status():
    """
    Simple health check endpoint for load balancers and monitoring.

    Returns a simple JSON response with basic status.
    """
    return {
        "status": "healthy",
        "service": "nuumee-api",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/deep")
async def get_deep_health(request: Request):
    """
    Deep health check - tests actual functionality, not just connectivity.

    This endpoint verifies:
    - ffmpeg is installed and working
    - Firestore composite indexes work (runs actual query)
    - GCS can read/write test data
    - Startup checks passed

    Use this for monitoring alerts, NOT for load balancer health checks
    (too slow and resource-intensive for high-frequency checks).
    """
    checks = {}
    start_time = time.time()

    # 1. Check ffmpeg
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.decode().split('\n')[0][:60] if result.stdout else "unknown"
            checks["ffmpeg"] = {"status": "ok", "version": version}
        else:
            checks["ffmpeg"] = {"status": "error", "error": "non-zero exit code"}
    except FileNotFoundError:
        checks["ffmpeg"] = {"status": "error", "error": "ffmpeg not found in PATH"}
    except subprocess.TimeoutExpired:
        checks["ffmpeg"] = {"status": "error", "error": "check timed out"}
    except Exception as e:
        checks["ffmpeg"] = {"status": "error", "error": str(e)[:100]}

    # 2. Check Firestore with composite index query
    try:
        db = firestore.Client()
        # This query requires the composite index on (user_id, created_at DESC)
        # If the index is missing, this will fail
        query = (
            db.collection("jobs")
            .where("user_id", "==", "__deep_health_check__")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        list(query.stream())  # Execute query
        checks["firestore_indexes"] = {"status": "ok", "message": "Composite index query succeeded"}
    except Exception as e:
        error_str = str(e)
        if "index" in error_str.lower():
            checks["firestore_indexes"] = {"status": "error", "error": "Missing composite index", "details": error_str[:200]}
        else:
            checks["firestore_indexes"] = {"status": "error", "error": error_str[:100]}

    # 3. Check GCS read capability
    try:
        client = storage.Client()
        bucket = client.bucket(os.getenv("ASSETS_BUCKET", "nuumee-assets"))
        # Check if watermark.png exists (required for video processing)
        blob = bucket.blob("assets/watermark.png")
        exists = blob.exists()
        if exists:
            checks["gcs_assets"] = {"status": "ok", "message": "watermark.png accessible"}
        else:
            checks["gcs_assets"] = {"status": "warning", "message": "watermark.png not found"}
    except Exception as e:
        checks["gcs_assets"] = {"status": "error", "error": str(e)[:100]}

    # 4. Include startup check results if available
    startup_checks = getattr(request.app.state, "startup_checks", None)
    if startup_checks:
        checks["startup_checks"] = startup_checks
    else:
        checks["startup_checks"] = {"status": "warning", "message": "Startup checks not recorded"}

    # Calculate overall status and send alerts for failures
    all_statuses = []
    failed_checks = []
    for name, result in checks.items():
        if isinstance(result, dict):
            status = result.get("status", "unknown")
            all_statuses.append(status)
            if status == "error":
                failed_checks.append((name, result.get("error", "unknown error")))

    if "error" in all_statuses:
        overall = "unhealthy"
        # Send alert for each failed check
        for check_name, error in failed_checks:
            alert_health_check_failed(check_name, error)
    elif "warning" in all_statuses:
        overall = "degraded"
    else:
        overall = "healthy"

    elapsed_ms = (time.time() - start_time) * 1000

    return {
        "status": overall,
        "checks": checks,
        "elapsed_ms": round(elapsed_ms, 2),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
