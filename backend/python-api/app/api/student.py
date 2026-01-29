"""
SmartAttend Hub - Student API Routes
Full implementation of Student endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.models.student import Student, StudentDashboard
from app.models.attendance import (
    LeaveRequestCreate, LeaveRequest,
    AttendanceCorrectionCreate, AttendanceCorrection,
    AttendanceSummary, StudentAttendanceReport
)
from app.models.notification import NotificationMarkRead
from app.services.auth import get_current_student
from app.services.student_service import StudentService

router = APIRouter()

# ============================================
# Profile
# ============================================

@router.get("/profile")
async def get_student_profile(current_student: dict = Depends(get_current_student)):
    """Get current student profile"""
    return {
        "user": {
            "id": current_student.get("id"),
            "email": current_student.get("email"),
            "role": current_student.get("role")
        },
        "profile": current_student.get("profile", {})
    }

@router.put("/profile")
async def update_student_profile(
    phone: Optional[str] = None,
    address: Optional[str] = None,
    current_student: dict = Depends(get_current_student)
):
    """Update student profile (limited fields)"""
    from app.database import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    profile = current_student.get("profile", {})
    if not profile.get("id"):
        raise HTTPException(status_code=400, detail="Profile not found")
    
    update_data = {}
    if phone:
        update_data["phone"] = phone
    if address:
        update_data["address"] = address
    
    if update_data:
        result = supabase.table("student_profiles").update(update_data).eq("id", profile["id"]).execute()
        return {"message": "Profile updated", "data": result.data[0] if result.data else {}}
    
    return {"message": "No changes made"}

# ============================================
# Dashboard
# ============================================

@router.get("/dashboard", response_model=StudentDashboard)
async def get_dashboard(current_student: dict = Depends(get_current_student)):
    """Get student dashboard statistics"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    user_id = current_student.get("id")
    
    if not student_id:
        return StudentDashboard(
            overall_attendance=0, subjects_count=0, subjects_below_75=0,
            pending_leave_requests=0, pending_corrections=0,
            unread_notifications=0
        )
    
    return await StudentService.get_dashboard(UUID(student_id), UUID(user_id))

# ============================================
# Attendance
# ============================================

@router.get("/attendance/summary")
async def get_attendance_summary(current_student: dict = Depends(get_current_student)):
    """Get attendance summary for all subjects"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        return []
    
    return await StudentService.get_attendance_summary(UUID(student_id))

@router.get("/attendance/history")
async def get_attendance_history(
    subject_id: Optional[UUID] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_student: dict = Depends(get_current_student)
):
    """Get detailed attendance history"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        return []
    
    return await StudentService.get_attendance_history(
        UUID(student_id), subject_id, start_date, end_date
    )

@router.get("/attendance/report")
async def get_attendance_report(current_student: dict = Depends(get_current_student)):
    """Get complete attendance report"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    report = await StudentService.get_attendance_report(UUID(student_id))
    if not report:
        raise HTTPException(status_code=404, detail="Report not available")
    
    return report

# ============================================
# Leave Requests
# ============================================

@router.get("/leave-requests")
async def get_leave_requests(current_student: dict = Depends(get_current_student)):
    """Get all leave requests"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        return []
    
    return await StudentService.get_leave_requests(UUID(student_id))

