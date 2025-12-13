"""Cloud Tasks queue management for video processing jobs."""
import os
import json
import logging
from typing import Optional

from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Configuration
PROJECT_ID = os.environ.get("GCP_PROJECT", "wanapi-prod")
LOCATION = os.environ.get("TASKS_LOCATION", "us-central1")
QUEUE_NAME = os.environ.get("TASKS_QUEUE", "nuumee-video-processing")
WORKER_URL = os.environ.get(
    "WORKER_URL",
    "https://nuumee-worker-450296399943.us-central1.run.app"
)

# FFmpeg Worker Configuration (for subtitles/watermark post-processing)
FFMPEG_LOCATION = os.environ.get("FFMPEG_TASKS_LOCATION", "us-central1")
FFMPEG_QUEUE_NAME = os.environ.get("FFMPEG_TASKS_QUEUE", "nuumee-ffmpeg-jobs")
FFMPEG_WORKER_URL = os.environ.get(
    "FFMPEG_WORKER_URL",
    "https://nuumee-ffmpeg-worker-450296399943.us-central1.run.app"
)

# Tasks client (lazy initialization)
_tasks_client: Optional[tasks_v2.CloudTasksClient] = None


def get_tasks_client() -> tasks_v2.CloudTasksClient:
    """Get Cloud Tasks client (lazy initialization)."""
    global _tasks_client
    if _tasks_client is None:
        _tasks_client = tasks_v2.CloudTasksClient()
    return _tasks_client


def enqueue_job(job_id: str, delay_seconds: int = 0) -> str:
    """Enqueue a video processing job.

    Args:
        job_id: Job document ID
        delay_seconds: Optional delay before task execution

    Returns:
        Task name (full path)
    """
    client = get_tasks_client()

    # Construct the queue path
    queue_path = client.queue_path(PROJECT_ID, LOCATION, QUEUE_NAME)

    # Build the task payload
    payload = {"job_id": job_id}

    # Service account for OIDC authentication to Cloud Run
    service_account_email = os.environ.get(
        "TASKS_SERVICE_ACCOUNT",
        f"nuumee-api@{PROJECT_ID}.iam.gserviceaccount.com"
    )

    # Build the task with OIDC token for authenticated Cloud Run
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": WORKER_URL,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload).encode(),
            "oidc_token": {
                "service_account_email": service_account_email,
                "audience": WORKER_URL,
            },
        }
    }

    # Add schedule time if delay specified
    if delay_seconds > 0:
        schedule_time = datetime.utcnow() + timedelta(seconds=delay_seconds)
        timestamp = timestamp_pb2.Timestamp()
        timestamp.FromDatetime(schedule_time)
        task["schedule_time"] = timestamp

    # Create the task
    response = client.create_task(request={"parent": queue_path, "task": task})

    logger.info(f"Created task for job {job_id}: {response.name}")
    return response.name


def get_queue_stats() -> dict:
    """Get queue statistics.

    Returns:
        Dict with queue stats
    """
    client = get_tasks_client()
    queue_path = client.queue_path(PROJECT_ID, LOCATION, QUEUE_NAME)

    try:
        queue = client.get_queue(request={"name": queue_path})
        return {
            "name": queue.name,
            "state": queue.state.name,
            "rate_limits": {
                "max_dispatches_per_second": queue.rate_limits.max_dispatches_per_second,
                "max_concurrent_dispatches": queue.rate_limits.max_concurrent_dispatches,
            },
            "retry_config": {
                "max_attempts": queue.retry_config.max_attempts,
            }
        }
    except Exception as e:
        logger.error(f"Failed to get queue stats: {e}")
        return {"error": str(e)}


def enqueue_ffmpeg_job(
    job_id: str,
    job_type: str,
    input_video_path: str,
    output_path: str,
    options: dict = None,
    delay_seconds: int = 0
) -> str:
    """Enqueue an FFmpeg post-processing job (subtitles/watermark).

    Args:
        job_id: Job document ID (for status updates)
        job_type: Type of FFmpeg job ("subtitles" or "watermark")
        input_video_path: GCS path to input video
        output_path: GCS path for output video
        options: Job-specific options (e.g., subtitle_style for subtitles)
        delay_seconds: Optional delay before task execution

    Returns:
        Task name (full path)
    """
    client = get_tasks_client()

    # Construct the queue path for FFmpeg queue
    queue_path = client.queue_path(PROJECT_ID, FFMPEG_LOCATION, FFMPEG_QUEUE_NAME)

    # Build the task payload
    payload = {
        "job_id": job_id,
        "job_type": job_type,
        "input_video_path": input_video_path,
        "output_path": output_path,
        "options": options or {}
    }

    # Service account for OIDC authentication to Cloud Run
    # Use the nuumee-api service account which has invoker permission on FFmpeg worker
    service_account_email = os.environ.get(
        "TASKS_SERVICE_ACCOUNT",
        f"nuumee-api@{PROJECT_ID}.iam.gserviceaccount.com"
    )

    # Build the task with OIDC token for authenticated Cloud Run
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": FFMPEG_WORKER_URL,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload).encode(),
            "oidc_token": {
                "service_account_email": service_account_email,
                "audience": FFMPEG_WORKER_URL,
            },
        }
    }

    # Add schedule time if delay specified
    if delay_seconds > 0:
        schedule_time = datetime.utcnow() + timedelta(seconds=delay_seconds)
        timestamp = timestamp_pb2.Timestamp()
        timestamp.FromDatetime(schedule_time)
        task["schedule_time"] = timestamp

    # Create the task
    response = client.create_task(request={"parent": queue_path, "task": task})

    logger.info(f"Created FFmpeg task for job {job_id} ({job_type}): {response.name}")
    return response.name


def get_ffmpeg_queue_stats() -> dict:
    """Get FFmpeg queue statistics.

    Returns:
        Dict with queue stats
    """
    client = get_tasks_client()
    queue_path = client.queue_path(PROJECT_ID, FFMPEG_LOCATION, FFMPEG_QUEUE_NAME)

    try:
        queue = client.get_queue(request={"name": queue_path})
        return {
            "name": queue.name,
            "state": queue.state.name,
            "rate_limits": {
                "max_dispatches_per_second": queue.rate_limits.max_dispatches_per_second,
                "max_concurrent_dispatches": queue.rate_limits.max_concurrent_dispatches,
            },
            "retry_config": {
                "max_attempts": queue.retry_config.max_attempts,
            }
        }
    except Exception as e:
        logger.error(f"Failed to get FFmpeg queue stats: {e}")
        return {"error": str(e)}
