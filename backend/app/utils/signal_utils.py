"""Resampling and windowing for 3-lead ECG (I, II, V1)."""

from __future__ import annotations

import numpy as np
from scipy import signal as scipy_signal

TARGET_FS = 1000
WINDOW_SAMPLES = 1000


def resample_leads(leads_3xn: np.ndarray, orig_fs: float) -> tuple[np.ndarray, bool]:
	"""
	Resample each lead to TARGET_FS Hz.
	leads_3xn: shape (3, n_samples)
	"""
	if orig_fs <= 0:
		orig_fs = float(TARGET_FS)
	n = int(leads_3xn.shape[1])
	if n == 0:
		raise ValueError("Empty signal")
	new_n = max(1, int(round(n * TARGET_FS / orig_fs)))
	out = np.stack([scipy_signal.resample(leads_3xn[i].astype(np.float64), new_n) for i in range(3)], axis=0)
	was = abs(orig_fs - TARGET_FS) > 1e-3
	return out, was


def zscore_per_lead(leads: np.ndarray) -> np.ndarray:
	out = np.zeros_like(leads, dtype=np.float64)
	for i in range(3):
		ch = leads[i].astype(np.float64)
		std = float(np.std(ch))
		out[i] = (ch - float(np.mean(ch))) / (std if std > 1e-9 else 1.0)
	return out


def first_window(leads: np.ndarray, length: int = WINDOW_SAMPLES) -> np.ndarray:
	"""Pad or truncate to (3, length)."""
	c = leads.shape[0]
	if c != 3:
		raise ValueError("Expected 3 leads")
	n = int(leads.shape[1])
	if n >= length:
		return np.ascontiguousarray(leads[:, :length], dtype=np.float64)
	w = np.zeros((3, length), dtype=np.float64)
	w[:, :n] = leads[:, :n]
	return w


def infer_csv_fs(timestamps: np.ndarray | None) -> float:
	"""Infer Hz from timestamp_ms column; default 1000."""
	if timestamps is None or len(timestamps) < 2:
		return float(TARGET_FS)
	dt = np.diff(timestamps.astype(np.float64))
	dt = dt[dt > 0]
	if len(dt) == 0:
		return float(TARGET_FS)
	median_ms = float(np.median(dt))
	if median_ms <= 0:
		return float(TARGET_FS)
	return 1000.0 / median_ms
