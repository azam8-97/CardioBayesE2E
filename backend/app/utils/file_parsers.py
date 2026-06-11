"""Parse .csv / .mat / .edf / .zip(wfdb) into synchronized I, II, V1 arrays."""

from __future__ import annotations

import csv
import io
import re
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pyedflib
from scipy.io import loadmat


class ParseError(Exception):
	pass


@dataclass
class ParsedECG:
	lead_i: np.ndarray
	lead_ii: np.ndarray
	lead_v1: np.ndarray
	sampling_hz: float


def _norm_name(s: str) -> str:
	return re.sub(r"[^a-z0-9]", "", s.lower())


def _find_col(headers: list[str], patterns: tuple[str, ...]) -> int | None:
	norm = [_norm_name(h) for h in headers]
	for p in patterns:
		pn = _norm_name(p)
		for i, h in enumerate(norm):
			if h == pn or pn in h or h in pn:
				return i
	return None


def parse_csv_bytes(raw: bytes) -> ParsedECG:
	text = raw.decode("utf-8-sig", errors="replace")
	reader = csv.DictReader(io.StringIO(text))
	if not reader.fieldnames:
		raise ParseError("CSV has no header row")
	fields = list(reader.fieldnames)
	rows = list(reader)
	if len(rows) < 1000:
		raise ParseError(f"CSV must have at least 1000 samples, got {len(rows)}")

	idx_i = _find_col(fields, ("lead_i", "i", "ecg_i", "lead1", "li"))
	idx_ii = _find_col(fields, ("lead_ii", "ii", "ecg_ii", "lead2", "lii"))
	idx_v1 = _find_col(fields, ("lead_v1", "v1", "ecg_v1"))
	if idx_i is None or idx_ii is None or idx_v1 is None:
		raise ParseError("CSV must include columns for leads I, II, and V1 (e.g. lead_I, lead_II, lead_V1)")

	def col(name: str) -> int:
		return fields.index(name)

	ts_col = _find_col(fields, ("timestamp_ms", "time_ms", "t_ms", "timestamp"))
	ts: list[float] = []
	li: list[float] = []
	lii: list[float] = []
	lv1: list[float] = []
	for row in rows:
		try:
			li.append(float(row[fields[idx_i]] or 0))
			lii.append(float(row[fields[idx_ii]] or 0))
			lv1.append(float(row[fields[idx_v1]] or 0))
			if ts_col is not None:
				ts.append(float(row[fields[ts_col]] or 0))
		except (TypeError, ValueError) as e:
			raise ParseError(f"Invalid numeric value in CSV: {e}") from e

	fs = 1000.0
	if len(ts) >= 2:
		from app.utils.signal_utils import infer_csv_fs

		fs = infer_csv_fs(np.array(ts, dtype=np.float64))

	return ParsedECG(
		lead_i=np.array(li, dtype=np.float64),
		lead_ii=np.array(lii, dtype=np.float64),
		lead_v1=np.array(lv1, dtype=np.float64),
		sampling_hz=fs,
	)


def parse_mat_bytes(raw: bytes) -> ParsedECG:
	import tempfile

	with tempfile.NamedTemporaryFile(suffix=".mat", delete=True) as tmp:
		tmp.write(raw)
		tmp.flush()
		mat = loadmat(tmp.name, squeeze_me=True, struct_as_record=False)

	def get_arr(*names: str) -> np.ndarray | None:
		for n in names:
			if n in mat and not str(n).startswith("__"):
				v = np.asarray(mat[n], dtype=np.float64).ravel()
				if v.size:
					return v
		return None

	li = get_arr("ecg_I", "ECG_I", "lead_I")
	lii = get_arr("ecg_II", "ECG_II", "lead_II")
	lv1 = get_arr("ecg_V1", "ECG_V1", "lead_V1")
	if li is None or lii is None or lv1 is None:
		raise ParseError("MAT must contain ecg_I, ecg_II, ecg_V1 (or equivalent) 1-D arrays")

	fs = float(np.asarray(mat.get("fs", 1000)).ravel()[0]) if "fs" in mat else 1000.0
	n = min(li.size, lii.size, lv1.size)
	if n < 1000:
		raise ParseError(f"MAT signals must be at least 1000 samples, got {n}")
	return ParsedECG(lead_i=li[:n].copy(), lead_ii=lii[:n].copy(), lead_v1=lv1[:n].copy(), sampling_hz=fs)


