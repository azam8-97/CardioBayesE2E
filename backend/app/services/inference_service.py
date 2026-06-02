"""Call HuggingFace Space inference API with retry logic and circuit breaker."""

from __future__ import annotations

import os
import time
from typing import Any

import httpx

DEFAULT_TIMEOUT_S = 90.0
MAX_RETRIES = 3
INITIAL_BACKOFF_S = 1.0  # 1 second
BACKOFF_MULTIPLIER = 2.0
COLD_START_THRESHOLD_S = 60.0  # HF cold-start usually takes 30-60 seconds

# Circuit breaker state
_CIRCUIT_BREAKER_OPEN = False
_CIRCUIT_BREAKER_FAILURE_TIME = 0.0
_CIRCUIT_BREAKER_RESET_TIMEOUT_S = 300.0  # 5 minutes
_CIRCUIT_BREAKER_FAILURE_COUNT = 0
_CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5


def _base_url() -> str:
	return (os.environ.get("HUGGINGFACE_INFERENCE_URL") or "").strip().rstrip("/")


def _service_key() -> str:
	return (os.environ.get("HUGGINGFACE_SERVICE_KEY") or "").strip()


def hf_inference_enabled() -> bool:
	return bool(_base_url() and _service_key())


def _check_circuit_breaker() -> bool:
	"""Check if circuit breaker is open. Returns True if breaker is open."""
	global _CIRCUIT_BREAKER_OPEN, _CIRCUIT_BREAKER_FAILURE_TIME, _CIRCUIT_BREAKER_FAILURE_COUNT
	
	if not _CIRCUIT_BREAKER_OPEN:
		return False
	
	# Check if we should reset the breaker (after timeout)
	elapsed = time.time() - _CIRCUIT_BREAKER_FAILURE_TIME
	if elapsed > _CIRCUIT_BREAKER_RESET_TIMEOUT_S:
		_CIRCUIT_BREAKER_OPEN = False
		_CIRCUIT_BREAKER_FAILURE_COUNT = 0
		return False
	
	return True


def _record_failure() -> None:
	"""Record a failure and potentially open the circuit breaker."""
	global _CIRCUIT_BREAKER_OPEN, _CIRCUIT_BREAKER_FAILURE_TIME, _CIRCUIT_BREAKER_FAILURE_COUNT
	
	_CIRCUIT_BREAKER_FAILURE_COUNT += 1
	if _CIRCUIT_BREAKER_FAILURE_COUNT >= _CIRCUIT_BREAKER_FAILURE_THRESHOLD:
		_CIRCUIT_BREAKER_OPEN = True
		_CIRCUIT_BREAKER_FAILURE_TIME = time.time()


def _record_success() -> None:
	"""Reset failure count on successful request."""
	global _CIRCUIT_BREAKER_FAILURE_COUNT
	_CIRCUIT_BREAKER_FAILURE_COUNT = 0


