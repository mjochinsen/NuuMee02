"""Unit tests for WaveSpeed API client."""
import pytest
from unittest.mock import MagicMock, patch
import httpx

import sys
sys.path.insert(0, '/home/user/NuuMee02/worker')

from wavespeed import (
    WaveSpeedClient,
    WaveSpeedError,
    WaveSpeedAuthError,
    WaveSpeedAPIError,
    JobStatus,
)


class TestWaveSpeedClientInit:
    """Tests for WaveSpeedClient initialization."""

    def test_init_with_api_key(self):
        """Should initialize with provided API key."""
        client = WaveSpeedClient(api_key="test_key_123")
        assert client.api_key == "test_key_123"

    def test_init_from_env(self, monkeypatch):
        """Should read API key from environment."""
        monkeypatch.setenv("WAVESPEED_API_KEY", "env_key_456")
        client = WaveSpeedClient()
        assert client.api_key == "env_key_456"

    def test_init_without_key_raises(self, monkeypatch):
        """Should raise WaveSpeedAuthError when no API key available."""
        monkeypatch.delenv("WAVESPEED_API_KEY", raising=False)
        with pytest.raises(WaveSpeedAuthError, match="not provided"):
            WaveSpeedClient()

    def test_headers_set_correctly(self):
        """Should set authorization header."""
        client = WaveSpeedClient(api_key="test_key")
        assert client.headers["Authorization"] == "Bearer test_key"
        assert client.headers["Content-Type"] == "application/json"


class TestWaveSpeedAnimate:
    """Tests for animate endpoint."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    @patch.object(WaveSpeedClient, '_request')
    def test_animate_basic(self, mock_request, client):
        """Should call animate endpoint with correct params."""
        mock_request.return_value = {"data": {"id": "req_123"}}

        request_id = client.animate(
            image_url="https://example.com/image.jpg",
            video_url="https://example.com/video.mp4",
        )

        assert request_id == "req_123"
        mock_request.assert_called_once()
        call_args = mock_request.call_args
        assert call_args[0][0] == "POST"
        assert "animate" in call_args[0][1]

    @patch.object(WaveSpeedClient, '_request')
    def test_animate_with_all_params(self, mock_request, client):
        """Should include all optional params."""
        mock_request.return_value = {"data": {"id": "req_456"}}

        client.animate(
            image_url="https://example.com/image.jpg",
            video_url="https://example.com/video.mp4",
            resolution="720p",
            seed=42,
            mode="replace",
            prompt="test prompt"
        )

        call_data = mock_request.call_args[0][2]
        assert call_data["resolution"] == "720p"
        assert call_data["seed"] == 42
        assert call_data["mode"] == "replace"
        assert call_data["prompt"] == "test prompt"

    @patch.object(WaveSpeedClient, '_request')
    def test_animate_no_request_id_raises(self, mock_request, client):
        """Should raise when no request ID in response."""
        mock_request.return_value = {"data": {}}

        with pytest.raises(WaveSpeedAPIError, match="No request ID"):
            client.animate(
                image_url="https://example.com/image.jpg",
                video_url="https://example.com/video.mp4",
            )


class TestWaveSpeedExtend:
    """Tests for extend endpoint."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    @patch.object(WaveSpeedClient, '_request')
    def test_extend_basic(self, mock_request, client):
        """Should call extend endpoint."""
        mock_request.return_value = {"data": {"id": "req_ext_123"}}

        request_id = client.extend(
            video_url="https://example.com/video.mp4",
            prompt="extend the video",
        )

        assert request_id == "req_ext_123"
        call_args = mock_request.call_args
        assert "video-extend" in call_args[0][1]

    @patch.object(WaveSpeedClient, '_request')
    def test_extend_with_options(self, mock_request, client):
        """Should include duration and resolution."""
        mock_request.return_value = {"data": {"id": "req_789"}}

        client.extend(
            video_url="https://example.com/video.mp4",
            prompt="extend",
            duration=7,
            resolution="720p",
        )

        call_data = mock_request.call_args[0][2]
        assert call_data["duration"] == 7
        assert call_data["resolution"] == "720p"


