"""Admin dashboard routes and endpoints."""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user, RoleChecker

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin permission checker
admin_only = RoleChecker(["admin", "superadmin"])
superadmin_only = RoleChecker(["superadmin"])


# ============ REQUEST/RESPONSE MODELS ============

class KPIResponse(BaseModel):
    total_users: int
    total_inferences: int
    inferences_today: int
    failed_jobs: int


class ChartDataPoint(BaseModel):
    date: str
    count: int


class ChartArchPoint(BaseModel):
    name: str
    value: int


class ChartStatusPoint(BaseModel):
    name: str
    value: int


class ChartDataResponse(BaseModel):
    inference_trend: List[ChartDataPoint]
    jobs_by_architecture: List[ChartArchPoint]
    jobs_by_status: List[ChartStatusPoint]


class RecentJobDetail(BaseModel):
    id: str
    created_at: str
    user: str
    architecture: str
    status: str
    pcc: float


class FailedJobDetail(BaseModel):
    id: str
    created_at: str
    user: str
    error_message: str
    error_code: str


class AdminUser(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    created_at: str
    last_login: Optional[str]
    total_jobs: int
    is_active: bool


class UsersResponse(BaseModel):
    users: List[AdminUser]


class AdminJobDetail(BaseModel):
    id: str
    created_at: str
    user: str
    architecture: str
    status: str
    processing_time_ms: int
    overall_pcc: float
    overall_confidence: str
    input_filename: str


class JobsResponse(BaseModel):
    jobs: List[AdminJobDetail]


class ModelMetric(BaseModel):
    architecture: str
    total_inferences: int
    avg_pcc: float
    avg_rmse: float
    avg_processing_time_ms: float
    success_rate: float
    avg_user_rating: float


class ModelsResponse(BaseModel):
    models: List[ModelMetric]


class ChannelMetric(BaseModel):
    channel: str
    avg_pcc: float
    avg_rmse: float
    avg_mae: float
    success_rate: float


class ChannelsResponse(BaseModel):
    channels: List[ChannelMetric]


class TrendPoint(BaseModel):
    date: str
    bayesian_bilstm: float
    bayesian_cnn: float
    bayesian_tcn: float
    bayesian_transformer: float
    bayesian_wavenet: float
    baseline_cnn: float


class TrendResponse(BaseModel):
    trend: List[TrendPoint]


class SystemEvent(BaseModel):
    id: str
    created_at: str
    event_type: str
    severity: str
    message: str
    user_id: Optional[str]
    metadata: Optional[dict]


class EventsResponse(BaseModel):
    events: List[SystemEvent]


class UserWithRole(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    current_role: str


class RolesUsersResponse(BaseModel):
    users: List[UserWithRole]


class RoleChangeLogEntry(BaseModel):
    id: str
    created_at: str
    changed_by: str
    user: str
    old_role: str
    new_role: str
    reason: Optional[str]


class RoleChangeLogResponse(BaseModel):
    changelog: List[RoleChangeLogEntry]


class RoleChangeRequest(BaseModel):
    user_id: str
    new_role: str
    reason: Optional[str]


# ============ OVERVIEW ENDPOINTS ============

@router.get("/overview/kpi", response_model=KPIResponse, dependencies=[Depends(admin_only)])
async def get_overview_kpi(current_user: dict = Depends(get_current_user)):
    """Get KPI metrics for admin dashboard."""
    # Mock data - in production, query from database
    return KPIResponse(
        total_users=342,
        total_inferences=12847,
        inferences_today=142,
        failed_jobs=23,
    )


@router.get("/overview/charts", response_model=ChartDataResponse, dependencies=[Depends(admin_only)])
async def get_overview_charts(current_user: dict = Depends(get_current_user)):
    """Get chart data for admin dashboard."""
    # Mock data - in production, query from database
    today = datetime.now()
    inference_trend = []
    for i in range(30):
        date = (today - timedelta(days=30 - i)).strftime("%Y-%m-%d")
        inference_trend.append(ChartDataPoint(date=date, count=100 + (i * 5)))

    jobs_by_architecture = [
        ChartArchPoint(name="BayesianBiLSTM", value=4230),
        ChartArchPoint(name="BayesianCNN", value=3120),
        ChartArchPoint(name="BayesianTCN", value=2890),
        ChartArchPoint(name="BayesianTransformer", value=1450),
        ChartArchPoint(name="BayesianWaveNet", value=890),
        ChartArchPoint(name="BaselineCNN", value=367),
    ]

    jobs_by_status = [
        ChartStatusPoint(name="Complete", value=12500),
        ChartStatusPoint(name="Failed", value=200),
        ChartStatusPoint(name="Pending", value=147),
    ]

    return ChartDataResponse(
        inference_trend=inference_trend,
        jobs_by_architecture=jobs_by_architecture,
        jobs_by_status=jobs_by_status,
    )


@router.get("/overview/recent-jobs", dependencies=[Depends(admin_only)])
async def get_recent_jobs(current_user: dict = Depends(get_current_user)):
    """Get recent inference jobs."""
    # Mock data
    jobs = [
        RecentJobDetail(
            id="job-001",
            created_at=datetime.now().isoformat(),
            user="alice@example.com",
            architecture="BayesianBiLSTM",
            status="complete",
            pcc=0.958,
        ),
        RecentJobDetail(
            id="job-002",
            created_at=(datetime.now() - timedelta(hours=1)).isoformat(),
            user="bob@example.com",
            architecture="BayesianCNN",
            status="complete",
            pcc=0.942,
        ),
    ]
    return {"jobs": jobs}


@router.get("/overview/failed-jobs", dependencies=[Depends(admin_only)])
async def get_failed_jobs(current_user: dict = Depends(get_current_user)):
    """Get failed inference jobs."""
    # Mock data
    jobs = [
        FailedJobDetail(
            id="job-fail-001",
            created_at=(datetime.now() - timedelta(hours=2)).isoformat(),
            user="charlie@example.com",
            error_message="Invalid input file format",
            error_code="INVALID_FORMAT",
        ),
    ]
    return {"jobs": jobs}


# ============ USERS ENDPOINTS ============

@router.get("/users", response_model=UsersResponse, dependencies=[Depends(admin_only)])
async def get_users(
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Get all users with pagination."""
    # Mock data
    users = [
        AdminUser(
            id="user-001",
            email="alice@example.com",
            full_name="Alice Johnson",
            role="user",
            created_at="2024-01-15T10:30:00Z",
            last_login="2024-12-19T14:22:00Z",
            total_jobs=45,
            is_active=True,
        ),
        AdminUser(
            id="user-002",
            email="bob@example.com",
            full_name="Bob Smith",
            role="admin",
            created_at="2024-02-10T09:15:00Z",
            last_login="2024-12-18T16:45:00Z",
            total_jobs=0,
            is_active=True,
        ),
        AdminUser(
            id="user-003",
            email="charlie@example.com",
            full_name="Charlie Brown",
            role="user",
            created_at="2024-03-05T11:00:00Z",
            last_login=None,
            total_jobs=0,
            is_active=False,
        ),
    ]
    return UsersResponse(users=users[offset : offset + limit])


# ============ JOBS ENDPOINTS ============

@router.get("/jobs", response_model=JobsResponse, dependencies=[Depends(admin_only)])
async def get_jobs(
    limit: int = 100,
    offset: int = 0,
    status: Optional[str] = None,
    architecture: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get all inference jobs with filtering."""
    # Mock data
    jobs = [
        AdminJobDetail(
            id="job-001",
            created_at=datetime.now().isoformat(),
            user="alice@example.com",
            architecture="BayesianBiLSTM",
            status="complete",
            processing_time_ms=2340,
            overall_pcc=0.958,
            overall_confidence="High",
            input_filename="ecg_001.csv",
        ),
        AdminJobDetail(
            id="job-002",
            created_at=(datetime.now() - timedelta(hours=1)).isoformat(),
            user="bob@example.com",
            architecture="BayesianCNN",
            status="complete",
            processing_time_ms=1890,
            overall_pcc=0.942,
            overall_confidence="High",
            input_filename="ecg_002.csv",
        ),
    ]

    filtered = jobs
    if status:
        filtered = [j for j in filtered if j.status == status]
    if architecture:
        filtered = [j for j in filtered if j.architecture == architecture]

    return JobsResponse(jobs=filtered[offset : offset + limit])


# ============ MODELS ENDPOINTS ============

@router.get("/models", response_model=ModelsResponse, dependencies=[Depends(admin_only)])
async def get_models(current_user: dict = Depends(get_current_user)):
    """Get model performance metrics."""
    models = [
        ModelMetric(
            architecture="BayesianBiLSTM",
            total_inferences=4230,
            avg_pcc=0.945,
            avg_rmse=0.0234,
            avg_processing_time_ms=2150,
            success_rate=0.98,
            avg_user_rating=4.5,
        ),
        ModelMetric(
            architecture="BayesianCNN",
            total_inferences=3120,
            avg_pcc=0.932,
            avg_rmse=0.0267,
            avg_processing_time_ms=1890,
            success_rate=0.96,
            avg_user_rating=4.2,
        ),
        ModelMetric(
            architecture="BayesianTCN",
            total_inferences=2890,
            avg_pcc=0.928,
            avg_rmse=0.0289,
            avg_processing_time_ms=1450,
            success_rate=0.95,
            avg_user_rating=4.1,
        ),
    ]
    return ModelsResponse(models=models)


@router.get("/models/channels", response_model=ChannelsResponse, dependencies=[Depends(admin_only)])
async def get_model_channels(current_user: dict = Depends(get_current_user)):
    """Get per-channel model performance."""
    channels = [
        ChannelMetric(
            channel="I",
            avg_pcc=0.948,
            avg_rmse=0.0218,
            avg_mae=0.0145,
            success_rate=0.987,
        ),
        ChannelMetric(
            channel="II",
            avg_pcc=0.952,
            avg_rmse=0.0201,
            avg_mae=0.0132,
            success_rate=0.992,
        ),
        ChannelMetric(
            channel="III",
            avg_pcc=0.935,
            avg_rmse=0.0298,
            avg_mae=0.0203,
            success_rate=0.968,
        ),
    ]
    return ChannelsResponse(channels=channels)


@router.get("/models/trend", response_model=TrendResponse, dependencies=[Depends(admin_only)])
async def get_model_trend(current_user: dict = Depends(get_current_user)):
    """Get model performance trend over time."""
    today = datetime.now()
    trend = []
    for i in range(30):
        date = (today - timedelta(days=30 - i)).strftime("%Y-%m-%d")
        trend.append(
            TrendPoint(
                date=date,
                bayesian_bilstm=0.940 + (i * 0.0005),
                bayesian_cnn=0.925 + (i * 0.0003),
                bayesian_tcn=0.920 + (i * 0.0004),
                bayesian_transformer=0.915 + (i * 0.0003),
                bayesian_wavenet=0.910 + (i * 0.0002),
                baseline_cnn=0.880 + (i * 0.0001),
            )
        )
    return TrendResponse(trend=trend)


# ============ EVENTS ENDPOINTS ============

@router.get("/events", response_model=EventsResponse, dependencies=[Depends(admin_only)])
async def get_events(
    limit: int = 100,
    offset: int = 0,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Get system events log."""
    events = [
        SystemEvent(
            id="event-001",
            created_at=datetime.now().isoformat(),
            event_type="job_completed",
            severity="info",
            message="Inference job completed successfully",
            user_id="user-001",
            metadata={"job_id": "job-001"},
        ),
        SystemEvent(
            id="event-002",
            created_at=(datetime.now() - timedelta(hours=1)).isoformat(),
            event_type="job_failed",
            severity="error",
            message="Inference job failed: Invalid input format",
            user_id="user-003",
            metadata={"job_id": "job-fail-001", "error_code": "INVALID_FORMAT"},
        ),
    ]

    filtered = events
    if severity:
        filtered = [e for e in filtered if e.severity == severity]
    if event_type:
        filtered = [e for e in filtered if e.event_type == event_type]

    return EventsResponse(events=filtered[offset : offset + limit])


# ============ ROLES ENDPOINTS ============

@router.get("/roles/users", response_model=RolesUsersResponse, dependencies=[Depends(superadmin_only)])
async def get_role_users(current_user: dict = Depends(get_current_user)):
    """Get all users for role management (superadmin only)."""
    users = [
        UserWithRole(
            id="user-001",
            email="alice@example.com",
            full_name="Alice Johnson",
            current_role="user",
        ),
        UserWithRole(
            id="user-002",
            email="bob@example.com",
            full_name="Bob Smith",
            current_role="admin",
        ),
        UserWithRole(
            id="user-003",
            email="charlie@example.com",
            full_name="Charlie Brown",
            current_role="superadmin",
        ),
    ]
    return RolesUsersResponse(users=users)


@router.get("/roles/changelog", response_model=RoleChangeLogResponse, dependencies=[Depends(superadmin_only)])
async def get_role_changelog(current_user: dict = Depends(get_current_user)):
    """Get role change audit trail (superadmin only)."""
    changelog = [
        RoleChangeLogEntry(
            id="log-001",
            created_at="2024-12-15T10:30:00Z",
            changed_by="superadmin@example.com",
            user="alice@example.com",
            old_role="user",
            new_role="admin",
            reason="Promoted to team lead",
        ),
    ]
    return RoleChangeLogResponse(changelog=changelog)


@router.patch("/roles/change", dependencies=[Depends(superadmin_only)])
async def change_user_role(
    request: RoleChangeRequest,
    current_user: dict = Depends(get_current_user),
):
    """Change a user's role (superadmin only)."""
    if request.new_role not in ["user", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role",
        )

    # In production, update database and log the change
    return {
        "success": True,
        "message": f"Role changed successfully",
        "user_id": request.user_id,
        "new_role": request.new_role,
    }
