"""
SmartAttend Hub - API Package
"""
from app.api.auth import router as auth_router
from app.api.hod import router as hod_router
from app.api.faculty import router as faculty_router
from app.api.student import router as student_router
from app.api.attendance import router as attendance_router
from app.api.analytics import router as analytics_router

__all__ = [
    "auth_router", "hod_router", "faculty_router", 
    "student_router", "attendance_router", "analytics_router"
]
