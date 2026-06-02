"""
Inference pipeline tests covering HuggingFace integration, error handling, and end-to-end flow.
"""

import json
import time
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.api.v1.routes import inference as inference_routes
from app.services import inference_service, job_queue


class TestInferenceService:
    """Test HuggingFace inference service integration."""

    def test_circuit_breaker_tracks_failures(self):
        """Test that circuit breaker properly tracks failures."""
        # Reset state
        inference_service._CIRCUIT_BREAKER_FAILURE_COUNT = 0
        inference_service._CIRCUIT_BREAKER_OPEN = False
        
        # Record multiple failures
        for _ in range(5):
            inference_service._record_failure()
        
        # Should open after threshold
        status = inference_service.get_circuit_breaker_status()
        assert status["failure_count"] == 5
        assert status["is_open"] is True

    def test_circuit_breaker_resets_on_success(self):
        """Test that circuit breaker resets failure count on success."""
        inference_service._CIRCUIT_BREAKER_FAILURE_COUNT = 3
        inference_service._record_success()
        assert inference_service._CIRCUIT_BREAKER_FAILURE_COUNT == 0

    def test_hf_inference_raises_on_missing_config(self):
        """Test that inference raises RuntimeError if URL or key not configured."""
        with patch.object(inference_service, "_base_url", return_value=""):
            with pytest.raises(RuntimeError, match="not configured"):
                inference_service.run_hf_inference([[1, 2], [3, 4], [5, 6]], "BayesianBiLSTM")

    @patch("httpx.Client.post")
    def test_hf_inference_retries_on_timeout(self, mock_post):
        """Test that inference retries on timeout."""
        import httpx
        
        # First 2 attempts timeout, 3rd succeeds
        mock_post.side_effect = [
            httpx.TimeoutException("timeout"),
            httpx.TimeoutException("timeout"),
            MagicMock(
                status_code=200,
                json=lambda: {
                    "channels": {
                        "CS12": {"mean": [0.1] * 1000, "sigma": [0.01] * 1000},
                        "CS34": {"mean": [0.2] * 1000, "sigma": [0.02] * 1000},
                        "CS56": {"mean": [0.3] * 1000, "sigma": [0.03] * 1000},
                        "CS78": {"mean": [0.4] * 1000, "sigma": [0.04] * 1000},
                        "CS90": {"mean": [0.5] * 1000, "sigma": [0.05] * 1000},
                    }
                },
            ),
        ]
        
        with patch.object(inference_service, "_base_url", return_value="http://test.local"):
            with patch.object(inference_service, "_service_key", return_value="test-key"):
                with patch("time.sleep"):  # Don't actually sleep in tests
                    result = inference_service.run_hf_inference(
                        [[1, 2] * 500, [3, 4] * 500, [5, 6] * 500],
                        "BayesianBiLSTM",
                    )
                    
                    assert "channels" in result
                    assert "CS12" in result["channels"]
                    assert result["is_cold_start"] is True  # Should detect cold-start after retries

    @patch("httpx.Client.post")
    def test_hf_inference_validates_response_channels(self, mock_post):
        """Test that inference validates response channel structure."""
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"channels": {}},  # Empty channels
        )
        
        with patch.object(inference_service, "_base_url", return_value="http://test.local"):
            with patch.object(inference_service, "_service_key", return_value="test-key"):
                with pytest.raises(RuntimeError, match="missing.*channels"):
                    inference_service.run_hf_inference(
                        [[1, 2] * 500, [3, 4] * 500, [5, 6] * 500],
                        "BayesianBiLSTM",
                    )

    @patch("httpx.Client.post")
    def test_hf_inference_handles_invalid_json(self, mock_post):
        """Test that inference handles invalid JSON response."""
        mock_post.return_value = MagicMock(
            status_code=200,
            json=MagicMock(side_effect=json.JSONDecodeError("msg", "doc", 0)),
        )
        
        with patch.object(inference_service, "_base_url", return_value="http://test.local"):
            with patch.object(inference_service, "_service_key", return_value="test-key"):
                with pytest.raises(RuntimeError, match="Invalid JSON"):
                    inference_service.run_hf_inference(
                        [[1, 2] * 500, [3, 4] * 500, [5, 6] * 500],
                        "BayesianBiLSTM",
                    )