def parse_edf_bytes(raw: bytes) -> ParsedECG:
	import tempfile

	with tempfile.NamedTemporaryFile(suffix=".edf", delete=True) as tmp:
		tmp.write(raw)
		tmp.flush()
		try:
			f = pyedflib.EdfReader(tmp.name)
		except Exception as e:
			raise ParseError(f"Cannot read EDF: {e}") from e
		try:
			labels = [s.strip() for s in f.getSignalLabels()]
			fs_list = f.getSampleFrequencies()

			def find_signal(candidates: tuple[str, ...]) -> tuple[int, str] | None:
				for i, lab in enumerate(labels):
					ln = lab.upper().replace(" ", "")
					for c in candidates:
						if c.upper() in ln or ln == c.upper():
							return i, lab
				return None

			i1 = find_signal(("I", "ECGI", "LEAD1"))
			i2 = find_signal(("II", "ECGII", "LEAD2"))
			v1 = find_signal(("V1", "ECGV1"))
			if not i1 or not i2 or not v1:
				raise ParseError("EDF must contain channels I, II, and V1")

			def read_ch(idx: int) -> tuple[np.ndarray, float]:
				sig = f.readSignal(idx)
				return np.asarray(sig, dtype=np.float64), float(fs_list[idx])

			a1, fs1 = read_ch(i1[0])
			a2, fs2 = read_ch(i2[0])
			a3, fs3 = read_ch(v1[0])
			fs = float(min(fs1, fs2, fs3))
			n = min(a1.size, a2.size, a3.size)
			if n < int(fs):
				raise ParseError("EDF recording too short for at least 1 second of data")
			if n < 1000:
				raise ParseError(f"EDF must have at least 1000 samples after align, got {n}")
			return ParsedECG(lead_i=a1[:n].copy(), lead_ii=a2[:n].copy(), lead_v1=a3[:n].copy(), sampling_hz=fs)
		finally:
			f.close()


def parse_wfdb_zip_bytes(raw: bytes) -> ParsedECG:
	"""Parse a ZIP containing a WFDB record (.hea + .dat pair)."""
	if not zipfile.is_zipfile(io.BytesIO(raw)):
		raise ParseError("File is not a valid ZIP archive")

	with tempfile.TemporaryDirectory() as tmpdir:
		with zipfile.ZipFile(io.BytesIO(raw)) as zf:
			# Security: reject paths that escape the temp dir
			for member in zf.namelist():
				dest = Path(tmpdir) / Path(member).name
				if not str(dest.resolve()).startswith(str(Path(tmpdir).resolve())):
					raise ParseError("ZIP contains unsafe paths")
			# Extract all files flat (strip any subdirectory structure)
			for member in zf.namelist():
				data = zf.read(member)
				dest = Path(tmpdir) / Path(member).name
				dest.write_bytes(data)

		# Find the .hea file to get the record name
		hea_files = list(Path(tmpdir).glob("*.hea"))
		if not hea_files:
			raise ParseError("ZIP must contain a WFDB .hea header file alongside the .dat file")
		if len(hea_files) > 1:
			raise ParseError("ZIP contains multiple .hea files — include only one WFDB record per ZIP")

		# Check .dat file exists
		record_stem = hea_files[0].stem
		dat_file = Path(tmpdir) / f"{record_stem}.dat"
		if not dat_file.exists():
			raise ParseError(f"ZIP is missing the .dat data file for record '{record_stem}'")

		try:
			import wfdb
			record = wfdb.rdrecord(str(Path(tmpdir) / record_stem))
		except Exception as e:
			raise ParseError(f"Failed to read WFDB record: {e}") from e

		sig_names = [s.upper().replace(" ", "").replace("-", "") for s in (record.sig_name or [])]
		p_signal = record.p_signal  # shape: (samples, channels)
		if p_signal is None or p_signal.ndim != 2:
			raise ParseError("WFDB record has no readable signal data")

		def find_lead(candidates: tuple[str, ...]) -> np.ndarray | None:
			for c in candidates:
				for i, name in enumerate(sig_names):
					if c in name or name == c:
						col = p_signal[:, i].astype(np.float64)
						col = np.nan_to_num(col, nan=0.0)
						return col
			return None

		lead_i  = find_lead(("I", "ECGI",  "LEADI",  "LEAD1", "CH1"))
		lead_ii = find_lead(("II", "ECGII", "LEADII", "LEAD2", "CH2"))
		lead_v1 = find_lead(("V1", "ECGV1", "LEADV1"))

		if lead_i is None or lead_ii is None or lead_v1 is None:
			available = ", ".join(record.sig_name or [])
			raise ParseError(
				f"WFDB record must contain leads I, II, and V1. "
				f"Found channels: {available or 'none'}"
			)

		n = min(lead_i.size, lead_ii.size, lead_v1.size)
		if n < 1000:
			raise ParseError(f"WFDB signals must have at least 1000 samples, got {n}")

		fs = float(record.fs) if record.fs else 1000.0
		return ParsedECG(
			lead_i=lead_i[:n].copy(),
			lead_ii=lead_ii[:n].copy(),
			lead_v1=lead_v1[:n].copy(),
			sampling_hz=fs,
		)


def parse_ecg_bytes(raw: bytes, ext: str) -> ParsedECG:
	ext = ext.lower().lstrip(".")
	if ext == "csv":
		return parse_csv_bytes(raw)
	if ext == "mat":
		return parse_mat_bytes(raw)
	if ext == "edf":
		return parse_edf_bytes(raw)
	if ext == "zip":
		return parse_wfdb_zip_bytes(raw)
	raise ParseError(f"Unsupported format: .{ext}. Accepted: .csv, .mat, .edf, .zip (WFDB .hea+.dat pair)")
