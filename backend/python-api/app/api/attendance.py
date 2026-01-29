"""
SmartAttend Hub - Dedicated Attendance API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from uuid import UUID
from datetime import date, time

from app.models.attendance import (
    AttendanceSessionCreate, AttendanceSession, AttendanceSessionUpdate,
    AttendanceMarkBulk, AttendanceMarkSingle, AttendanceRecord, AttendanceStatus
)
from app.services.auth import get_current_faculty, get_current_user
from app.services.faculty_service import FacultyService
from app.services.notification_service import NotificationService
from app.database import supabase

router = APIRouter()

# ============================================
# Session Management
# ============================================

@router.post("/sessions")
async def create_session(
    session_data: AttendanceSessionCreate,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Create new attendance session"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Faculty profile not found")
    
    try:
        result = await FacultyService.create_session(UUID(faculty_id), session_data)
        return {"message": "Session created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/today")
async def get_today_sessions(current_faculty: dict = Depends(get_current_faculty)):
    """Get today's sessions for faculty"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_today_sessions(UUID(faculty_id))

@router.get("/sessions/{session_id}")
async def get_session(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get session details"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = supabase.table("attendance_sessions").select(
        "*, classes(name, section), subjects(name, code), faculty_profiles(name)"
    ).eq("id", str(session_id)).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return result.data

