"""
Results API: re-use inference assembly, feedback, export downloads.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.api.v1.routes import inference as inference_routes
from app.services.export_service import build_results_csv, build_results_pdf
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/inference", tags=["results"])


@router.get("/results/{job_id}")
async def get_inference_results(job_id: str):
	"""Alias of GET /inference/result/{job_id} for clients expecting /results/."""
	return inference_routes.result(job_id)


@router.post("/feedback/{job_id}")
async def submit_feedback(job_id: str, body: dict):
	try:
		rating = body.get("rating")
		comment = body.get("comment") or ""
		if not isinstance(rating, int) or rating < 1 or rating > 5:
			raise ValueError("Rating must be between 1 and 5")
		job = supabase_service.get_job(job_id)
		if not job:
			raise HTTPException(status_code=404, detail="Job not found")
		ok = supabase_service.update_job_feedback(job_id, rating, str(comment))
		if not ok:
			raise HTTPException(status_code=500, detail="Failed to persist feedback")
		return {"status": "success", "rating": rating}
	except HTTPException:
		raise
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e)) from e
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Failed to submit feedback: {str(e)}") from e


@router.get("/export/{job_id}")
async def export_results(job_id: str, format: str = Query("csv", pattern="^(csv|pdf)$")):
	try:
		job = supabase_service.get_job(job_id)
		if not job:
			raise HTTPException(status_code=404, detail="Job not found")
		if job.get("status") != "complete":
			raise HTTPException(status_code=400, detail="Job not complete")

		if format == "csv":
			data = build_results_csv(job_id)
			media = "text/csv; charset=utf-8"
			filename = f"results-{job_id}.csv"
		else:
			data = build_results_pdf(job_id)
			media = "application/pdf"
			filename = f"results-{job_id}.pdf"

		return Response(
			content=data,
			media_type=media,
			headers={"Content-Disposition": f'attachment; filename="{filename}"'},
		)
	except HTTPException:
		raise
	except ValueError as e:
		raise HTTPException(status_code=404, detail=str(e)) from e
	except Exception as e:
		raise HTTPException(status_code=400, detail=f"Export failed: {str(e)}") from e
