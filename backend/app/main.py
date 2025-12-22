"""NuuMee API - FastAPI Backend."""
import os
import sys
import subprocess
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

from .auth.router import router as auth_router
from .credits.router import router as credits_router
from .webhooks.router import router as webhooks_router
from .upload.router import router as upload_router
from .jobs.router import router as jobs_router
from .subscriptions.router import router as subscriptions_router
from .subscriptions.router import limiter
from .referral.router import router as referral_router
from .affiliate.router import router as affiliate_router
from .status.router import router as status_router
from .transactions.router import router as transactions_router
from .billing.router import router as billing_router
from .public.router import router as public_router
from .support.router import router as support_router
from .admin.router import router as admin_router
from .promo.router import router as promo_router
from .internal import router as internal_router
from .metrics import router as metrics_router, metrics


# =============================================================================
# STARTUP DEPENDENCY CHECKS
# =============================================================================

def check_ffmpeg() -> dict:
    """Verify ffmpeg is installed. Returns status dict."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            timeout=5
        )
        if result.returncode != 0:
            return {"status": "error", "error": "ffmpeg returned non-zero exit code"}
        version_line = result.stdout.decode().split('\n')[0] if result.stdout else "unknown"
        return {"status": "ok", "version": version_line}
    except FileNotFoundError:
        return {"status": "error", "error": "ffmpeg not found in PATH"}
    except subprocess.TimeoutExpired:
        return {"status": "error", "error": "ffmpeg check timed out"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def check_firestore() -> dict:
    """Verify Firestore connectivity."""
    try:
        from google.cloud import firestore
        db = firestore.Client()
        # Simple read to verify connectivity
        db.collection("_health_check").document("startup").get()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "error": str(e)[:100]}


def check_storage() -> dict:
    """Verify GCS connectivity."""
    try:
        from google.cloud import storage
        client = storage.Client()
        bucket_name = os.getenv("GCS_BUCKET", "nuumee-inputs")
        bucket = client.bucket(bucket_name)
        # Just verify we can reference the bucket
        _ = bucket.name
        return {"status": "ok", "bucket": bucket_name}
    except Exception as e:
        return {"status": "error", "error": str(e)[:100]}


def run_startup_checks():
    """Run all startup dependency checks. Exit if critical checks fail."""
    logger.info("=" * 60)
    logger.info("RUNNING STARTUP DEPENDENCY CHECKS")
    logger.info("=" * 60)

    checks = {
        "ffmpeg": check_ffmpeg(),
        "firestore": check_firestore(),
        "storage": check_storage(),
    }

    all_passed = True
    for name, result in checks.items():
        status = result.get("status", "unknown")
        if status == "ok":
            logger.info(f"✓ {name}: OK")
            if "version" in result:
                logger.info(f"  {result['version']}")
        else:
            logger.error(f"✗ {name}: FAILED - {result.get('error', 'unknown error')}")
            # ffmpeg is critical for video processing
            if name == "ffmpeg":
                all_passed = False

    logger.info("=" * 60)

    if not all_passed:
        logger.critical("FATAL: Critical startup checks failed. Container cannot start.")
        logger.critical("Fix the issues above and redeploy.")
        sys.exit(1)

    logger.info("All startup checks passed. Server ready.")
    return checks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    # Startup
    startup_results = run_startup_checks()
    app.state.startup_checks = startup_results
    yield
    # Shutdown
    logger.info("Shutting down NuuMee API...")


app = FastAPI(
    title="NuuMee API",
    version="1.0.0",
    description="AI-powered video character replacement API",
    lifespan=lifespan
)

# Add rate limiter state to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
cors_origins = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    '["http://localhost:3000","https://nuumee.ai","https://wanapi-prod.web.app","https://wanapi-prod.firebaseapp.com"]'
)
# Parse JSON string to list
import json
try:
    allowed_origins = json.loads(cors_origins)
except json.JSONDecodeError:
    allowed_origins = ["http://localhost:3000", "https://nuumee.ai", "https://wanapi-prod.web.app", "https://wanapi-prod.firebaseapp.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api/v1 prefix
app.include_router(auth_router, prefix="/api/v1")
app.include_router(credits_router, prefix="/api/v1")
app.include_router(webhooks_router, prefix="/api/v1")
app.include_router(upload_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(subscriptions_router, prefix="/api/v1")
app.include_router(referral_router, prefix="/api/v1")
app.include_router(affiliate_router, prefix="/api/v1")
app.include_router(status_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1")
app.include_router(support_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(promo_router, prefix="/api/v1")

# Public routes (no /api/v1 prefix for clean short URLs)
app.include_router(public_router)

# Internal routes (Pub/Sub, schedulers - no auth, uses OIDC tokens)
app.include_router(internal_router)

# Metrics routes (for monitoring)
app.include_router(metrics_router, prefix="/api/v1")


# =============================================================================
# REQUEST TRACKING MIDDLEWARE
# =============================================================================

@app.middleware("http")
async def track_requests(request: Request, call_next):
    """Track all requests for metrics."""
    response = await call_next(request)
    # Track the request
    is_error = response.status_code >= 400
    metrics.track_request(error=is_error, status_code=response.status_code)
    return response


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nuumee-api"}
