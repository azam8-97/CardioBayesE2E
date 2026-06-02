from datetime import datetime, timezone
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
	load_dotenv(env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import auth as auth_routes
from app.api.v1.routes import results as results_routes
from app.api.v1.routes import dashboard as dashboard_routes
from app.api.v1.routes import research as research_routes
from app.api.v1.routes import inference as inference_routes
from app.api.v1.routes import admin as admin_routes
from app.services.job_queue import job_queue

app = FastAPI(title="CardioBayes-E2E API", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.on_event("shutdown")
def shutdown_event():
	"""Cleanup on app shutdown"""
	job_queue.shutdown()


@app.get("/api/v1/health")
def health_check() -> dict[str, str]:
	return {
		"status": "ok",
		"timestamp": datetime.now(timezone.utc).isoformat(),
	}


@app.get("/api/v1/health/inference")
def inference_health() -> dict[str, str]:
	return {
		"status": "ok",
		"service": "inference",
		"timestamp": datetime.now(timezone.utc).isoformat(),
	}


# Mount API v1 routers
app.include_router(auth_routes.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(results_routes.router, prefix="/api/v1", tags=["results"])
app.include_router(dashboard_routes.router, prefix="/api/v1", tags=["dashboard"])
app.include_router(research_routes.router, prefix="/api/v1", tags=["research"])
app.include_router(inference_routes.router, prefix="/api/v1/inference", tags=["inference"])
app.include_router(admin_routes.router, prefix="/api/v1", tags=["admin"])
