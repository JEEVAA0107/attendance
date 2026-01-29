"""
SmartAttend Hub - Faculty Models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

# ============================================
# Faculty Profile Models
# ============================================

class FacultyBase(BaseModel):
    employee_id: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    designation: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None

class FacultyCreate(FacultyBase):
    email: EmailStr
    password: str = Field(..., min_length=6)
    department_id: UUID
    unique_id: Optional[str] = None  # For ID-based login

class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_class_teacher: Optional[bool] = None

class Faculty(FacultyBase):
    id: UUID
    user_id: UUID
    department_id: Optional[UUID] = None
    profile_picture_url: Optional[str] = None
    date_of_joining: Optional[date] = None
    is_class_teacher: bool = False
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True

class FacultyWithStats(Faculty):
    """Faculty with attendance statistics"""
    total_classes_conducted: int = 0
    average_attendance_rate: float = 0.0
    assigned_subjects_count: int = 0
    assigned_classes_count: int = 0

# ============================================
# Faculty Assignment Models
# ============================================

class FacultyAssignmentCreate(BaseModel):
    faculty_id: UUID
    subject_id: UUID
    class_id: UUID
    academic_year_id: Optional[UUID] = None

class FacultyAssignment(FacultyAssignmentCreate):
    id: UUID
    assigned_by: Optional[UUID] = None
    is_active: bool = True
    created_at: datetime
    
    # Expanded data
    faculty_name: Optional[str] = None
    subject_name: Optional[str] = None
    class_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class FacultyDashboard(BaseModel):
    """Dashboard statistics for Faculty"""
    assigned_classes: int
    assigned_subjects: int
    total_students: int
    today_sessions: int
    completed_sessions: int
    pending_leave_requests: int
    pending_corrections: int
    overall_attendance_rate: float