@router.put("/sessions/{session_id}/complete")
async def complete_session(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Mark session as completed"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Faculty profile not found")
    
    try:
        result = await FacultyService.complete_session(UUID(faculty_id), session_id)
        return {"message": "Session completed", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/sessions/{session_id}/cancel")
async def cancel_session(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Cancel a session"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = supabase.table("attendance_sessions").update({
        "status": "cancelled"
    }).eq("id", str(session_id)).eq("faculty_id", faculty_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session cancelled"}

# ============================================
# Attendance Marking
# ============================================

@router.post("/mark")
async def mark_attendance(
    attendance_data: AttendanceMarkBulk,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Mark attendance for multiple students"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Faculty profile not found")
    
    try:
        result = await FacultyService.mark_attendance_bulk(UUID(faculty_id), attendance_data)
        
        # Send notifications for absent students
        if not supabase:
            return result
        
        session = supabase.table("attendance_sessions").select(
            "session_date, subjects(name)"
        ).eq("id", str(attendance_data.session_id)).single().execute()
        
        if session.data:
            subject_name = session.data.get("subjects", {}).get("name", "Unknown")
            session_date = session.data.get("session_date", "")
            
            for record in attendance_data.records:
                if record.status in [AttendanceStatus.ABSENT, AttendanceStatus.LATE]:
                    await NotificationService.send_attendance_marked_notification(
                        student_id=record.student_id,
                        subject_name=subject_name,
                        status=record.status.value,
                        session_date=session_date
                    )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/mark/single")
async def mark_single_attendance(
    session_id: UUID,
    record: AttendanceMarkSingle,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Mark attendance for single student"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        raise HTTPException(status_code=400, detail="Faculty profile not found")
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    # Verify faculty owns session
    session = supabase.table("attendance_sessions").select("id").eq("id", str(session_id)).eq("faculty_id", faculty_id).single().execute()
    
    if not session.data:
        raise HTTPException(status_code=403, detail="Not authorized for this session")
    
    # Upsert attendance record
    result = supabase.table("attendance_records").upsert({
        "session_id": str(session_id),
        "student_id": str(record.student_id),
        "status": record.status.value,
        "marked_by": faculty_id,
        "unique_id_verified": record.unique_id_verified,
        "notes": record.notes,
        "latitude": record.latitude,
        "longitude": record.longitude
    }, on_conflict="session_id,student_id").execute()
    
    return {"message": "Attendance marked", "data": result.data[0] if result.data else {}}

@router.get("/session/{session_id}/records")
async def get_session_records(
    session_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get all attendance records for a session"""
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    if not faculty_id:
        return []
    
    return await FacultyService.get_session_attendance(UUID(faculty_id), session_id)

# ============================================
# Unique ID Verification
# ============================================

@router.post("/verify-id")
async def verify_student_id(
    session_id: UUID,
    unique_id: str,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Verify student unique ID and mark present"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    profile = current_faculty.get("profile", {})
    faculty_id = profile.get("id")
    
    # Find student by unique ID
    user = supabase.table("users").select("id").eq("unique_id", unique_id).eq("role", "student").eq("is_active", True).single().execute()
    
    if not user.data:
        raise HTTPException(status_code=404, detail="Student not found with this ID")
    
    student = supabase.table("student_profiles").select("id, name, roll_number").eq("user_id", user.data["id"]).single().execute()
    
    if not student.data:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Mark as present with verification
    result = supabase.table("attendance_records").upsert({
        "session_id": str(session_id),
        "student_id": student.data["id"],
        "status": "present",
        "marked_by": faculty_id,
        "unique_id_verified": True,
        "verification_timestamp": "now()"
    }, on_conflict="session_id,student_id").execute()
    
    return {
        "message": "Student verified and marked present",
        "student": {
            "id": student.data["id"],
            "name": student.data["name"],
            "roll_number": student.data["roll_number"]
        }
    }

# ============================================
# Attendance History
# ============================================

@router.get("/history/class/{class_id}")
async def get_class_history(
    class_id: UUID,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    subject_id: Optional[UUID] = Query(None),
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get attendance history for a class"""
    if not supabase:
        return []
    
    query = supabase.table("attendance_sessions").select(
        "id, session_date, start_time, status, total_present, total_absent, total_late, subjects(name, code)"
    ).eq("class_id", str(class_id))
    
    if start_date:
        query = query.gte("session_date", start_date.isoformat())
    if end_date:
        query = query.lte("session_date", end_date.isoformat())
    if subject_id:
        query = query.eq("subject_id", str(subject_id))
    
    result = query.order("session_date", desc=True).limit(100).execute()
    return result.data or []

@router.get("/history/student/{student_id}")
async def get_student_history(
    student_id: UUID,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get attendance history for a student"""
    # Students can only view their own history
    if current_user.get("role") == "student":
        student_profile = supabase.table("student_profiles").select("id").eq("user_id", current_user["id"]).single().execute()
        if not student_profile.data or str(student_profile.data["id"]) != str(student_id):
            raise HTTPException(status_code=403, detail="Can only view own history")
    
    if not supabase:
        return []
    
    query = supabase.table("attendance_records").select(
        "id, status, marked_at, notes, attendance_sessions(session_date, start_time, subjects(name, code))"
    ).eq("student_id", str(student_id))
    
    result = query.order("marked_at", desc=True).limit(100).execute()
    return result.data or []

# ============================================
# Summary & Reports
# ============================================

@router.get("/summary/student/{student_id}")
async def get_student_summary(
    student_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance summary for a student"""
    if not supabase:
        return []
    
    result = supabase.table("attendance_summary").select(
        "*, subjects(name, code, credits)"
    ).eq("student_id", str(student_id)).execute()
    
    return result.data or []

@router.get("/summary/class/{class_id}")
async def get_class_summary(
    class_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get attendance summary for all students in a class"""
    if not supabase:
        return []
    
    # Get students in class
    students = supabase.table("student_profiles").select("id, name, roll_number").eq("class_id", str(class_id)).order("roll_number").execute()
    
    if not students.data:
        return []
    
    summaries = []
    for student in students.data:
        # Get overall attendance
        summary = supabase.table("attendance_summary").select("total_classes, classes_attended, attendance_percentage").eq("student_id", student["id"]).execute()
        
        total = sum(s.get("total_classes", 0) for s in (summary.data or []))
        attended = sum(s.get("classes_attended", 0) for s in (summary.data or []))
        overall = (attended / total * 100) if total > 0 else 0
        
        summaries.append({
            "student_id": student["id"],
            "name": student["name"],
            "roll_number": student["roll_number"],
            "total_classes": total,
            "classes_attended": attended,
            "overall_percentage": round(overall, 2)
        })
    
    return summaries
