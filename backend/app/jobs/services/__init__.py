"""Job services for credit calculation, validation, and GCS operations."""

from .credits import (
    calculate_credits,
    ANIMATE_CREDIT_RATES,
    EXTEND_FIXED_CREDITS,
    UPSCALE_MULTIPLIER,
    FOLEY_FIXED_CREDITS,
    MIN_CREDITS,
    DEFAULT_DURATION_SECONDS,
)
from .validation import (
    generate_job_id,
    generate_short_id,
    validate_gcs_path_ownership,
    validate_source_job,
    is_demo_job,
    DEMO_IMAGE_PATH,
    DEMO_VIDEO_PATH,
    DEMO_OUTPUT_PATH,
    DEMO_IMAGE_URI,
    DEMO_VIDEO_URI,
)
from .gcs import generate_signed_download_url

__all__ = [
    # Credits
    "calculate_credits",
    "ANIMATE_CREDIT_RATES",
    "EXTEND_FIXED_CREDITS",
    "UPSCALE_MULTIPLIER",
    "FOLEY_FIXED_CREDITS",
    "MIN_CREDITS",
    "DEFAULT_DURATION_SECONDS",
    # Validation
    "generate_job_id",
    "generate_short_id",
    "validate_gcs_path_ownership",
    "validate_source_job",
    "is_demo_job",
    "DEMO_IMAGE_PATH",
    "DEMO_VIDEO_PATH",
    "DEMO_OUTPUT_PATH",
    "DEMO_IMAGE_URI",
    "DEMO_VIDEO_URI",
    # GCS
    "generate_signed_download_url",
]
