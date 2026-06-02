"""
Integration tests for Results, Dashboard, and Research pages.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestResultsEndpoints:
    """Test results page endpoints."""

    def test_get_inference_results(self):
        """GET /api/v1/inference/results/{job_id}"""
        response = client.get("/api/v1/inference/results/test-job-123")
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert "architecture" in data
        assert "channels" in data
        assert len(data["channels"]) > 0
        # Verify channel structure
        channel = data["channels"][0]
        assert "channel" in channel
        assert "pcc" in channel
        assert "rmse" in channel
        assert "confidence_level" in channel

    def test_submit_feedback_valid(self):
        """POST /api/v1/inference/feedback/{job_id} with valid rating"""
        response = client.post(
            "/api/v1/inference/feedback/test-job-123",
            json={"rating": 4}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["rating"] == 4

    def test_submit_feedback_invalid_rating(self):
        """POST /api/v1/inference/feedback/{job_id} with invalid rating"""
        response = client.post(
            "/api/v1/inference/feedback/test-job-123",
            json={"rating": 10}  # Invalid: > 5
        )
        assert response.status_code == 400

    def test_export_csv(self):
        """GET /api/v1/inference/export/{job_id}?format=csv"""
        response = client.get("/api/v1/inference/export/test-job-123?format=csv")
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        assert "filename" in data
        assert data["filename"].endswith(".csv")
        assert "Channel,PCC,RMSE" in data["content"]

    def test_export_pdf(self):
        """GET /api/v1/inference/export/{job_id}?format=pdf"""
        response = client.get("/api/v1/inference/export/test-job-123?format=pdf")
        assert response.status_code == 200
        data = response.json()
        assert "filename" in data
        assert data["filename"].endswith(".pdf")


class TestDashboardEndpoints:
    """Test dashboard page endpoints."""

    def test_get_user_jobs(self):
        """GET /api/v1/dashboard/jobs"""
        response = client.get("/api/v1/dashboard/jobs")
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert "total" in data
        assert "limit" in data
        assert "offset" in data
        assert isinstance(data["jobs"], list)
        # Check job structure
        if data["jobs"]:
            job = data["jobs"][0]
            assert "id" in job
            assert "architecture" in job
            assert "overall_pcc" in job
            assert "status" in job

    def test_get_jobs_with_limit(self):
        """GET /api/v1/dashboard/jobs?limit=5"""
        response = client.get("/api/v1/dashboard/jobs?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["jobs"]) <= 5

    def test_get_jobs_filtered_by_status(self):
        """GET /api/v1/dashboard/jobs?status=complete"""
        response = client.get("/api/v1/dashboard/jobs?status=complete")
        assert response.status_code == 200
        data = response.json()
        assert all(job["status"] == "complete" for job in data["jobs"])

    def test_get_jobs_filtered_by_architecture(self):
        """GET /api/v1/dashboard/jobs?architecture=BayesianBiLSTM"""
        response = client.get("/api/v1/dashboard/jobs?architecture=BayesianBiLSTM")
        assert response.status_code == 200
        data = response.json()
        if data["jobs"]:
            assert all(job["architecture"] == "BayesianBiLSTM" for job in data["jobs"])

    def test_get_dashboard_stats(self):
        """GET /api/v1/dashboard/stats"""
        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_jobs" in data
        assert "jobs_last_7_days" in data
        assert "success_rate" in data
        assert "average_pcc" in data
        assert "most_used_model" in data
        # Verify numeric ranges
        assert 0 <= data["success_rate"] <= 1
        assert 0 <= data["average_pcc"] <= 1

    def test_get_chart_data(self):
        """GET /api/v1/dashboard/chart-data"""
        response = client.get("/api/v1/dashboard/chart-data")
        assert response.status_code == 200
        data = response.json()
        assert "pcc_trend" in data
        assert "model_distribution" in data
        assert "status_distribution" in data
        # Verify trend data
        assert isinstance(data["pcc_trend"], list)
        assert len(data["pcc_trend"]) > 0
        assert all("date" in item and "pcc" in item for item in data["pcc_trend"])


class TestResearchEndpoints:
    """Test research page endpoints."""

    def test_get_research_stats(self):
        """GET /api/v1/research/stats"""
        response = client.get("/api/v1/research/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_inferences" in data
        assert "total_users" in data
        assert "data_points_collected" in data
        assert "models_evaluated" in data
        assert "channels_analyzed" in data
        # Verify numeric types
        assert isinstance(data["total_inferences"], int)
        assert isinstance(data["total_users"], int)

    def test_get_model_performance(self):
        """GET /api/v1/research/model-performance"""
        response = client.get("/api/v1/research/model-performance")
        assert response.status_code == 200
        data = response.json()
        # Verify all 6 models are present
        expected_models = [
            "BayesianBiLSTM",
            "BayesianTransformer",
            "BayesianTCN",
            "BayesianWaveNet",
            "BayesianCNN",
            "BaselineCNN"
        ]
        for model in expected_models:
            assert model in data
            model_data = data[model]
            assert "total_jobs" in model_data
            assert "avg_pcc" in model_data
            assert "avg_rmse" in model_data
            assert "avg_processing_time_ms" in model_data
            assert "success_rate" in model_data

    def test_get_uncertainty_calibration(self):
        """GET /api/v1/research/uncertainty-calibration"""
        response = client.get("/api/v1/research/uncertainty-calibration")
        assert response.status_code == 200
        data = response.json()
        # Check Bayesian models have calibration data
        bayesian_models = [
            "BayesianBiLSTM",
            "BayesianTransformer",
            "BayesianTCN",
            "BayesianWaveNet",
            "BayesianCNN"
        ]
        for model in bayesian_models:
            assert model in data
            calib_data = data[model]
            assert "mean_ece" in calib_data
            assert "mean_picp_95" in calib_data
            assert "calibration_quality" in calib_data

    def test_get_signal_distribution(self):
        """GET /api/v1/research/signal-distribution"""
        response = client.get("/api/v1/research/signal-distribution")
        assert response.status_code == 200
        data = response.json()
        assert "file_formats" in data
        assert "duration_bins" in data
        assert "sampling_rates" in data
        assert "success_rates_by_duration" in data
        # Verify structure
        assert "CSV" in data["file_formats"]
        assert isinstance(data["success_rates_by_duration"], list)


class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_health_check(self):
        """GET /api/v1/health"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data

    def test_inference_health(self):
        """GET /api/v1/health/inference"""
        response = client.get("/api/v1/health/inference")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "inference"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