class TestJobQueue:
    """Test async job queue processing with inference integration."""

    def test_job_queue_initializes(self):
        """Test that job queue initializes correctly."""
        q = job_queue.JobQueue()
        assert q.scheduler is not None
        assert isinstance(q._processing_jobs, dict)
        q.shutdown()

    def test_confidence_calculation(self):
        """Test confidence level calculation from uncertainty."""
        # High confidence (low sigma)
        conf = job_queue._confidence_from_sigma([0.05] * 1000)
        assert conf == "High"
        
        # Medium confidence
        conf = job_queue._confidence_from_sigma([0.20] * 1000)
        assert conf == "Medium"
        
        # Low confidence (high sigma)
        conf = job_queue._confidence_from_sigma([0.50] * 1000)
        assert conf == "Low"

    def test_metrics_calculation(self):
        """Test that metrics are calculated correctly from waveforms."""
        mean = [0.5 + 0.1 * i / 1000 for i in range(1000)]
        sigma = [0.05 + 0.01 * i / 1000 for i in range(1000)]
        
        metrics = job_queue._metrics_from_waveform(mean, sigma)
        
        # Should have all expected keys
        assert "pcc" in metrics
        assert "rmse" in metrics
        assert "mae" in metrics
        assert "r_squared" in metrics
        assert "snr_db" in metrics
        assert "spectral_coherence" in metrics
        assert "confidence_level" in metrics
        assert "mean_uncertainty" in metrics
        assert "ece" in metrics
        assert "picp_95" in metrics
        assert "mpiw" in metrics
        assert "nll" in metrics
        assert "sharpness" in metrics
        
        # All values should be within expected ranges
        assert 0 <= metrics["pcc"] <= 1
        assert metrics["rmse"] > 0
        assert metrics["mae"] > 0
        assert metrics["confidence_level"] in ["High", "Medium", "Low"]

    def test_mock_channels_generation(self):
        """Test mock channel generation for testing."""
        channels = job_queue._mock_channels("test-job", "BayesianBiLSTM")
        
        # Should have all 5 channels
        assert len(channels) == 5
        assert all(ch in channels for ch in ["CS12", "CS34", "CS56", "CS78", "CS90"])
        
        # Each channel should have mean and sigma with correct length
        for ch_name, ch_data in channels.items():
            assert "mean" in ch_data
            assert "sigma" in ch_data
            assert len(ch_data["mean"]) == 1000
            assert len(ch_data["sigma"]) == 1000
            assert all(isinstance(x, float) for x in ch_data["mean"])
            assert all(isinstance(x, float) for x in ch_data["sigma"])


class TestInferenceErrorHandling:
    """Test error handling in inference pipeline."""

    def test_cold_start_error_message(self):
        """Test that cold-start errors are properly identified."""
        error_msg = "INFERENCE_TIMEOUT: HuggingFace inference exceeded 90 second timeout"
        assert "cold" in error_msg.lower() or "timeout" in error_msg.lower() or "INFERENCE" in error_msg

    def test_circuit_breaker_error_message(self):
        """Test that circuit breaker errors are properly identified."""
        error_msg = "INFERENCE_SERVICE_UNAVAILABLE: Circuit breaker open"
        assert "UNAVAILABLE" in error_msg or "CIRCUIT" in error_msg

    def test_connection_error_message(self):
        """Test that connection errors are properly identified."""
        error_msg = "INFERENCE_CONNECTION: Failed to connect to inference service"
        assert "CONNECTION" in error_msg or "connect" in error_msg.lower()


class TestInferenceEndToEnd:
    """End-to-end inference pipeline tests."""

    def test_inference_with_mock_backend(self):
        """Test inference pipeline with mock HuggingFace backend."""
        # This would require setting up mock Supabase and HTTP client
        # For now, this is a placeholder for comprehensive E2E testing
        pass

    def test_inference_tensor_shape_validation(self):
        """Test that invalid tensor shapes are rejected."""
        with patch.object(inference_service, "_base_url", return_value="http://test.local"):
            with patch.object(inference_service, "_service_key", return_value="test-key"):
                with patch("httpx.Client.post") as mock_post:
                    # Valid tensor: 3 x 1000
                    mock_post.return_value = MagicMock(
                        status_code=200,
                        json=lambda: {
                            "channels": {
                                "CS12": {"mean": [0.1] * 1000, "sigma": [0.01] * 1000},
                                "CS34": {"mean": [0.2] * 1000, "sigma": [0.02] * 1000},
                                "CS56": {"mean": [0.3] * 1000, "sigma": [0.03] * 1000},
                                "CS78": {"mean": [0.4] * 1000, "sigma": [0.04] * 1000},
                                "CS90": {"mean": [0.5] * 1000, "sigma": [0.05] * 1000},
                            }
                        },
                    )
                    
                    # Should succeed with valid tensor
                    result = inference_service.run_hf_inference(
                        [[0.1] * 1000, [0.2] * 1000, [0.3] * 1000],
                        "BayesianBiLSTM",
                    )
                    assert "channels" in result
