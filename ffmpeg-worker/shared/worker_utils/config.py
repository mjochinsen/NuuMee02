"""Shared configuration constants for NuuMee workers."""

import os

# GCP Project
PROJECT_ID = os.environ.get("GCP_PROJECT", "wanapi-prod")

# GCS Buckets
IMAGE_BUCKET = os.environ.get("IMAGE_BUCKET", "nuumee-images")
VIDEO_BUCKET = os.environ.get("VIDEO_BUCKET", "nuumee-videos")
OUTPUT_BUCKET = os.environ.get("OUTPUT_BUCKET", "nuumee-outputs")
ASSETS_BUCKET = os.environ.get("ASSETS_BUCKET", "nuumee-assets")

# Credit package configuration (must match backend/app/credits/router.py)
CREDIT_PACKAGES = {
    "starter": {"id": "starter", "name": "Starter", "price_cents": 1000, "credits": 120},
    "popular": {"id": "popular", "name": "Popular", "price_cents": 3000, "credits": 400},
    "pro": {"id": "pro", "name": "Pro", "price_cents": 7500, "credits": 1100},
    "mega": {"id": "mega", "name": "Mega", "price_cents": 15000, "credits": 2500},
}

# Service account email defaults per worker type
SERVICE_ACCOUNT_DEFAULTS = {
    "worker": "nuumee-worker@wanapi-prod.iam.gserviceaccount.com",
    "ffmpeg-worker": "nuumee-ffmpeg-worker@wanapi-prod.iam.gserviceaccount.com",
    "default": "nuumee-worker@wanapi-prod.iam.gserviceaccount.com",
}
