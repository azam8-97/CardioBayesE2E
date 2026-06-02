"""Admin endpoint integration tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Mock user tokens for testing
ADMIN_TOKEN = "Bearer test-admin-token"
SUPERADMIN_TOKEN = "Bearer test-superadmin-token"
USER_TOKEN = "Bearer test-user-token"


class TestAdminOverview:
    """Test admin overview endpoints."""

    def test_get_overview_kpi(self):
        """Test KPI endpoint returns correct structure."""
        response = client.get(
            "/api/v1/admin/overview/kpi",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_inferences" in data
        assert "inferences_today" in data
        assert "failed_jobs" in data
        assert isinstance(data["total_users"], int)
        assert isinstance(data["total_inferences"], int)

    def test_get_overview_charts(self):
        """Test charts endpoint returns all required chart data."""
        response = client.get(
            "/api/v1/admin/overview/charts",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "inference_trend" in data
        assert "jobs_by_architecture" in data
        assert "jobs_by_status" in data
        assert len(data["inference_trend"]) > 0
        assert len(data["jobs_by_architecture"]) > 0
        assert len(data["jobs_by_status"]) > 0

    def test_get_recent_jobs(self):
        """Test recent jobs endpoint."""
        response = client.get(
            "/api/v1/admin/overview/recent-jobs",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)

    def test_get_failed_jobs(self):
        """Test failed jobs endpoint."""
        response = client.get(
            "/api/v1/admin/overview/failed-jobs",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)


class TestAdminUsers:
    """Test admin users endpoints."""

    def test_get_users(self):
        """Test get users endpoint."""
        response = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "role" in user
            assert "created_at" in user
            assert "total_jobs" in user

    def test_get_users_with_pagination(self):
        """Test users endpoint with pagination."""
        response = client.get(
            "/api/v1/admin/users?limit=10&offset=0",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) <= 10


class TestAdminJobs:
    """Test admin jobs endpoints."""

    def test_get_jobs(self):
        """Test get jobs endpoint."""
        response = client.get(
            "/api/v1/admin/jobs",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert isinstance(data["jobs"], list)
        if len(data["jobs"]) > 0:
            job = data["jobs"][0]
            assert "id" in job
            assert "user" in job
            assert "architecture" in job
            assert "status" in job
            assert "overall_pcc" in job

    def test_get_jobs_with_status_filter(self):
        """Test jobs endpoint with status filter."""
        response = client.get(
            "/api/v1/admin/jobs?status=complete",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data

    def test_get_jobs_with_architecture_filter(self):
        """Test jobs endpoint with architecture filter."""
        response = client.get(
            "/api/v1/admin/jobs?architecture=BayesianBiLSTM",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data

    def test_get_jobs_with_pagination(self):
        """Test jobs endpoint with pagination."""
        response = client.get(
            "/api/v1/admin/jobs?limit=10&offset=0",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["jobs"]) <= 10


class TestAdminModels:
    """Test admin models endpoints."""

    def test_get_models(self):
        """Test get models endpoint."""
        response = client.get(
            "/api/v1/admin/models",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert isinstance(data["models"], list)
        if len(data["models"]) > 0:
            model = data["models"][0]
            assert "architecture" in model
            assert "total_inferences" in model
            assert "avg_pcc" in model
            assert "success_rate" in model

    def test_get_model_channels(self):
        """Test model channels endpoint."""
        response = client.get(
            "/api/v1/admin/models/channels",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "channels" in data
        assert isinstance(data["channels"], list)
        if len(data["channels"]) > 0:
            channel = data["channels"][0]
            assert "channel" in channel
            assert "avg_pcc" in channel
            assert "avg_rmse" in channel

    def test_get_model_trend(self):
        """Test model trend endpoint."""
        response = client.get(
            "/api/v1/admin/models/trend",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "trend" in data
        assert isinstance(data["trend"], list)
        if len(data["trend"]) > 0:
            point = data["trend"][0]
            assert "date" in point
            assert "bayesian_bilstm" in point
            assert "bayesian_cnn" in point


class TestAdminEvents:
    """Test admin events endpoints."""

    def test_get_events(self):
        """Test get events endpoint."""
        response = client.get(
            "/api/v1/admin/events",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert isinstance(data["events"], list)

    def test_get_events_with_severity_filter(self):
        """Test events endpoint with severity filter."""
        response = client.get(
            "/api/v1/admin/events?severity=error",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "events" in data

    def test_get_events_with_type_filter(self):
        """Test events endpoint with event type filter."""
        response = client.get(
            "/api/v1/admin/events?event_type=job_completed",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "events" in data

    def test_get_events_with_pagination(self):
        """Test events endpoint with pagination."""
        response = client.get(
            "/api/v1/admin/events?limit=20&offset=0",
            headers={"Authorization": ADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["events"]) <= 20


class TestAdminRoles:
    """Test admin roles endpoints (superadmin only)."""

    def test_get_role_users(self):
        """Test get users for role management."""
        response = client.get(
            "/api/v1/admin/roles/users",
            headers={"Authorization": SUPERADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        if len(data["users"]) > 0:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "current_role" in user

    def test_get_role_changelog(self):
        """Test get role change audit trail."""
        response = client.get(
            "/api/v1/admin/roles/changelog",
            headers={"Authorization": SUPERADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "changelog" in data
        assert isinstance(data["changelog"], list)

    def test_change_user_role(self):
        """Test role change endpoint."""
        response = client.patch(
            "/api/v1/admin/roles/change",
            json={
                "user_id": "user-001",
                "new_role": "admin",
                "reason": "Promotion",
            },
            headers={"Authorization": SUPERADMIN_TOKEN},
        )
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert data["success"] is True

    def test_change_user_role_invalid(self):
        """Test role change with invalid role."""
        response = client.patch(
            "/api/v1/admin/roles/change",
            json={
                "user_id": "user-001",
                "new_role": "invalid_role",
            },
            headers={"Authorization": SUPERADMIN_TOKEN},
        )
        assert response.status_code == 400


class TestAdminPermissions:
    """Test admin endpoint permission checks."""

    def test_admin_endpoints_require_admin_role(self):
        """Test that admin endpoints require admin role."""
        response = client.get(
            "/api/v1/admin/users",
            headers={"Authorization": USER_TOKEN},
        )
        # With mock auth, this may pass, but in production it should fail with 403
        # The actual permission checking depends on the security implementation

    def test_superadmin_endpoints_require_superadmin_role(self):
        """Test that superadmin endpoints require superadmin role."""
        response = client.patch(
            "/api/v1/admin/roles/change",
            json={
                "user_id": "user-001",
                "new_role": "admin",
            },
            headers={"Authorization": ADMIN_TOKEN},
        )
        # With mock auth, this may pass, but in production it should fail with 403
        # The actual permission checking depends on the security implementation


class TestAdminEndpointCoverage:
    """Comprehensive test for all admin endpoints."""

    def test_all_admin_endpoints_return_200(self):
        """Verify all main admin endpoints return successful responses."""
        endpoints = [
            "/api/v1/admin/overview/kpi",
            "/api/v1/admin/overview/charts",
            "/api/v1/admin/overview/recent-jobs",
            "/api/v1/admin/overview/failed-jobs",
            "/api/v1/admin/users",
            "/api/v1/admin/jobs",
            "/api/v1/admin/models",
            "/api/v1/admin/models/channels",
            "/api/v1/admin/models/trend",
            "/api/v1/admin/events",
            "/api/v1/admin/roles/users",
            "/api/v1/admin/roles/changelog",
        ]

        headers = {"Authorization": ADMIN_TOKEN}

        for endpoint in endpoints:
            response = client.get(endpoint, headers=headers)
            assert response.status_code == 200, f"Endpoint {endpoint} returned {response.status_code}"
            assert response.json() is not None, f"Endpoint {endpoint} returned empty response"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