class TestWaveSpeedUpscale:
    """Tests for upscale endpoint."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    @patch.object(WaveSpeedClient, '_request')
    def test_upscale_basic(self, mock_request, client):
        """Should call upscale endpoint."""
        mock_request.return_value = {"data": {"id": "req_ups_123"}}

        request_id = client.upscale(video_url="https://example.com/video.mp4")

        assert request_id == "req_ups_123"
        call_args = mock_request.call_args
        assert "upscaler" in call_args[0][1]

    @patch.object(WaveSpeedClient, '_request')
    def test_upscale_with_target(self, mock_request, client):
        """Should specify target resolution."""
        mock_request.return_value = {"data": {"id": "req_456"}}

        client.upscale(
            video_url="https://example.com/video.mp4",
            target_resolution="4k"
        )

        call_data = mock_request.call_args[0][2]
        assert call_data["target_resolution"] == "4k"


class TestWaveSpeedFoley:
    """Tests for foley (audio) endpoint."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    @patch.object(WaveSpeedClient, '_request')
    def test_foley_basic(self, mock_request, client):
        """Should call foley endpoint."""
        mock_request.return_value = {"data": {"id": "req_fol_123"}}

        request_id = client.foley(video_url="https://example.com/video.mp4")

        assert request_id == "req_fol_123"
        call_args = mock_request.call_args
        assert "foley" in call_args[0][1]

    @patch.object(WaveSpeedClient, '_request')
    def test_foley_with_prompt(self, mock_request, client):
        """Should include prompt when provided."""
        mock_request.return_value = {"data": {"id": "req_789"}}

        client.foley(
            video_url="https://example.com/video.mp4",
            prompt="footsteps and rain"
        )

        call_data = mock_request.call_args[0][2]
        assert call_data["prompt"] == "footsteps and rain"


class TestWaveSpeedPolling:
    """Tests for result polling."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    @patch.object(WaveSpeedClient, 'get_result')
    def test_poll_completed(self, mock_get, client):
        """Should return result when completed."""
        mock_get.return_value = {
            "status": "completed",
            "outputs": ["https://example.com/output.mp4"]
        }

        result = client.poll_result("req_123", max_wait=10)

        assert result["status"] == "completed"
        mock_get.assert_called_once_with("req_123")

    @patch.object(WaveSpeedClient, 'get_result')
    def test_poll_failed_raises(self, mock_get, client):
        """Should raise when job fails."""
        mock_get.return_value = {
            "status": "failed",
            "error": "Processing error"
        }

        with pytest.raises(WaveSpeedAPIError, match="Job failed"):
            client.poll_result("req_123", max_wait=10)

    @patch('time.sleep')
    @patch.object(WaveSpeedClient, 'get_result')
    def test_poll_timeout(self, mock_get, mock_sleep, client):
        """Should raise on timeout."""
        mock_get.return_value = {"status": "processing"}

        with pytest.raises(WaveSpeedAPIError, match="timeout"):
            client.poll_result("req_123", max_wait=1)

    @patch('time.sleep')
    @patch.object(WaveSpeedClient, 'get_result')
    def test_poll_with_callback(self, mock_get, mock_sleep, client):
        """Should call callback on each poll."""
        mock_get.side_effect = [
            {"status": "processing"},
            {"status": "completed", "outputs": ["test"]}
        ]

        callback = MagicMock()
        client.poll_result("req_123", max_wait=60, callback=callback)

        assert callback.call_count == 2


class TestWaveSpeedGetOutputs:
    """Tests for output extraction."""

    @pytest.fixture
    def client(self):
        return WaveSpeedClient(api_key="test_key")

    def test_get_outputs_direct(self, client):
        """Should extract outputs from top level."""
        result = {"outputs": ["url1", "url2"]}
        outputs = client.get_outputs(result)
        assert outputs == ["url1", "url2"]

    def test_get_outputs_nested(self, client):
        """Should extract outputs from data field."""
        result = {"data": {"outputs": ["url3"]}}
        outputs = client.get_outputs(result)
        assert outputs == ["url3"]

    def test_get_outputs_empty(self, client):
        """Should return empty list when no outputs."""
        result = {"status": "completed"}
        outputs = client.get_outputs(result)
        assert outputs == []


class TestJobStatus:
    """Tests for JobStatus enum."""

    def test_status_values(self):
        """Should have expected status values."""
        assert JobStatus.CREATED.value == "created"
        assert JobStatus.PROCESSING.value == "processing"
        assert JobStatus.COMPLETED.value == "completed"
        assert JobStatus.FAILED.value == "failed"
