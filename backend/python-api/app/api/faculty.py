"""
SmartAttend Hub - Faculty API Routes
Full implementation of Faculty management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.models.faculty import Faculty, FacultyUpdate, FacultyDashboard
from app.models.attendance import (
    AttendanceSessionCreate, AttendanceSession,
    AttendanceMarkBulk, AttendanceRecord,
    LeaveRequestReview, AttendanceCorrectionReview
)
from app.services.auth import get_current_faculty
from app.services.faculty_service import FacultyService

router = APIRouter()

# ============================================
# Profile
# ============================================

@router.get("/profile")
async def get_faculty_profile(current_faculty: dict = Depends(get_current_faculty)):
    """Get current faculty profile"""
    return {
        "user": {
            "id": current_faculty.get("id"),
            "email": current_faculty.get("email"),
            "role": current_faculty.get("role")
        },
        "profile": current_faculty.get("profile", {})
    }

@router.put("/profile")
async def update_faculty_profile(
    faculty_update: FacultyUpdate,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Update faculty profile"""
    from app.database import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    profile = current_faculty.get("profile", {})
    if not profile.get("id"):
        raise HTTPException(status_code=400, detail="Profile not found")
    
    update_data = {k: v for k, v in faculty_update.model_dump().items() if v is not None}
    result = supabase.table("faculty_profiles").update(update_data).eq("id", profile["id"]).execute()
    
    return {"message": "Profile updated", "data": result.data[0] if result.data else {}}

# ============================================
# Dashboard
# ============================================

@router.get("/dashboard", response_model=FacultyDashboard)
async def get_dashboard(current_faculty: dict = Depends(get_current_faculty)):
    """Get faculty dashboard statistics"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return FacultyDashboard(
            assigned_classes=0, assigned_subjects=0, total_students=0,
            today_sessions=0, completed_sessions=0, pending_leave_requests=0,
            pending_corrections=0, overall_attendance_rate=0
        )
    
    return await FacultyService.get_dashboard(UUID(faculty_id))

# ============================================
# Assigned Classes & Students
# ============================================

@router.get("/assigned-classes")
async def get_assigned_classes(current_faculty: dict = Depends(get_current_faculty)):
    """Get classes assigned to faculty"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_assigned_classes(UUID(faculty_id))

