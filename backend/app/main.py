"""NuuMee API - FastAPI Backend."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .credits.router import router as credits_router
from .webhooks.router import router as webhooks_router

app = FastAPI(
    title="NuuMee API",
    version="1.0.0",
    description="AI-powered video character replacement API"
)

# CORS configuration
cors_origins = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    '["http://localhost:3000","https://nuumee.ai"]'
)
# Parse JSON string to list
import json
try:
    allowed_origins = json.loads(cors_origins)
except json.JSONDecodeError:
    allowed_origins = ["http://localhost:3000", "https://nuumee.ai"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(credits_router)
app.include_router(webhooks_router)


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nuumee-api"}
