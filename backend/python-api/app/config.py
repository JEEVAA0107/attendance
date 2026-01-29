"""
SmartAttend Hub - Enhanced Configuration
"""
import os
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()

class Settings:
    """Application settings"""
    
    # App
    APP_NAME: str = "SmartAttend Hub API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartattend-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # SMS (Free options - will use webhook for flexibility)
    SMS_WEBHOOK_URL: str = os.getenv("SMS_WEBHOOK_URL", "")  # n8n webhook for SMS
    SMS_ENABLED: bool = os.getenv("SMS_ENABLED", "false").lower() == "true"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # CORS
    CORS_ORIGINS: list = ["*"]  # Configure for production

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()