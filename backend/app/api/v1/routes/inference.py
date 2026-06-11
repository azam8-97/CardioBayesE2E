import json
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.security import get_optional_user
from app.services.job_queue import job_queue
from app.services.preprocessing import PreprocessError, prepare_ecg_tensor_from_path
from app.services.supabase_service import supabase_service

router = APIRouter()


def _upload_dir() -> Path:
	root = Path(__file__).resolve().parents[4]
	return Path(os.environ.get("UPLOAD_DIR", str(root / "data" / "uploads")))


def _overall_confidence_from_results(rows: list[dict]) -> str:
	if not rows:
		return "Medium"
	order = {"Low": 0, "Medium": 1, "High": 2}
	worst = 2
	for r in rows:
		lvl = (r.get("confidence_level") or "Medium").strip()
		worst = min(worst, order.get(lvl, 1))
	return {0: "Low", 1: "Medium", 2: "High"}[worst]


class UploadResponse(BaseModel):
	job_id: str


class JobStatusResponse(BaseModel):
	job_id: str
	status: str
	message: str


@router.post("/upload", response_model=UploadResponse)
async def upload(
	file: UploadFile = File(...),
	architecture: str = Form(...),
	current_user: Optional[dict] = Depends(get_optional_user),
):
	"""Upload ECG file, validate & preprocess, queue inference job."""
	filename = file.filename or "upload"
	if not any(filename.lower().endswith(ext) for ext in [".csv", ".mat", ".edf", ".zip"]):
		raise HTTPException(status_code=400, detail="INVALID_FORMAT: accepted formats are .csv, .mat, .edf, .zip (WFDB)")

	job_id = str(uuid.uuid4())
	file_ext = filename.split(".")[-1].lower()
	upload_dir = _upload_dir()
	upload_dir.mkdir(parents=True, exist_ok=True)
	raw_path = upload_dir / f"{job_id}.{file_ext}"
	tensor_path = upload_dir / f"{job_id}.tensor.json"

	try:
		content = await file.read()
		raw_path.write_bytes(content)
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}") from e

	try:
		tensor, meta = prepare_ecg_tensor_from_path(raw_path, file_ext)
	except PreprocessError as e:
		raw_path.unlink(missing_ok=True)
		raise HTTPException(status_code=400, detail=str(e)) from e

	try:
		tensor_path.write_text(json.dumps({"tensor": tensor}), encoding="utf-8")
	except Exception as e:
		raw_path.unlink(missing_ok=True)
		raise HTTPException(status_code=500, detail=f"Failed to write tensor: {e}") from e

	user_id = (current_user or {}).get("id")
	job_data = {
		"id": job_id,
		"input_file_format": file_ext,
		"input_filename": filename,
		"input_sampling_rate": meta["input_sampling_rate"],
		"input_duration_ms": meta["input_duration_ms"],
		"input_leads": meta["input_leads"],
		"input_segment_count": meta["input_segment_count"],
		"was_resampled": meta["was_resampled"],
		"architecture": architecture,
		"mc_passes": 20,
		"status": "pending",
		"session_id": None,
		"preprocessing_notes": str(tensor_path),
		"user_id": user_id,
	}

	created_job_id = supabase_service.create_inference_job(job_data)
	if not created_job_id:
		raw_path.unlink(missing_ok=True)
		tensor_path.unlink(missing_ok=True)
		raise HTTPException(status_code=500, detail="Failed to create job in database")

	job_queue.queue_inference_job(job_id, architecture)

	supabase_service.log_event(
		"inference_job_queued",
		f"Job {job_id} queued with architecture {architecture}",
		"info",
		{"job_id": job_id, "architecture": architecture, "filename": filename},
	)

	return {"job_id": job_id}


@router.get("/status/{job_id}", response_model=JobStatusResponse)
def status(job_id: str):
	try:
		job = supabase_service.get_job(job_id)
		if not job:
			raise HTTPException(status_code=404, detail="Job not found")

		status_text = job.get("status", "unknown")
		messages = {
			"pending": "Job queued, waiting to start",
			"preprocessing": "Validating and preprocessing ECG signal",
			"inferring": "Running Bayesian inference engine",
			"complete": "Inference complete, results ready",
			"failed": f"Failed: {job.get('error_message', 'Unknown error')}",
		}

		return {
			"job_id": job_id,
			"status": status_text,
			"message": messages.get(status_text, f"Status: {status_text}"),
		}
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/result/{job_id}")
def result(job_id: str):
	try:
		job = supabase_service.get_job(job_id)
		if not job:
			raise HTTPException(status_code=404, detail="Job not found")

		if job.get("status") != "complete":
			raise HTTPException(status_code=202, detail=f"Job status: {job.get('status')}")

		results = supabase_service.get_job_results(job_id)
		channels = {}
		for result in results:
			channel = result.get("channel")
			if not channel:
				continue
			waveform = supabase_service.retrieve_waveform(job_id, channel)

			channels[channel] = {
				"metrics": {
					"pcc": result.get("pcc"),
					"rmse": result.get("rmse"),
					"mae": result.get("mae"),
					"r_squared": result.get("r_squared"),
					"snr_db": result.get("snr_db"),
					"spectral_coherence": result.get("spectral_coherence"),
				},
				"uncertainty": {
					"confidence_level": result.get("confidence_level"),
					"mean_uncertainty": result.get("mean_uncertainty"),
					"ece": result.get("ece"),
					"picp_95": result.get("picp_95"),
					"mpiw": result.get("mpiw"),
					"nll": result.get("nll"),
					"sharpness": result.get("sharpness"),
				},
				"mean": waveform.get("mean") if waveform else [],
				"sigma": waveform.get("sigma") if waveform else [],
			}

		input_preview: list[list[float]] | None = None
		try:
			tp = Path((job.get("preprocessing_notes") or "").strip())
			if tp.is_file():
				raw = json.loads(tp.read_text(encoding="utf-8"))
				t = raw.get("tensor")
				if isinstance(t, list) and len(t) == 3:
					input_preview = t
		except Exception:
			input_preview = None

		return {
			"id": job_id,
			"created_at": job.get("created_at"),
			"status": job.get("status"),
			"architecture": job.get("architecture"),
			"processing_time_ms": job.get("processing_time_ms"),
			"input_metadata": {
				"format": job.get("input_file_format"),
				"duration_ms": job.get("input_duration_ms"),
				"sampling_rate": job.get("input_sampling_rate"),
				"leads": job.get("input_leads"),
				"was_resampled": job.get("was_resampled"),
			},
			"channels": channels,
			"overall_confidence": _overall_confidence_from_results(results),
			"input_ecg_preview": input_preview,
		}

	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e)) from e
