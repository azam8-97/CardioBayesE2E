"""Export inference results to CSV or PDF."""

from __future__ import annotations

import csv
import io
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet

from app.services.supabase_service import supabase_service


def _overall_confidence(rows: list[dict]) -> str:
	if not rows:
		return "Medium"
	order = {"Low": 0, "Medium": 1, "High": 2}
	worst = 2
	for r in rows:
		lvl = (r.get("confidence_level") or "Medium").strip()
		worst = min(worst, order.get(lvl, 1))
	return {0: "Low", 1: "Medium", 2: "High"}[worst]


def build_results_csv(job_id: str) -> bytes:
	job = supabase_service.get_job(job_id)
	if not job:
		raise ValueError("Job not found")
	results = supabase_service.get_job_results(job_id)
	buf = io.StringIO()
	w = csv.writer(buf)
	w.writerow(
		[
			"channel",
			"pcc",
			"rmse",
			"mae",
			"r_squared",
			"snr_db",
			"spectral_coherence",
			"confidence_level",
			"mean_uncertainty",
			"ece",
			"picp_95",
			"mpiw",
			"nll",
			"sharpness",
		]
	)
	for r in results:
		w.writerow(
			[
				r.get("channel"),
				r.get("pcc"),
				r.get("rmse"),
				r.get("mae"),
				r.get("r_squared"),
				r.get("snr_db"),
				r.get("spectral_coherence"),
				r.get("confidence_level"),
				r.get("mean_uncertainty"),
				r.get("ece"),
				r.get("picp_95"),
				r.get("mpiw"),
				r.get("nll"),
				r.get("sharpness"),
			]
		)
	return buf.getvalue().encode("utf-8")


def build_results_pdf(job_id: str) -> bytes:
	job = supabase_service.get_job(job_id)
	if not job:
		raise ValueError("Job not found")
	results = supabase_service.get_job_results(job_id)
	buf = io.BytesIO()
	doc = SimpleDocTemplate(buf, pagesize=letter, title=f"Inference {job_id}")
	styles = getSampleStyleSheet()
	flow = [
		Paragraph(
			f"<b>CardioBayes-E2E</b> — Inference report<br/>Job: {job_id}<br/>"
			f"Architecture: {job.get('architecture', '')}<br/>"
			f"Overall confidence: {_overall_confidence(results)}",
			styles["Title"],
		),
		Spacer(1, 18),
	]
	if results:
		table_data: list[list[Any]] = [
			[
				"Channel",
				"PCC",
				"RMSE",
				"Conf",
				"Mean σ",
			]
		]
		for r in results:
			table_data.append(
				[
					str(r.get("channel", "")),
					f"{float(r.get('pcc') or 0):.4f}",
					f"{float(r.get('rmse') or 0):.4f}",
					str(r.get("confidence_level", "")),
					f"{float(r.get('mean_uncertainty') or 0):.4f}",
				]
			)
		t = Table(table_data, repeatRows=1)
		t.setStyle(
			TableStyle(
				[
					("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
					("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
					("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
					("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
					("FONTSIZE", (0, 0), (-1, -1), 9),
					("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.HexColor("#f1f5f9")]),
				]
			)
		)
		flow.append(t)
	else:
		flow.append(Paragraph("No per-channel metrics stored for this job.", styles["Normal"]))
	doc.build(flow)
	return buf.getvalue()
