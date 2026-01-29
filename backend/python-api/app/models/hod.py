"""
SmartAttend Hub - HOD Models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

# ============================================
# HOD Profile Models
# ============================================

class HODBase(BaseModel):
    employee_id: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None

class HODCreate(HODBase):
    email: EmailStr
    password: str = Field(..., min_length=6)
    department_id: UUID

class HODUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    profile_picture_url: Optional[str] = None

class HOD(HODBase):
    id: UUID
    user_id: UUID
    department_id: Optional[UUID] = None
    profile_picture_url: Optional[str] = None
    date_of_joining: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class HODDashboard(BaseModel):
    """Dashboard statistics for HOD"""
    total_faculty: int
    total_students: int
    total_classes: int
    today_attendance_rate: float
    pending_leave_requests: int
    pending_corrections: int
    low_attendance_students: int
    recent_announcements: int