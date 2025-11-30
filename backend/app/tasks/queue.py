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

    # Build the task
    task = {
        "http_request": {
            "http_method": tasks_v2.HttpMethod.POST,
            "url": WORKER_URL,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload).encode(),
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
