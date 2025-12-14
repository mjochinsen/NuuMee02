"""Credit calculation for job pricing."""

from ..models import JobType, Resolution

# Credit costs per resolution (based on WaveSpeed pricing + NuuMee margin)
# WaveSpeed: 480p=$0.04/sec, 720p=$0.08/sec
# NuuMee: 1 credit = $0.10, so we charge ~2x WaveSpeed cost
ANIMATE_CREDIT_RATES = {
    Resolution.RES_480P: 0.8,  # credits per second
    Resolution.RES_720P: 1.6,  # credits per second
}

# Extender: FIXED cost per resolution (not per-second!)
# See docs/PRICING_STRATEGY.md for rationale
EXTEND_FIXED_CREDITS = {
    Resolution.RES_480P: 5.0,   # Fixed 5 credits for 480p extend
    Resolution.RES_720P: 10.0,  # Fixed 10 credits for 720p extend
}

# Upscaler: 100% of base credits (calculated from source video)
UPSCALE_MULTIPLIER = 1.0

# Foley: flat rate
FOLEY_FIXED_CREDITS = 5.0

# Minimum charge in credits
MIN_CREDITS = 5.0

# Default estimated duration for cost calculation
DEFAULT_DURATION_SECONDS = 10


def calculate_credits(
    job_type: JobType,
    resolution: Resolution,
    duration_seconds: int = DEFAULT_DURATION_SECONDS,
    source_base_credits: float = None
) -> float:
    """Calculate credit cost for a job.

    Args:
        job_type: Type of job (ANIMATE, EXTEND, UPSCALE, FOLEY)
        resolution: Output resolution
        duration_seconds: Video duration (used for ANIMATE only)
        source_base_credits: Base credits of source video (used for UPSCALE only)

    Returns:
        Credit cost for the job
    """
    # EXTEND: Fixed cost based on resolution (not per-second!)
    if job_type == JobType.EXTEND:
        return EXTEND_FIXED_CREDITS.get(resolution, 5.0)

    # UPSCALE: 100% of source video's base credits
    if job_type == JobType.UPSCALE:
        if source_base_credits is not None:
            return max(source_base_credits * UPSCALE_MULTIPLIER, MIN_CREDITS)
        return MIN_CREDITS

    # FOLEY: Flat rate
    if job_type == JobType.FOLEY:
        return FOLEY_FIXED_CREDITS

    # ANIMATE: Per-second rate
    rate = ANIMATE_CREDIT_RATES.get(resolution, 0.8)
    cost = rate * duration_seconds
    return max(cost, MIN_CREDITS)
