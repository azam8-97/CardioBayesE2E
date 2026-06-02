"""ECG preprocessing: parse → resample 1000 Hz → normalize → 3×1000 window for HF."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from app.utils.file_parsers import ParseError, parse_ecg_bytes
from app.utils.signal_utils import WINDOW_SAMPLES, first_window, resample_leads, zscore_per_lead


class PreprocessError(Exception):
	pass


def prepare_ecg_tensor_from_path(path: Path, file_format: str) -> tuple[list[list[float]], dict]:
	"""
	Returns ecg_tensor as 3 lists of WINDOW_SAMPLES floats (row-major leads),
	and metadata for inference_jobs.
	"""
	if not path.is_file():
		raise PreprocessError(f"Upload file not found: {path}")
	raw = path.read_bytes()
	try:
		parsed = parse_ecg_bytes(raw, file_format)
	except ParseError as e:
		raise PreprocessError(str(e)) from e

	leads = np.stack([parsed.lead_i, parsed.lead_ii, parsed.lead_v1], axis=0)
	try:
		rs, was_resampled = resample_leads(leads, float(parsed.sampling_hz))
	except Exception as e:
		raise PreprocessError(f"RESAMPLE_FAILED: {e}") from e

	norm = zscore_per_lead(rs)
	win = first_window(norm, WINDOW_SAMPLES)
	tensor = win.tolist()

	duration_ms = 1000.0 * (leads.shape[1] / max(parsed.sampling_hz, 1e-6))
	meta = {
		"input_sampling_rate": int(round(float(parsed.sampling_hz))),
		"input_duration_ms": float(duration_ms),
		"input_leads": ["I", "II", "V1"],
		"input_segment_count": 1,
		"was_resampled": bool(was_resampled),
		"preprocessing_notes": None,
	}
	return tensor, meta
