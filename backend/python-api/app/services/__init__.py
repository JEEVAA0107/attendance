"""
SmartAttend Hub - Services Package
"""
from app.services.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    authenticate_user, authenticate_hod, authenticate_faculty, authenticate_student,
    get_current_user, get_current_hod, get_current_faculty, get_current_student,
    RolePermission
)
from app.services.hod_service import HODService
from app.services.faculty_service import FacultyService
from app.services.student_service import StudentService
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService

__all__ = [
    # Auth
    "hash_password", "verify_password",
    "create_access_token", "create_refresh_token", "decode_token",
    "authenticate_user", "authenticate_hod", "authenticate_faculty", "authenticate_student",
    "get_current_user", "get_current_hod", "get_current_faculty", "get_current_student",
    "RolePermission",
    # Services
    "HODService", "FacultyService", "StudentService",
    "NotificationService", "AnalyticsService"
]
