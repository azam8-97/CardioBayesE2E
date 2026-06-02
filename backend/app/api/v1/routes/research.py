"""
Research API endpoints for research data collection and statistics.
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/stats")
async def get_research_stats():
    """
    Get aggregated research statistics.
    """
    try:
        # Mock data - will be replaced with Supabase aggregations
        return {
            "total_inferences": 1247,
            "total_users": 89,
            "data_points_collected": 5234800,
            "models_evaluated": 6,
            "channels_analyzed": 15,
            "unique_signal_types": 23,
            "avg_pcc_all_models": 0.7742,
            "success_rate": 0.946,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch research stats: {str(e)}")


@router.get("/model-performance")
async def get_model_performance():
    """
    Get aggregated performance metrics per model from all real-world inferences.
    """
    try:
        # Mock data
        return {
            "BayesianBiLSTM": {
                "total_jobs": 198,
                "avg_pcc": 0.8014,
                "avg_rmse": 0.0234,
                "avg_processing_time_ms": 8520,
                "success_rate": 0.965,
                "avg_user_rating": 4.2,
            },
            "BayesianTransformer": {
                "total_jobs": 156,
                "avg_pcc": 0.7892,
                "avg_rmse": 0.0267,
                "avg_processing_time_ms": 12340,
                "success_rate": 0.942,
                "avg_user_rating": 4.4,
            },
            "BayesianTCN": {
                "total_jobs": 142,
                "avg_pcc": 0.7742,
                "avg_rmse": 0.0289,
                "avg_processing_time_ms": 3240,
                "success_rate": 0.938,
                "avg_user_rating": 3.8,
            },
            "BayesianWaveNet": {
                "total_jobs": 118,
                "avg_pcc": 0.7920,
                "avg_rmse": 0.0247,
                "avg_processing_time_ms": 10120,
                "success_rate": 0.941,
                "avg_user_rating": 4.1,
            },
            "BayesianCNN": {
                "total_jobs": 95,
                "avg_pcc": 0.7684,
                "avg_rmse": 0.0214,
                "avg_processing_time_ms": 4890,
                "success_rate": 0.947,
                "avg_user_rating": 3.9,
            },
            "BaselineCNN": {
                "total_jobs": 38,
                "avg_pcc": 0.7102,
                "avg_rmse": 0.0342,
                "avg_processing_time_ms": 2150,
                "success_rate": 0.921,
                "avg_user_rating": 3.2,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch model performance: {str(e)}")


@router.get("/uncertainty-calibration")
async def get_uncertainty_calibration():
    """
    Get uncertainty calibration metrics across all inferences.
    """
    try:
        # Mock data
        return {
            "BayesianBiLSTM": {
                "mean_ece": 0.032,
                "mean_picp_95": 0.951,
                "mean_mpiw": 0.312,
                "calibration_quality": "High",
            },
            "BayesianTransformer": {
                "mean_ece": 0.021,
                "mean_picp_95": 0.967,
                "mean_mpiw": 0.298,
                "calibration_quality": "Highest",
            },
            "BayesianTCN": {
                "mean_ece": 0.056,
                "mean_picp_95": 0.938,
                "mean_mpiw": 0.345,
                "calibration_quality": "Good",
            },
            "BayesianWaveNet": {
                "mean_ece": 0.038,
                "mean_picp_95": 0.944,
                "mean_mpiw": 0.324,
                "calibration_quality": "Good",
            },
            "BayesianCNN": {
                "mean_ece": 0.074,
                "mean_picp_95": 0.922,
                "mean_mpiw": 0.387,
                "calibration_quality": "Moderate",
            },
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch calibration data: {str(e)}")


@router.get("/signal-distribution")
async def get_signal_distribution():
    """
    Get distribution of signal characteristics in research dataset.
    """
    try:
        # Mock data
        return {
            "file_formats": {
                "CSV": 687,
                "MAT": 412,
                "EDF": 148,
            },
            "duration_bins": {
                "< 10s": 234,
                "10-30s": 512,
                "30-60s": 389,
                "> 60s": 112,
            },
            "sampling_rates": {
                "250 Hz": 145,
                "500 Hz": 389,
                "1000 Hz": 623,
                "Other": 90,
            },
            "success_rates_by_duration": [
                {"duration_s": 5, "success_rate": 0.89},
                {"duration_s": 15, "success_rate": 0.94},
                {"duration_s": 45, "success_rate": 0.96},
                {"duration_s": 90, "success_rate": 0.91},
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch signal distribution: {str(e)}")
