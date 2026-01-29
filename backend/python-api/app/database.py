"""
SmartAttend Hub - Enhanced Database Connection
"""
from supabase import create_client, Client
from app.config import settings

def get_supabase() -> Client:
    """Get Supabase client instance"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase URL and Key must be configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase_admin() -> Client:
    """Get Supabase admin client (service role)"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase URL and Service Key must be configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# Singleton instances
supabase: Client = None
supabase_admin: Client = None

def init_db():
    """Initialize database connections"""
    global supabase, supabase_admin
    try:
        supabase = get_supabase()
        supabase_admin = get_supabase_admin()
        print("✅ Database connection established")
    except Exception as e:
        print(f"⚠️ Database connection warning: {e}")
        # Allow app to start without DB for development
        supabase = None
        supabase_admin = None