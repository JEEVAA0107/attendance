"""
SmartAttend Hub - Models Package
"""
from app.models.user import (
    UserBase, UserCreate, UserUpdate, UserLogin, UserResponse,
    Token, TokenPayload, RefreshTokenRequest, PasswordChange
)
from app.models.hod import HOD, HODCreate, HODUpdate, HODDashboard
from app.models.faculty import (
    Faculty, FacultyCreate, FacultyUpdate, 
    FacultyAssignment, FacultyDashboard
)
from app.models.student import (
    Student, StudentCreate, StudentUpdate, 
    StudentBulkCreate, StudentDashboard
)
from app.models.attendance import (
    AttendanceSession, AttendanceSessionCreate, AttendanceSessionUpdate,
    AttendanceRecord, AttendanceMarkBulk, AttendanceMarkSingle,
    LeaveRequest, LeaveRequestCreate, LeaveRequestReview,
    AttendanceCorrection, AttendanceCorrectionCreate, AttendanceCorrectionReview,
    AttendanceSummary, AttendanceStatus, SessionStatus, LeaveType, RequestStatus
)
from app.models.notification import (
    Notification, NotificationCreate, NotificationMarkRead,
    Announcement, AnnouncementCreate,
    Message, MessageCreate,
    NotificationType, NotificationPriority
)

__all__ = [
    # User
    "UserBase", "UserCreate", "UserUpdate", "UserLogin", "UserResponse",
    "Token", "TokenPayload", "RefreshTokenRequest", "PasswordChange",
    # HOD
    "HOD", "HODCreate", "HODUpdate", "HODDashboard",
    # Faculty
    "Faculty", "FacultyCreate", "FacultyUpdate", "FacultyAssignment", "FacultyDashboard",
    # Student
    "Student", "StudentCreate", "StudentUpdate", "StudentBulkCreate", "StudentDashboard",
    # Attendance
    "AttendanceSession", "AttendanceSessionCreate", "AttendanceSessionUpdate",
    "AttendanceRecord", "AttendanceMarkBulk", "AttendanceMarkSingle",
    "LeaveRequest", "LeaveRequestCreate", "LeaveRequestReview",
    "AttendanceCorrection", "AttendanceCorrectionCreate", "AttendanceCorrectionReview",
    "AttendanceSummary", "AttendanceStatus", "SessionStatus", "LeaveType", "RequestStatus",
    # Notification
    "Notification", "NotificationCreate", "NotificationMarkRead",
    "Announcement", "AnnouncementCreate", "Message", "MessageCreate",
    "NotificationType", "NotificationPriority"
]
