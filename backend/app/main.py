"""NuuMee API - FastAPI Backend."""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

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

app = FastAPI(
    title="NuuMee API",
    version="1.0.0",
    description="AI-powered video character replacement API"
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


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nuumee-api"}
