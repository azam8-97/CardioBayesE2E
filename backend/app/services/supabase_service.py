import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import UUID

try:
    from supabase import create_client
    from supabase.lib.client_options import ClientOptions
except Exception as e:
    create_client = None
    print(f"Warning: Could not import supabase: {e}")


class SupabaseService:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_SERVICE_KEY")
        self.client = None
        
        if create_client and self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                print(f"Supabase connected: {self.url}")
            except Exception as e:
                print(f"Failed to connect to Supabase: {e}")
        else:
            print("Supabase credentials not found in environment")

    # ==================== User Profile Methods ====================
    def insert_user_profile(self, user_id: str, email: str, full_name: str = None, role: str = "user"):
        """Insert or update user profile"""
        if not self.client:
            return None
        try:
            data = {
                "id": user_id,
                "email": email,
                "full_name": full_name or email.split("@")[0],
                "role": role,
                "is_active": True
            }
            result = self.client.table("user_profiles").upsert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error inserting user profile: {e}")
            return None

    def get_user_profile(self, user_id: str):
        """Fetch user profile by id."""
        if not self.client:
            return None
        try:
            result = self.client.table("user_profiles").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None

    def get_user_profile_by_email(self, email: str):
        """Fetch user profile by email."""
        if not self.client:
            return None
        try:
            result = self.client.table("user_profiles").select("*").eq("email", email.lower()).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None

    def update_user_full_name(self, user_id: str, full_name: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.table("user_profiles").update({"full_name": full_name}).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating profile: {e}")
            return False

    # ==================== Authentication Methods ====================
    def create_user(self, user_id: str, email: str, password_hash: str, full_name: str = None) -> bool:
        """Create a new user profile with auth credentials."""
        if not self.client:
            return False
        try:
            # Insert into user_profiles table (combined auth + profile)
            result = self.client.table("user_profiles").insert({
                "id": user_id,
                "email": email.lower(),
                "password_hash": password_hash,
                "full_name": full_name or email.split("@")[0],
                "role": "user",
                "is_active": True
            }).execute()
            
            return bool(result.data)
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Fetch user by email from user_profiles table (includes password_hash)."""
        if not self.client:
            return None
        try:
            result = self.client.table("user_profiles").select("*").eq("email", email.lower()).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None



    def update_last_login(self, user_id: str) -> bool:
        """Update user's last_login timestamp."""
        if not self.client:
            return False
        try:
            self.client.table("user_profiles").update(
                {"last_login": datetime.utcnow().isoformat()}
            ).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating last login: {e}")
            return False

    # ==================== Inference Job Methods ====================
    def create_inference_job(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Create a new inference job. Returns job_id."""
        if not self.client:
            return None
        try:
            result = self.client.table("inference_jobs").insert(job_data).execute()
            if result.data:
                return result.data[0].get("id")
            return None
        except Exception as e:
            print(f"Error creating inference job: {e}")
            return None

    def update_job_status(self, job_id: str, status: str, error_message: str = None, processing_time_ms: float = None):
        """Update job status"""
        if not self.client:
            return False
        try:
            update_data = {"status": status}
            if error_message:
                update_data["error_message"] = error_message
            if processing_time_ms is not None:
                update_data["processing_time_ms"] = processing_time_ms
            if status == "complete":
                update_data["completed_at"] = datetime.utcnow().isoformat()
            
            self.client.table("inference_jobs").update(update_data).eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error updating job status: {e}")
            return False

    def update_inference_job(self, job_id: str, fields: Dict[str, Any]) -> bool:
        """Partial update of inference_jobs row."""
        if not self.client or not fields:
            return False
        try:
            self.client.table("inference_jobs").update(fields).eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error updating job: {e}")
            return False

    def update_job_feedback(self, job_id: str, rating: int, comment: str = "") -> bool:
        if not self.client:
            return False
        try:
            self.client.table("inference_jobs").update(
                {"user_feedback_rating": rating, "user_feedback_text": comment or None}
            ).eq("id", job_id).execute()
            return True
        except Exception as e:
            print(f"Error updating feedback: {e}")
            return False

    def list_inference_jobs(
        self,
        user_id: Optional[str],
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
        architecture: Optional[str] = None,
    ) -> tuple[list[Dict], int]:
        """Returns (jobs, total_count). user_id None = all jobs (admin)."""
        if not self.client:
            return [], 0
        try:
            q = self.client.table("inference_jobs").select("*", count="exact")
            if user_id:
                q = q.eq("user_id", user_id)
            if status:
                q = q.eq("status", status)
            if architecture:
                q = q.eq("architecture", architecture)
            q = q.order("created_at", desc=True)
            result = q.range(offset, offset + limit - 1).execute()
            rows = result.data or []
            total = result.count if result.count is not None else len(rows)
            return rows, int(total)
        except Exception as e:
            print(f"Error listing jobs: {e}")
            return [], 0

    def best_pcc_for_job(self, job_id: str) -> Optional[float]:
        results = self.get_job_results(job_id)
        if not results:
            return None
        vals = [r.get("pcc") for r in results if r.get("pcc") is not None]
        return max(vals) if vals else None

    def get_job(self, job_id: str) -> Optional[Dict]:
        """Fetch a single job with all details"""
        if not self.client:
            return None
        try:
            result = self.client.table("inference_jobs").select("*").eq("id", job_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching job: {e}")
            return None

    def get_job_results(self, job_id: str) -> List[Dict]:
        """Fetch all inference results for a job"""
        if not self.client:
            return []
        try:
            result = self.client.table("inference_results").select("*").eq("job_id", job_id).execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching job results: {e}")
            return []

    def store_inference_result(self, result_data: Dict[str, Any]) -> Optional[str]:
        """Store a single channel's inference result. Returns result_id."""
        if not self.client:
            return None
        try:
            result = self.client.table("inference_results").insert(result_data).execute()
            if result.data:
                return result.data[0].get("id")
            return None
        except Exception as e:
            print(f"Error storing inference result: {e}")
            return None

    # ==================== Waveform Storage Methods ====================
    def store_waveform(self, job_id: str, channel: str, waveform_data: Dict[str, Any]) -> bool:
        """Store waveform mean/sigma arrays in the waveforms table."""
        if not self.client:
            return False
        try:
            self.client.table("waveforms").upsert(
                {
                    "job_id": job_id,
                    "channel": channel,
                    "mean_data": waveform_data.get("mean", []),
                    "sigma_data": waveform_data.get("sigma", []),
                },
                on_conflict="job_id,channel",
            ).execute()
            return True
        except Exception as e:
            print(f"Error storing waveform for {channel}: {e}")
            return False

    def retrieve_waveform(self, job_id: str, channel: str) -> Optional[Dict]:
        """Retrieve waveform mean/sigma arrays from the waveforms table."""
        if not self.client:
            return None
        try:
            result = (
                self.client.table("waveforms")
                .select("mean_data, sigma_data")
                .eq("job_id", job_id)
                .eq("channel", channel)
                .limit(1)
                .execute()
            )
            if not result.data:
                return None
            row = result.data[0]
            return {"mean": row.get("mean_data", []), "sigma": row.get("sigma_data", [])}
        except Exception as e:
            print(f"Error retrieving waveform for {channel}: {e}")
            return None

    # ==================== System Events Methods ====================
    def log_event(self, event_type: str, message: str, severity: str = "info", metadata: Dict = None):
        """Log a system event"""
        if not self.client:
            return False
        try:
            event_data = {
                "event_type": event_type,
                "message": message,
                "severity": severity,
                "metadata": metadata or {}
            }
            self.client.table("system_events").insert(event_data).execute()
            return True
        except Exception as e:
            print(f"Error logging event: {e}")
            return False

    # ==================== Model Analytics Methods ====================
    def record_model_analytics(self, analytics_data: Dict[str, Any]) -> bool:
        """Record model performance analytics"""
        if not self.client:
            return False
        try:
            self.client.table("model_analytics").insert(analytics_data).execute()
            return True
        except Exception as e:
            print(f"Error recording analytics: {e}")
            return False

    def get_model_stats(self, architecture: str, limit: int = 10) -> List[Dict]:
        """Fetch recent analytics for a model"""
        if not self.client:
            return []
        try:
            result = (
                self.client.table("model_analytics")
                .select("*")
                .eq("architecture", architecture)
                .order("recorded_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching model stats: {e}")
            return []

    # ==================== Health Check ====================
    def health_check(self) -> bool:
        """Test Supabase connection"""
        if not self.client:
            return False
        try:
            # Try a simple query
            self.client.table("system_events").select("count", count="exact").limit(0).execute()
            return True
        except Exception as e:
            print(f"Health check failed: {e}")
            return False


# Singleton instance
supabase_service = SupabaseService()
