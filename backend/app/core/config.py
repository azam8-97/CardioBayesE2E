import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase Configuration
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")
    SUPABASE_ANON_KEY: str = os.environ.get("SUPABASE_ANON_KEY", "")

    # Database Configuration (optional for direct connection)
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")

    # API Configuration
    API_VERSION: str = "v1"
    API_TITLE: str = "CardioBayes API"
    API_DESCRIPTION: str = "ECG inference and analysis API"

    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-production-domain.com"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
