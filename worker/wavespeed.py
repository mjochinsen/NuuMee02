"""WaveSpeed API client for video generation."""
import os
import time
import logging
from typing import Optional, Dict, Any
from enum import Enum
import httpx

logger = logging.getLogger(__name__)


class WaveSpeedError(Exception):
    """Base exception for WaveSpeed API errors."""
    pass


class WaveSpeedAuthError(WaveSpeedError):
    """Authentication error."""
    pass


class WaveSpeedAPIError(WaveSpeedError):
    """API request error."""
    def __init__(self, message: str, status_code: int = None, response: dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response


class JobStatus(str, Enum):
    """WaveSpeed job status values."""
    CREATED = "created"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class WaveSpeedClient:
    """Client for WaveSpeed API."""

    BASE_URL = "https://api.wavespeed.ai"

    # Retry configuration
    RETRY_STATUS_CODES = [429, 502, 503, 504]
    MAX_RETRIES = 3
    RETRY_DELAY = 5  # seconds

    # Polling configuration
    POLL_INTERVAL = 5  # seconds
    MAX_POLL_TIME = 600  # 10 minutes

    def __init__(self, api_key: str = None):
        """Initialize WaveSpeed client.

        Args:
            api_key: WaveSpeed API key. If not provided, reads from WAVESPEED_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("WAVESPEED_API_KEY")
        if not self.api_key:
            raise WaveSpeedAuthError("WAVESPEED_API_KEY not provided")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _request(
        self,
        method: str,
        endpoint: str,
        data: dict = None,
        timeout: float = 60.0
    ) -> dict:
        """Make HTTP request with retry logic.

        Args:
            method: HTTP method (GET, POST)
            endpoint: API endpoint path
            data: Request body for POST
            timeout: Request timeout in seconds

        Returns:
            Response JSON

        Raises:
            WaveSpeedAPIError: On API error
        """
        url = f"{self.BASE_URL}{endpoint}"

        for attempt in range(self.MAX_RETRIES):
            try:
                with httpx.Client(timeout=timeout) as client:
                    if method == "GET":
                        response = client.get(url, headers=self.headers)
                    elif method == "POST":
                        response = client.post(url, headers=self.headers, json=data)
                    else:
                        raise ValueError(f"Unsupported method: {method}")

                    # Check for auth errors
                    if response.status_code in [401, 403]:
                        raise WaveSpeedAuthError(f"Authentication failed: {response.text}")

                    # Check for retryable errors
                    if response.status_code in self.RETRY_STATUS_CODES:
                        if attempt < self.MAX_RETRIES - 1:
                            logger.warning(
                                f"Retryable error {response.status_code}, "
                                f"attempt {attempt + 1}/{self.MAX_RETRIES}"
                            )
                            time.sleep(self.RETRY_DELAY * (attempt + 1))
                            continue

                    # Check for other errors
                    if response.status_code >= 400:
                        raise WaveSpeedAPIError(
                            f"API error: {response.text}",
                            status_code=response.status_code,
                            response=response.json() if response.text else None
                        )

                    return response.json()

            except httpx.RequestError as e:
                if attempt < self.MAX_RETRIES - 1:
                    logger.warning(f"Request error, retrying: {e}")
                    time.sleep(self.RETRY_DELAY * (attempt + 1))
                    continue
                raise WaveSpeedAPIError(f"Request failed after {self.MAX_RETRIES} attempts: {e}")

        raise WaveSpeedAPIError("Max retries exceeded")

    def animate(
        self,
        image_url: str,
        video_url: str,
        resolution: str = "480p",
        seed: int = -1,
        mode: str = "animate",
        prompt: str = None
    ) -> str:
        """Start Wan 2.2 Animate job (image-to-video).

        Args:
            image_url: URL to reference image (character photo)
            video_url: URL to motion source video
            resolution: Output resolution ("480p" or "720p")
            seed: Random seed (-1 for random)
            mode: "animate" or "replace"
            prompt: Optional generation constraints

        Returns:
            Request ID for polling
        """
        endpoint = "/api/v3/wavespeed-ai/wan-2.2/animate"

        data = {
            "image": image_url,
            "video": video_url,
            "resolution": resolution,
            "seed": seed,
            "mode": mode,
        }

        if prompt:
            data["prompt"] = prompt

        logger.info(f"Starting animate job: resolution={resolution}, mode={mode}")

        response = self._request("POST", endpoint, data)
        request_id = response.get("data", {}).get("id")

        if not request_id:
            raise WaveSpeedAPIError("No request ID in response", response=response)

        logger.info(f"Animate job started: request_id={request_id}")
        return request_id

    def extend(
        self,
        video_url: str,
        prompt: str,
        duration: int = 5,
        resolution: str = "480p",
        audio_url: str = None,
        negative_prompt: str = None,
        seed: int = -1
    ) -> str:
        """Start Wan 2.5 Video Extend job.

        Args:
            video_url: URL to input video
            prompt: Description of extension
            duration: Extension duration (3-10 seconds)
            resolution: Output resolution
            audio_url: Optional audio URL
            negative_prompt: Elements to avoid
            seed: Random seed

        Returns:
            Request ID for polling
        """
        endpoint = "/api/v3/alibaba/wan-2.5/video-extend"

        data = {
            "video": video_url,
            "prompt": prompt,
            "duration": duration,
            "resolution": resolution,
            "seed": seed,
        }

        if audio_url:
            data["audio"] = audio_url
        if negative_prompt:
            data["negative_prompt"] = negative_prompt

        logger.info(f"Starting extend job: duration={duration}, resolution={resolution}")

        response = self._request("POST", endpoint, data)
        request_id = response.get("data", {}).get("id") or response.get("id")

        if not request_id:
            raise WaveSpeedAPIError("No request ID in response", response=response)

        logger.info(f"Extend job started: request_id={request_id}")
        return request_id

    def upscale(
        self,
        video_url: str,
        target_resolution: str = "1080p"
    ) -> str:
        """Start Video Upscaler Pro job.

        Args:
            video_url: URL to input video
            target_resolution: Target resolution ("720p", "1080p", "2k", "4k")

        Returns:
            Request ID for polling
        """
        endpoint = "/api/v3/wavespeed-ai/video-upscaler-pro"

        data = {
            "video": video_url,
            "target_resolution": target_resolution,
        }

        logger.info(f"Starting upscale job: target={target_resolution}")

        response = self._request("POST", endpoint, data)
        request_id = response.get("data", {}).get("id") or response.get("id")

        if not request_id:
            raise WaveSpeedAPIError("No request ID in response", response=response)

        logger.info(f"Upscale job started: request_id={request_id}")
        return request_id

    def foley(
        self,
        video_url: str,
        prompt: str = None,
        seed: int = -1
    ) -> str:
        """Start Hunyuan Video Foley job (add audio).

        Args:
            video_url: URL to input video
            prompt: Sound description
            seed: Random seed

        Returns:
            Request ID for polling
        """
        endpoint = "/api/v3/wavespeed-ai/hunyuan-video-foley"

        data = {
            "video": video_url,
            "seed": seed,
        }

        if prompt:
            data["prompt"] = prompt

        logger.info("Starting foley job")

        response = self._request("POST", endpoint, data)
        request_id = response.get("data", {}).get("id") or response.get("id")

        if not request_id:
            raise WaveSpeedAPIError("No request ID in response", response=response)

        logger.info(f"Foley job started: request_id={request_id}")
        return request_id

    def get_result(self, request_id: str) -> Dict[str, Any]:
        """Get result for a request.

        Args:
            request_id: Request ID from job creation

        Returns:
            Result dict with status, outputs, etc.
        """
        endpoint = f"/api/v3/predictions/{request_id}/result"
        return self._request("GET", endpoint)

    def poll_result(
        self,
        request_id: str,
        max_wait: int = None,
        callback: callable = None
    ) -> Dict[str, Any]:
        """Poll for job completion.

        Args:
            request_id: Request ID from job creation
            max_wait: Maximum wait time in seconds (default: MAX_POLL_TIME)
            callback: Optional callback(status, elapsed) called on each poll

        Returns:
            Final result dict with outputs

        Raises:
            WaveSpeedAPIError: If job fails or times out
        """
        max_wait = max_wait or self.MAX_POLL_TIME
        start_time = time.time()

        logger.info(f"Polling for result: request_id={request_id}, max_wait={max_wait}s")

        while True:
            elapsed = time.time() - start_time

            if elapsed > max_wait:
                raise WaveSpeedAPIError(f"Polling timeout after {max_wait}s")

            result = self.get_result(request_id)
            status = result.get("status") or result.get("data", {}).get("status")

            logger.debug(f"Poll result: status={status}, elapsed={elapsed:.1f}s")

            if callback:
                callback(status, elapsed)

            if status == JobStatus.COMPLETED.value:
                logger.info(f"Job completed after {elapsed:.1f}s")
                return result

            if status == JobStatus.FAILED.value:
                error_msg = result.get("error") or result.get("message") or "Unknown error"
                raise WaveSpeedAPIError(f"Job failed: {error_msg}", response=result)

            # Still processing, wait and poll again
            time.sleep(self.POLL_INTERVAL)

    def get_outputs(self, result: Dict[str, Any]) -> list:
        """Extract output URLs from result.

        Args:
            result: Result dict from get_result or poll_result

        Returns:
            List of output URLs
        """
        # Handle different response formats
        outputs = result.get("outputs")
        if outputs:
            return outputs

        data = result.get("data", {})
        outputs = data.get("outputs")
        if outputs:
            return outputs

        return []
