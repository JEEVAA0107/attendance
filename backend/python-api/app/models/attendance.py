"""
SmartAttend Hub - Attendance Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time
from uuid import UUID
from enum import Enum

# ============================================
# Enums
# ============================================

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"
    ON_DUTY = "on_duty"

class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class LeaveType(str, Enum):
    SICK = "sick"
    PERSONAL = "personal"
    EMERGENCY = "emergency"
    ACADEMIC = "academic"
    OTHER = "other"

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

# ============================================
# Attendance Session Models
# ============================================

class AttendanceSessionCreate(BaseModel):
    class_id: UUID
    subject_id: UUID
    session_date: date
    start_time: time
    end_time: Optional[time] = None
    timetable_id: Optional[UUID] = None
    notes: Optional[str] = None

class AttendanceSessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None
    end_time: Optional[time] = None
    notes: Optional[str] = None

class AttendanceSession(BaseModel):
    id: UUID
    class_id: UUID
    subject_id: UUID
    faculty_id: UUID
    timetable_id: Optional[UUID] = None
    session_date: date
    start_time: time
    end_time: Optional[time] = None
    status: SessionStatus
    total_present: int = 0
    total_absent: int = 0
    total_late: int = 0
    notes: Optional[str] = None
    created_at: datetime
    
    # Expanded data
    class_name: Optional[str] = None
    subject_name: Optional[str] = None
    faculty_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============================================
# Attendance Record Models
# ============================================

class AttendanceMarkSingle(BaseModel):
    """Mark attendance for single student"""
    student_id: UUID
    status: AttendanceStatus
    unique_id_verified: bool = False
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceMarkBulk(BaseModel):
    """Mark attendance for multiple students"""
    session_id: UUID
    records: List[AttendanceMarkSingle]

class AttendanceRecordCreate(BaseModel):
    session_id: UUID
    student_id: UUID
    status: AttendanceStatus
    unique_id_verified: bool = False
    notes: Optional[str] = None

class AttendanceRecordUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None

class AttendanceRecord(BaseModel):
    id: UUID
    session_id: UUID
    student_id: UUID
    status: AttendanceStatus
    marked_at: datetime
    marked_by: Optional[UUID] = None
    unique_id_verified: bool = False
    verification_timestamp: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    
    # Expanded data
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============================================
# Leave Request Models
# ============================================

class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str = Field(..., min_length=10)
    supporting_document_url: Optional[str] = None

class LeaveRequestReview(BaseModel):
    status: RequestStatus
    review_notes: Optional[str] = None

class LeaveRequest(BaseModel):
    id: UUID
    student_id: UUID
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str
    supporting_document_url: Optional[str] = None
    status: RequestStatus
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    
    # Expanded data
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    reviewer_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# ============================================
# Attendance Correction Models
# ============================================

class AttendanceCorrectionCreate(BaseModel):
    attendance_id: Optional[UUID] = None
    session_id: UUID
    original_status: AttendanceStatus
    requested_status: AttendanceStatus
    reason: str = Field(..., min_length=10)
    supporting_document_url: Optional[str] = None

class AttendanceCorrectionReview(BaseModel):
    status: RequestStatus
    review_notes: Optional[str] = None

class AttendanceCorrection(BaseModel):
    id: UUID
    attendance_id: Optional[UUID] = None
    student_id: UUID
    session_id: UUID
    original_status: AttendanceStatus
    requested_status: AttendanceStatus
    reason: str
    supporting_document_url: Optional[str] = None
    status: RequestStatus
    reviewed_by: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================
# Attendance Summary Models
# ============================================

class AttendanceSummary(BaseModel):
    student_id: UUID
    subject_id: UUID
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    total_classes: int
    classes_attended: int
    classes_absent: int
    classes_late: int
    attendance_percentage: float
    last_updated: datetime
    
    class Config:
        from_attributes = True

class StudentAttendanceReport(BaseModel):
    """Complete attendance report for a student"""
    student_id: UUID
    student_name: str
    roll_number: str
    overall_percentage: float
    total_classes: int
    classes_attended: int
    subject_wise: List[AttendanceSummary]
    monthly_trend: List[dict]
    risk_level: str  # low, medium, high, critical
