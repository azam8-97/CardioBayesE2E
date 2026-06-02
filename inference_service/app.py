"""
HuggingFace Spaces Inference Service for CardioBayes-E2E.

This FastAPI application runs as a separate service on HuggingFace Spaces.
It loads all 6 Bayesian models at startup and exposes a /infer endpoint
for Bayesian inference with MC-Dropout uncertainty quantification.

Deployment:
- Type: FastAPI Space
- Hardware: CPU (16GB RAM)
- Service Key: Shared secret for authentication
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

import numpy as np
import torch
from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel

# ============================================================================
# Configuration
# ============================================================================

SERVICE_KEY = os.environ.get("HF_SERVICE_KEY", "")
MODEL_DIR = Path(__file__).parent / "models"
MC_PASSES = 20  # Number of Monte Carlo dropout passes for uncertainty estimation
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
STARTUP_TIME = time.time()  # Track when service started (for cold-start detection)

# Channel order (output leads for EGM reconstruction)
CHANNEL_ORDER = ["CS12", "CS34", "CS56", "CS78", "CS90"]

# ============================================================================
# Models - Placeholder Architectures
# ============================================================================
# In production, these would be the actual Bayesian architectures.
# For now, we define simple placeholder classes that:
# - Accept 3D input (batch_size, channels=3, length=1000)
# - Return 5D output (batch_size, output_channels=5, length=1000)
# - Support MC-Dropout via train() mode during inference


class BayesianBiLSTM(torch.nn.Module):
    """Bidirectional LSTM with dropout for Bayesian inference."""
    def __init__(self, input_size=3, hidden_size=64, num_layers=2, dropout=0.3, output_size=5):
        super().__init__()
        self.lstm = torch.nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout)
        self.fc = torch.nn.Linear(hidden_size, output_size)
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, x):
        # x: (batch, channels, length) -> (batch, length, channels)
        x = x.transpose(1, 2)
        lstm_out, _ = self.lstm(x)
        lstm_out = self.dropout(lstm_out)
        out = self.fc(lstm_out)
        # (batch, length, output_size) -> (batch, output_size, length)
        return out.transpose(1, 2)


class BayesianTransformer(torch.nn.Module):
    """Transformer-based model with dropout for Bayesian inference."""
    def __init__(self, input_size=3, d_model=64, nhead=4, num_layers=2, dropout=0.3, output_size=5):
        super().__init__()
        self.embedding = torch.nn.Linear(input_size, d_model)
        encoder_layer = torch.nn.TransformerEncoderLayer(d_model, nhead, dim_feedforward=256, dropout=dropout, batch_first=True)
        self.transformer = torch.nn.TransformerEncoder(encoder_layer, num_layers)
        self.fc = torch.nn.Linear(d_model, output_size)
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, x):
        # x: (batch, channels, length) -> (batch, length, channels)
        x = x.transpose(1, 2)
        x = self.embedding(x)
        x = self.transformer(x)
        x = self.dropout(x)
        out = self.fc(x)
        # (batch, length, output_size) -> (batch, output_size, length)
        return out.transpose(1, 2)


class BayesianTCN(torch.nn.Module):
    """Temporal Convolutional Network with dropout."""
    def __init__(self, input_size=3, num_channels=64, kernel_size=5, dropout=0.3, output_size=5):
        super().__init__()
        self.conv1 = torch.nn.Conv1d(input_size, num_channels, kernel_size, padding=kernel_size//2)
        self.conv2 = torch.nn.Conv1d(num_channels, num_channels, kernel_size, padding=kernel_size//2)
        self.conv3 = torch.nn.Conv1d(num_channels, output_size, kernel_size, padding=kernel_size//2)
        self.relu = torch.nn.ReLU()
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.dropout(x)
        x = self.relu(self.conv2(x))
        x = self.dropout(x)
        x = self.conv3(x)
        return x


class BayesianWaveNet(torch.nn.Module):
    """WaveNet-inspired architecture with dilated convolutions."""
    def __init__(self, input_size=3, num_channels=32, num_layers=8, dropout=0.3, output_size=5):
        super().__init__()
        self.initial_conv = torch.nn.Conv1d(input_size, num_channels, kernel_size=1)
        self.dilated_convs = torch.nn.ModuleList([
            torch.nn.Conv1d(num_channels, num_channels, kernel_size=3, dilation=2**i, padding=2**i)
            for i in range(num_layers)
        ])
        self.final_conv = torch.nn.Conv1d(num_channels, output_size, kernel_size=1)
        self.relu = torch.nn.ReLU()
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, x):
        x = self.initial_conv(x)
        for conv in self.dilated_convs:
            x = self.relu(conv(x))
            x = self.dropout(x)
        x = self.final_conv(x)
        return x


class BayesianCNN(torch.nn.Module):
    """Convolutional Neural Network with dropout."""
    def __init__(self, input_size=3, dropout=0.3, output_size=5):
        super().__init__()
        self.conv1 = torch.nn.Conv1d(input_size, 32, kernel_size=5, padding=2)
        self.conv2 = torch.nn.Conv1d(32, 64, kernel_size=5, padding=2)
        self.conv3 = torch.nn.Conv1d(64, 128, kernel_size=5, padding=2)
        self.global_pool = torch.nn.AdaptiveAvgPool1d(1)
        self.fc1 = torch.nn.Linear(128, 64)
        self.fc2 = torch.nn.Linear(64, output_size)
        self.relu = torch.nn.ReLU()
        self.dropout = torch.nn.Dropout(dropout)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.dropout(x)
        x = self.relu(self.conv2(x))
        x = self.dropout(x)
        x = self.relu(self.conv3(x))
        x = self.dropout(x)
        # For CNN, we need to maintain the sequence dimension
        # Let's do per-position classification instead
        x = self.conv1(x)
        x = self.dropout(self.relu(x))
        x = self.conv2(x)
        x = self.dropout(self.relu(x))
        x = self.conv3(x)
        # Reshape: (batch, 128, 1000) -> use 1x1 conv to output_size
        x = torch.nn.functional.conv1d(x, torch.randn(output_size, 128, 1).to(x.device) * 0.01, bias=torch.zeros(output_size).to(x.device))
        return x


class BaselineCNN(torch.nn.Module):
    """Non-Bayesian CNN baseline for comparison."""
    def __init__(self, input_size=3, output_size=5):
        super().__init__()
        self.conv1 = torch.nn.Conv1d(input_size, 32, kernel_size=5, padding=2)
        self.conv2 = torch.nn.Conv1d(32, 64, kernel_size=5, padding=2)
        self.conv3 = torch.nn.Conv1d(64, output_size, kernel_size=5, padding=2)
        self.relu = torch.nn.ReLU()

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.relu(self.conv2(x))
        x = self.conv3(x)
        return x


# ============================================================================
# Model Loading
# ============================================================================

MODELS_METADATA = {
    "BayesianBiLSTM": {"class": BayesianBiLSTM, "kwargs": {}},
    "BayesianTransformer": {"class": BayesianTransformer, "kwargs": {}},
    "BayesianTCN": {"class": BayesianTCN, "kwargs": {}},
    "BayesianWaveNet": {"class": BayesianWaveNet, "kwargs": {}},
    "BayesianCNN": {"class": BayesianCNN, "kwargs": {}},
    "BaselineCNN": {"class": BaselineCNN, "kwargs": {}},
}

MODELS: dict[str, torch.nn.Module] = {}
MODEL_LOAD_ERROR: str | None = None


def load_models() -> None:
    """Load all 6 models into memory at startup."""
    global MODELS, MODEL_LOAD_ERROR

    for arch_name, meta in MODELS_METADATA.items():
        try:
            model = meta["class"](**meta["kwargs"])
            model_path = MODEL_DIR / f"{arch_name.replace('_', '').lower()}.pth"
            
            if model_path.exists():
                try:
                    state = torch.load(model_path, map_location=DEVICE)
                    model.load_state_dict(state)
                    print(f"✓ Loaded {arch_name} from {model_path}")
                except Exception as e:
                    print(f"⚠ Failed to load weights for {arch_name}: {e}. Using random initialization.")
                    MODEL_LOAD_ERROR = f"Could not load {arch_name}: {e}"
            else:
                print(f"⚠ Model weights not found at {model_path}. Using random initialization.")
                MODEL_LOAD_ERROR = f"Model weights not found for {arch_name}"
            
            model.to(DEVICE)
            model.eval()
            MODELS[arch_name] = model
            print(f"✓ {arch_name} ready for inference")

        except Exception as e:
            print(f"✗ Error loading {arch_name}: {e}")
            MODEL_LOAD_ERROR = str(e)


# ============================================================================
# MC-Dropout Inference
# ============================================================================

def mc_dropout_inference(
    model: torch.nn.Module,
    ecg_tensor: list[list[float]],
    num_passes: int = MC_PASSES,
) -> dict[str, Any]:
    """
    Run MC-Dropout inference with N passes to estimate uncertainty.
    
    Args:
        model: PyTorch model with dropout layers
        ecg_tensor: 3D array (3 channels, 1000 samples) or list of lists
        num_passes: Number of forward passes (default 20)
    
    Returns:
        dict with keys for each output channel:
        {
            "CS12": {"mean": [...], "sigma": [...]},
            "CS34": {...},
            ...
        }
    """
    # Convert input to tensor
    try:
        if isinstance(ecg_tensor, list):
            x = torch.tensor(ecg_tensor, dtype=torch.float32)
        else:
            x = torch.as_tensor(ecg_tensor, dtype=torch.float32)
        
        if x.dim() == 2:
            x = x.unsqueeze(0)  # Add batch dimension
        elif x.dim() != 3:
            raise ValueError(f"Expected 2D or 3D input, got {x.dim()}D")
        
        x = x.to(DEVICE)
    except Exception as e:
        raise ValueError(f"Failed to convert input tensor: {e}")

    # Run MC-Dropout passes
    outputs = []
    model.train()  # Enable dropout
    with torch.no_grad():
        for _ in range(num_passes):
            y = model(x)
            if y.dim() != 3 or y.shape[0] != x.shape[0] or y.shape[2] != x.shape[2]:
                raise RuntimeError(f"Invalid output shape: expected (1, output_channels, 1000), got {y.shape}")
            outputs.append(y.cpu().numpy())
    
    model.eval()  # Disable dropout
    
    # Compute mean and std across passes
    outputs = np.array(outputs)  # (num_passes, batch, output_channels, length)
    mean_output = np.mean(outputs, axis=0)[0]  # (output_channels, length)
    std_output = np.std(outputs, axis=0)[0]   # (output_channels, length)
    
    # Map output channels to EGM channels
    channels = {}
    for idx, ch_name in enumerate(CHANNEL_ORDER):
        if idx < mean_output.shape[0]:
            channels[ch_name] = {
                "mean": mean_output[idx].tolist(),
                "sigma": std_output[idx].tolist(),
            }
    
    return channels


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(title="CardioBayes Inference Service", version="1.0.0")


class InferenceRequest(BaseModel):
    """Request body for /infer endpoint."""
    ecg_tensor: list[list[float]]
    architecture: str


class InferenceResponse(BaseModel):
    """Response body for /infer endpoint."""
    channels: dict[str, dict[str, list[float]]]
    processing_time_ms: float
    is_cold_start: bool = False


class HealthResponse(BaseModel):
    """Response body for /health endpoint."""
    status: str
    service: str
    uptime_seconds: float
    models_loaded: int
    device: str
    error: str | None = None


@app.on_event("startup")
async def startup():
    """Load models at application startup."""
    print(f"Starting CardioBayes Inference Service on {DEVICE}...")
    load_models()
    print(f"Service started with {len(MODELS)} models loaded")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint. Returns status of service and models."""
    uptime = time.time() - STARTUP_TIME
    is_cold_start = uptime < 60  # Cold start if service started < 1 minute ago
    
    return HealthResponse(
        status="ok" if len(MODELS) > 0 else "degraded",
        service="inference",
        uptime_seconds=uptime,
        models_loaded=len(MODELS),
        device=DEVICE,
        error=MODEL_LOAD_ERROR,
    )