@router.post("/leave-requests")
async def create_leave_request(
    request_data: LeaveRequestCreate,
    current_student: dict = Depends(get_current_student)
):
    """Submit new leave request"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await StudentService.create_leave_request(UUID(student_id), request_data)
        return {"message": "Leave request submitted", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/leave-requests/{request_id}")
async def cancel_leave_request(
    request_id: UUID,
    current_student: dict = Depends(get_current_student)
):
    """Cancel pending leave request"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        success = await StudentService.cancel_leave_request(UUID(student_id), request_id)
        if success:
            return {"message": "Leave request cancelled"}
        raise HTTPException(status_code=404, detail="Request not found or already processed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Attendance Corrections
# ============================================

@router.get("/corrections")
async def get_correction_requests(current_student: dict = Depends(get_current_student)):
    """Get all correction requests"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        return []
    
    return await StudentService.get_correction_requests(UUID(student_id))

@router.post("/corrections")
async def create_correction_request(
    correction_data: AttendanceCorrectionCreate,
    current_student: dict = Depends(get_current_student)
):
    """Submit attendance correction request"""
    profile = current_student.get("profile", {})
    student_id = profile.get("id")
    
    if not student_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await StudentService.create_correction_request(UUID(student_id), correction_data)
        return {"message": "Correction request submitted", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Notifications
# ============================================

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_student: dict = Depends(get_current_student)
):
    """Get notifications"""
    user_id = current_student.get("id")
    
    if not user_id:
        return []
    
    return await StudentService.get_notifications(UUID(user_id), unread_only)

@router.post("/notifications/mark-read")
async def mark_notifications_read(
    mark_data: NotificationMarkRead,
    current_student: dict = Depends(get_current_student)
):
    """Mark notifications as read"""
    user_id = current_student.get("id")
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User not found")
    
    count = await StudentService.mark_notifications_read(UUID(user_id), mark_data.notification_ids)
    return {"message": f"Marked {count} notifications as read"}

@router.get("/notifications/unread-count")
async def get_unread_count(current_student: dict = Depends(get_current_student)):
    """Get unread notification count"""
    from app.database import supabase
    if not supabase:
        return {"count": 0}
    
    user_id = current_student.get("id")
    result = supabase.table("notifications").select("id", count="exact").eq("recipient_id", user_id).eq("is_read", False).execute()
    
    return {"count": result.count or 0}

# ============================================
# Timetable
# ============================================

@router.get("/timetable")
async def get_timetable(current_student: dict = Depends(get_current_student)):
    """Get class timetable"""
    profile = current_student.get("profile", {})
    class_id = profile.get("class_id")
    
    if not class_id:
        return []
    
    return await StudentService.get_timetable(UUID(class_id))

# ============================================
# Subjects
# ============================================

@router.get("/subjects")
async def get_subjects(current_student: dict = Depends(get_current_student)):
    """Get subjects for current semester"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_student.get("profile", {})
    department_id = profile.get("department_id")
    semester = profile.get("semester", 1)
    
    if not department_id:
        return []
    
    result = supabase.table("subjects").select("*").eq("department_id", department_id).eq("semester", semester).eq("is_active", True).execute()
    
    return result.data or []

# ============================================
# Class Info
# ============================================

@router.get("/class")
async def get_class_info(current_student: dict = Depends(get_current_student)):
    """Get current class information"""
    from app.database import supabase
    if not supabase:
        return {}
    
    profile = current_student.get("profile", {})
    class_id = profile.get("class_id")
    
    if not class_id:
        return {"message": "No class assigned"}
    
    result = supabase.table("classes").select(
        "*, faculty_profiles!classes_class_teacher_id_fkey(name, phone)"
    ).eq("id", class_id).single().execute()
    
    return result.data or {}

@router.get("/classmates")
async def get_classmates(current_student: dict = Depends(get_current_student)):
    """Get classmates list"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_student.get("profile", {})
    class_id = profile.get("class_id")
    student_id = profile.get("id")
    
    if not class_id:
        return []
    
    result = supabase.table("student_profiles").select(
        "id, name, roll_number, profile_picture_url"
    ).eq("class_id", class_id).neq("id", student_id).order("roll_number").execute()
    
    return result.data or []

# ============================================
# Announcements
# ============================================

@router.get("/announcements")
async def get_announcements(current_student: dict = Depends(get_current_student)):
    """Get announcements for student"""
    from app.database import supabase
    from datetime import datetime
    
    if not supabase:
        return []
    
    profile = current_student.get("profile", {})
    class_id = profile.get("class_id")
    department_id = profile.get("department_id")
    
    # Get announcements targeted to all, students, this class, or this department
    query = supabase.table("announcements").select(
        "*, users!announcements_created_by_fkey(email)"
    ).or_(
        f"target_audience.cs.{{all}},target_audience.cs.{{students}},class_id.eq.{class_id},department_id.eq.{department_id}"
    ).lte("publish_at", datetime.utcnow().isoformat())
    
    result = query.order("created_at", desc=True).limit(20).execute()
    
    return result.data or []