def run_hf_inference(ecg_tensor: list[list[float]], architecture: str) -> dict[str, Any]:
	"""
	POST {base}/infer with X-Service-Key.
	
	Includes:
	- Exponential backoff retry logic (up to 3 attempts)
	- Circuit breaker pattern (stops after 5 consecutive failures)
	- Cold-start detection (tells frontend if models are warming up)
	- Timeout handling (90s default)
	
	Request: {"ecg_tensor": [[...],[...],[...]], "architecture": "..."}
	Response: {"channels": {"CS12": {"mean": [...], "sigma": [...]}, ...}, "is_cold_start": false}
	Raises RuntimeError on persistent failure or invalid response.
	"""
	base = _base_url()
	key = _service_key()
	if not base or not key:
		raise RuntimeError("HuggingFace inference URL or service key not configured")

	# Check circuit breaker
	if _check_circuit_breaker():
		raise RuntimeError("CIRCUIT_BREAKER_OPEN: Inference service unavailable (too many failures)")

	url = f"{base}/infer"
	payload = {"ecg_tensor": ecg_tensor, "architecture": architecture}
	timeout = float(os.environ.get("HUGGINGFACE_INFERENCE_TIMEOUT_S", str(DEFAULT_TIMEOUT_S)))
	
	# Retry loop with exponential backoff
	last_error = None
	is_cold_start = False
	
	for attempt in range(MAX_RETRIES):
		try:
			with httpx.Client(timeout=timeout) as client:
				resp = client.post(
					url,
					json=payload,
					headers={"X-Service-Key": key, "Content-Type": "application/json"},
				)
			
			# Check for HTTP errors
			if resp.status_code >= 500:
				# Server error - might be cold-start, retry
				if attempt < MAX_RETRIES - 1:
					backoff = INITIAL_BACKOFF_S * (BACKOFF_MULTIPLIER ** attempt)
					time.sleep(backoff)
					is_cold_start = True
					continue
				detail = resp.text[:500]
				raise RuntimeError(f"Inference HTTP {resp.status_code}: {detail}")
			elif resp.status_code >= 400:
				# Client error - don't retry
				detail = resp.text[:500]
				raise RuntimeError(f"Inference HTTP {resp.status_code}: {detail}")
			
			# Parse response
			try:
				data = resp.json()
			except Exception as e:
				raise RuntimeError("Invalid JSON from inference service") from e
			
			# Extract and validate channels
			channels = data.get("channels")
			if not isinstance(channels, dict) or not channels:
				# Try top-level channel keys
				if all(isinstance(data.get(k), dict) for k in ("CS12", "CS34", "CS56")):
					channels = {k: data[k] for k in data if isinstance(data.get(k), dict) and k.startswith("CS")}
				if not channels:
					raise RuntimeError("Inference response missing 'channels' object")
			
			# Validate channel structure
			for name, ch in channels.items():
				if not isinstance(ch, dict):
					raise RuntimeError(f"Invalid channel payload: {name}")
				mean = ch.get("mean")
				if not isinstance(mean, list) or len(mean) < 16:
					raise RuntimeError(f"Channel {name} missing mean[]")
				sig = ch.get("sigma")
				if sig is not None and (not isinstance(sig, list) or len(sig) != len(mean)):
					raise RuntimeError(f"Channel {name} sigma length mismatch")
			
			# Success!
			_record_success()
			return {
				"channels": channels,
				"raw": data,
				"is_cold_start": is_cold_start,
			}
		
		except httpx.TimeoutException as e:
			last_error = RuntimeError("MODEL_TIMEOUT")
			if attempt < MAX_RETRIES - 1:
				# Might be cold-start or slow response, retry
				backoff = INITIAL_BACKOFF_S * (BACKOFF_MULTIPLIER ** attempt)
				time.sleep(backoff)
				is_cold_start = True
				continue
			_record_failure()
			raise last_error from e
		
		except httpx.RequestError as e:
			last_error = RuntimeError(f"Inference request failed: {e}")
			if attempt < MAX_RETRIES - 1:
				backoff = INITIAL_BACKOFF_S * (BACKOFF_MULTIPLIER ** attempt)
				time.sleep(backoff)
				continue
			_record_failure()
			raise last_error from e
		
		except RuntimeError as e:
			# Already a RuntimeError, don't wrap
			last_error = e
			if "timeout" in str(e).lower() or "cold" in str(e).lower():
				# Could be transient, retry
				if attempt < MAX_RETRIES - 1:
					backoff = INITIAL_BACKOFF_S * (BACKOFF_MULTIPLIER ** attempt)
					time.sleep(backoff)
					continue
			# Other errors, don't retry
			_record_failure()
			raise last_error
	
	# All retries exhausted
	_record_failure()
	raise RuntimeError(f"Inference failed after {MAX_RETRIES} attempts: {last_error}")


def get_circuit_breaker_status() -> dict[str, Any]:
	"""Get current circuit breaker status for monitoring."""
	return {
		"is_open": _check_circuit_breaker(),
		"failure_count": _CIRCUIT_BREAKER_FAILURE_COUNT,
		"failure_threshold": _CIRCUIT_BREAKER_FAILURE_THRESHOLD,
		"reset_timeout_seconds": _CIRCUIT_BREAKER_RESET_TIMEOUT_S,
	}