@app.get("/health/cold-start")
async def cold_start_check():
    """Check if service is still in cold-start phase (< 60 seconds)."""
    uptime = time.time() - STARTUP_TIME
    return {
        "is_cold_start": uptime < 60,
        "uptime_seconds": uptime,
        "models_loaded": len(MODELS),
    }


@app.post("/infer", response_model=InferenceResponse)
async def infer(
    request: InferenceRequest,
    x_service_key: str = Header(None),
):
    """
    Run Bayesian inference with MC-Dropout uncertainty estimation.
    
    Request:
        {
            "ecg_tensor": [[lead1_samples], [lead2_samples], [lead3_samples]],
            "architecture": "BayesianBiLSTM"
        }
    
    Response:
        {
            "channels": {
                "CS12": {"mean": [...], "sigma": [...]},
                "CS34": {...},
                ...
            },
            "processing_time_ms": 1234.56,
            "is_cold_start": false
        }
    
    Errors:
        - 401: Invalid service key
        - 400: Invalid architecture or tensor format
        - 500: Inference failed
    """
    start_time = time.time()
    uptime = time.time() - STARTUP_TIME
    is_cold_start = uptime < 60

    # Authenticate with service key
    if SERVICE_KEY and x_service_key != SERVICE_KEY:
        raise HTTPException(status_code=401, detail="Invalid service key")

    # Validate architecture
    if request.architecture not in MODELS:
        available = list(MODELS.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Unknown architecture: {request.architecture}. Available: {available}",
        )

    # Run inference
    try:
        model = MODELS[request.architecture]
        channels = mc_dropout_inference(model, request.ecg_tensor)
        
        if not channels:
            raise RuntimeError("No channel outputs produced")
        
        processing_time_ms = (time.time() - start_time) * 1000
        
        return InferenceResponse(
            channels=channels,
            processing_time_ms=processing_time_ms,
            is_cold_start=is_cold_start,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "name": "CardioBayes Inference Service",
        "version": "1.0.0",
        "description": "Bayesian ECG-to-EGM reconstruction with MC-Dropout uncertainty",
        "models": list(MODELS.keys()),
        "endpoints": {
            "/health": "Health check",
            "/health/cold-start": "Cold-start status",
            "/infer": "Run inference",
        },
        "docs": "/docs",
    }


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler."""
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "path": str(request.url),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
