"""Simple in-memory metrics collector for error tracking."""
import time
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class Counter:
    """Thread-safe counter with timestamps."""
    value: int = 0
    first_seen: Optional[float] = None
    last_seen: Optional[float] = None
    _lock: Lock = field(default_factory=Lock, repr=False)

    def increment(self, by: int = 1) -> int:
        with self._lock:
            now = time.time()
            if self.first_seen is None:
                self.first_seen = now
            self.last_seen = now
            self.value += by
            return self.value


class MetricsCollector:
    """
    Simple in-memory metrics collector.

    Tracks:
    - Request counts by endpoint
    - Error counts by type
    - Job status counts
    - Processing times
    """

    def __init__(self):
        self._lock = Lock()
        self._counters: dict[str, Counter] = defaultdict(Counter)
        self._start_time = time.time()

    def increment(self, metric: str, by: int = 1) -> int:
        """Increment a counter metric."""
        with self._lock:
            if metric not in self._counters:
                self._counters[metric] = Counter()
        return self._counters[metric].increment(by)

    def get(self, metric: str) -> int:
        """Get current value of a counter."""
        if metric in self._counters:
            return self._counters[metric].value
        return 0

    def get_all(self) -> dict:
        """Get all metrics as a dictionary."""
        with self._lock:
            result = {}
            for name, counter in self._counters.items():
                result[name] = {
                    "value": counter.value,
                    "first_seen": datetime.fromtimestamp(counter.first_seen, tz=timezone.utc).isoformat() if counter.first_seen else None,
                    "last_seen": datetime.fromtimestamp(counter.last_seen, tz=timezone.utc).isoformat() if counter.last_seen else None,
                }
            return result

    def get_summary(self) -> dict:
        """Get a summary of key metrics."""
        uptime_seconds = time.time() - self._start_time

        # Request metrics
        total_requests = self.get("requests.total")
        error_requests = self.get("requests.errors")
        error_rate = (error_requests / total_requests * 100) if total_requests > 0 else 0

        # Job metrics
        jobs_created = self.get("jobs.created")
        jobs_completed = self.get("jobs.completed")
        jobs_failed = self.get("jobs.failed")
        job_success_rate = (jobs_completed / (jobs_completed + jobs_failed) * 100) if (jobs_completed + jobs_failed) > 0 else 100

        return {
            "uptime_seconds": round(uptime_seconds, 2),
            "uptime_human": self._format_duration(uptime_seconds),
            "requests": {
                "total": total_requests,
                "errors": error_requests,
                "error_rate_percent": round(error_rate, 2),
            },
            "jobs": {
                "created": jobs_created,
                "completed": jobs_completed,
                "failed": jobs_failed,
                "success_rate_percent": round(job_success_rate, 2),
            },
            "errors_by_type": self._get_errors_by_type(),
        }

    def _get_errors_by_type(self) -> dict:
        """Get error counts grouped by type."""
        errors = {}
        with self._lock:
            for name, counter in self._counters.items():
                if name.startswith("errors."):
                    error_type = name.replace("errors.", "")
                    errors[error_type] = counter.value
        return errors

    def _format_duration(self, seconds: float) -> str:
        """Format seconds as human-readable duration."""
        if seconds < 60:
            return f"{int(seconds)}s"
        if seconds < 3600:
            return f"{int(seconds // 60)}m {int(seconds % 60)}s"
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"

    # Convenience methods for common metrics
    def track_request(self, error: bool = False, status_code: int = 200):
        """Track an API request."""
        self.increment("requests.total")
        if error or status_code >= 400:
            self.increment("requests.errors")
            self.increment(f"requests.status_{status_code}")

    def track_job_created(self):
        """Track job creation."""
        self.increment("jobs.created")

    def track_job_completed(self):
        """Track successful job completion."""
        self.increment("jobs.completed")

    def track_job_failed(self, error_type: str = "unknown"):
        """Track job failure with error type."""
        self.increment("jobs.failed")
        self.increment(f"errors.job_{error_type}")

    def track_error(self, error_type: str):
        """Track a general error."""
        self.increment(f"errors.{error_type}")


# Global metrics instance
metrics = MetricsCollector()
