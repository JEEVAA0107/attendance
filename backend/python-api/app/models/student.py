"""
SmartAttend Hub - Student Models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

# ============================================
# Student Profile Models
# ============================================

class StudentBase(BaseModel):
    roll_number: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    batch_year: int = Field(..., ge=2000, le=2100)
    semester: int = Field(default=1, ge=1, le=10)
    section: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None

class StudentCreate(StudentBase):
    email: EmailStr
    password: str = Field(..., min_length=6)
    department_id: UUID
    class_id: Optional[UUID] = None
    unique_id: Optional[str] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[EmailStr] = None
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    class_id: Optional[UUID] = None

class Student(StudentBase):
    id: UUID
    user_id: UUID
    department_id: Optional[UUID] = None
    class_id: Optional[UUID] = None
    profile_picture_url: Optional[str] = None
    admission_date: Optional[date] = None
    emergency_contact: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True

class StudentWithAttendance(Student):
    """Student with attendance statistics"""
    overall_attendance_percentage: float = 0.0
    subjects_below_75: int = 0
    total_classes: int = 0
    classes_attended: int = 0
    recent_attendance_trend: str = "stable"  # improving, declining, stable

# ============================================
# Bulk Operations
# ============================================

class StudentBulkCreate(BaseModel):
    """For bulk student upload"""
    students: List[StudentCreate]

class StudentBulkResult(BaseModel):
    """Result of bulk operation"""
    total: int
    successful: int
    failed: int
    errors: List[dict] = []

# ============================================
# Student Dashboard
# ============================================

class StudentDashboard(BaseModel):
    """Dashboard statistics for Student"""
    overall_attendance: float
    subjects_count: int
    subjects_below_75: int
    pending_leave_requests: int
    pending_corrections: int
    unread_notifications: int
    next_class: Optional[dict] = None
    attendance_summary: List[dict] = []