@router.get("/classes/{class_id}/students")
async def get_class_students(
    class_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get students in a specific class (if faculty is assigned)"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        return await FacultyService.get_class_students(UUID(faculty_id), class_id)
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/students/assigned")
async def get_all_assigned_students(current_faculty: dict = Depends(get_current_faculty)):
    """Get all students in faculty's assigned classes"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    # Get all assigned classes
    assignments = await FacultyService.get_assigned_classes(UUID(faculty_id))
    
    # Get students from all classes
    all_students = []
    seen_ids = set()
    
    for assignment in assignments:
        class_data = assignment.get("classes", {})
        if class_data and class_data.get("id"):
            try:
                students = await FacultyService.get_class_students(UUID(faculty_id), UUID(class_data["id"]))
                for s in students:
                    if s["id"] not in seen_ids:
                        seen_ids.add(s["id"])
                        all_students.append(s)
            except Exception:
                pass
    
    return all_students

# ============================================
# Attendance Sessions
# ============================================

@router.get("/sessions/today")
async def get_today_sessions(current_faculty: dict = Depends(get_current_faculty)):
    """Get today's attendance sessions"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_today_sessions(UUID(faculty_id))

@router.post("/sessions")
async def create_session(
    session_data: AttendanceSessionCreate,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Create new attendance session"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await FacultyService.create_session(UUID(faculty_id), session_data)
        return {"message": "Session created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/sessions/{session_id}/complete")
async def complete_session(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Mark session as completed"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await FacultyService.complete_session(UUID(faculty_id), session_id)
        return {"message": "Session completed", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Attendance Marking
# ============================================

@router.post("/attendance/mark")
async def mark_attendance(
    attendance_data: AttendanceMarkBulk,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Mark attendance for multiple students"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await FacultyService.mark_attendance_bulk(UUID(faculty_id), attendance_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attendance/session/{session_id}")
async def get_session_attendance(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get attendance records for a session"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        return await FacultyService.get_session_attendance(UUID(faculty_id), session_id)
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/attendance/class/{class_id}")
async def get_class_attendance(
    class_id: UUID,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get attendance history for a class"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    # Get sessions for this class by this faculty
    query = supabase.table("attendance_sessions").select(
        "*, attendance_records(*, student_profiles(name, roll_number))"
    ).eq("class_id", str(class_id)).eq("faculty_id", faculty_id)
    
    if start_date:
        query = query.gte("session_date", start_date.isoformat())
    if end_date:
        query = query.lte("session_date", end_date.isoformat())
    
    result = query.order("session_date", desc=True).limit(50).execute()
    return result.data or []

# ============================================
# Leave Requests
# ============================================

@router.get("/leave-requests/pending")
async def get_pending_leave_requests(current_faculty: dict = Depends(get_current_faculty)):
    """Get pending leave requests for faculty's classes"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_pending_leave_requests(UUID(faculty_id))

@router.put("/leave-requests/{request_id}")
async def review_leave_request(
    request_id: UUID,
    review: LeaveRequestReview,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Approve or reject leave request"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await FacultyService.review_leave_request(UUID(faculty_id), request_id, review)
        return {"message": f"Leave request {review.status.value}", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Attendance Corrections
# ============================================

@router.get("/corrections/pending")
async def get_pending_corrections(current_faculty: dict = Depends(get_current_faculty)):
    """Get pending correction requests"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_pending_corrections(UUID(faculty_id))

@router.put("/corrections/{correction_id}")
async def review_correction(
    correction_id: UUID,
    review: AttendanceCorrectionReview,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Approve or reject correction request"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    try:
        result = await FacultyService.review_correction(UUID(faculty_id), correction_id, review)
        return {"message": f"Correction {review.status.value}", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Analytics
# ============================================

@router.get("/analytics/class/{class_id}")
async def get_class_analytics(
    class_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get attendance analytics for a class"""
    from app.database import supabase
    if not supabase:
        return {}
    
    # Get daily analytics for the class
    result = supabase.table("daily_analytics").select("*").eq("class_id", str(class_id)).order("date", desc=True).limit(30).execute()
    
    if not result.data:
        return {"message": "No analytics available", "data": []}
    
    # Calculate averages
    avg_rate = sum(d.get("attendance_rate", 0) for d in result.data) / len(result.data)
    
    return {
        "class_id": str(class_id),
        "average_attendance_rate": round(avg_rate, 2),
        "recent_data": result.data,
        "total_days": len(result.data)
    }

@router.get("/students/{student_id}/performance")
async def get_student_performance(
    student_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get individual student performance"""
    from app.database import supabase
    if not supabase:
        return {}
    
    # Get student attendance summary
    summary = supabase.table("attendance_summary").select(
        "*, subjects(name, code)"
    ).eq("student_id", str(student_id)).execute()
    
    # Get student info
    student = supabase.table("student_profiles").select("name, roll_number").eq("id", str(student_id)).single().execute()
    
    if not student.data:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate overall
    summaries = summary.data or []
    total = sum(s.get("total_classes", 0) for s in summaries)
    attended = sum(s.get("classes_attended", 0) for s in summaries)
    overall = (attended / total * 100) if total > 0 else 0
    
    return {
        "student": student.data,
        "overall_attendance": round(overall, 2),
        "subjects": summaries,
        "risk_level": "low" if overall >= 85 else "medium" if overall >= 75 else "high" if overall >= 60 else "critical"
    }

# ============================================
# Subjects
# ============================================

@router.get("/subjects/assigned")
async def get_assigned_subjects(current_faculty: dict = Depends(get_current_faculty)):
    """Get faculty's assigned subjects"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    result = supabase.table("faculty_assignments").select(
        "subject_id, subjects(id, name, code, credits)"
    ).eq("faculty_id", faculty_id).eq("is_active", True).execute()
    
    # Deduplicate subjects
    seen = set()
    subjects = []
    for a in (result.data or []):
        sub = a.get("subjects", {})
        if sub and sub.get("id") not in seen:
            seen.add(sub["id"])
            subjects.append(sub)
    
    return subjects