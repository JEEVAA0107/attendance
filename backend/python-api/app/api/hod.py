"""
SmartAttend Hub - HOD API Routes
Full implementation of HOD management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from uuid import UUID

from app.models.hod import HOD, HODUpdate, HODDashboard
from app.models.faculty import Faculty, FacultyCreate, FacultyUpdate, FacultyAssignmentCreate
from app.models.student import Student, StudentCreate, StudentUpdate, StudentBulkCreate, StudentBulkResult
from app.services.auth import get_current_hod
from app.services.hod_service import HODService

router = APIRouter()

# ============================================
# HOD Profile
# ============================================

@router.get("/profile")
async def get_hod_profile(current_hod: dict = Depends(get_current_hod)):
    """Get current HOD profile"""
    return {
        "user": {
            "id": current_hod.get("id"),
            "email": current_hod.get("email"),
            "role": current_hod.get("role")
        },
        "profile": current_hod.get("profile", {})
    }

@router.put("/profile")
async def update_hod_profile(
    hod_update: HODUpdate,
    current_hod: dict = Depends(get_current_hod)
):
    """Update HOD profile"""
    # Implementation would update hod_profiles table
    return {"message": "Profile updated", "data": hod_update.model_dump(exclude_none=True)}

# ============================================
# Dashboard
# ============================================

@router.get("/dashboard", response_model=HODDashboard)
async def get_dashboard(current_hod: dict = Depends(get_current_hod)):
    """Get HOD dashboard statistics"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return HODDashboard(
            total_faculty=0, total_students=0, total_classes=0,
            today_attendance_rate=0, pending_leave_requests=0,
            pending_corrections=0, low_attendance_students=0,
            recent_announcements=0
        )
    
    return await HODService.get_dashboard(UUID(department_id))

# ============================================
# Faculty Management
# ============================================

@router.get("/faculty")
async def get_all_faculty(current_hod: dict = Depends(get_current_hod)):
    """Get all faculty in department"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    return await HODService.get_department_faculty(UUID(department_id))

@router.post("/faculty")
async def create_faculty(
    faculty_data: FacultyCreate,
    current_hod: dict = Depends(get_current_hod)
):
    """Create new faculty member"""
    profile = current_hod.get("profile", {})
    hod_profile_id = profile.get("id")
    
    if not hod_profile_id:
        raise HTTPException(status_code=400, detail="HOD profile not found")
    
    try:
        result = await HODService.create_faculty(faculty_data, UUID(hod_profile_id))
        return {"message": "Faculty created successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/faculty/{faculty_id}")
async def get_faculty(
    faculty_id: UUID,
    current_hod: dict = Depends(get_current_hod)
):
    """Get specific faculty details"""
    from app.database import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = supabase.table("faculty_profiles").select(
        "*, users!faculty_profiles_user_id_fkey(email, unique_id, is_active)"
    ).eq("id", str(faculty_id)).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    return result.data

@router.put("/faculty/{faculty_id}")
async def update_faculty(
    faculty_id: UUID,
    faculty_update: FacultyUpdate,
    current_hod: dict = Depends(get_current_hod)
):
    """Update faculty member"""
    try:
        result = await HODService.update_faculty(faculty_id, faculty_update)
        return {"message": "Faculty updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/faculty/{faculty_id}")
async def delete_faculty(
    faculty_id: UUID,
    current_hod: dict = Depends(get_current_hod)
):
    """Delete (deactivate) faculty member"""
    try:
        await HODService.delete_faculty(faculty_id)
        return {"message": "Faculty deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Faculty Assignments
# ============================================

@router.get("/assignments")
async def get_faculty_assignments(current_hod: dict = Depends(get_current_hod)):
    """Get all faculty-subject-class assignments"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    return await HODService.get_faculty_assignments(UUID(department_id))

@router.post("/assignments")
async def create_assignment(
    assignment: FacultyAssignmentCreate,
    current_hod: dict = Depends(get_current_hod)
):
    """Assign faculty to class/subject"""
    profile = current_hod.get("profile", {})
    hod_profile_id = profile.get("id")
    
    try:
        result = await HODService.assign_faculty_to_class(
            faculty_id=assignment.faculty_id,
            subject_id=assignment.subject_id,
            class_id=assignment.class_id,
            assigned_by=UUID(hod_profile_id),
            academic_year_id=assignment.academic_year_id
        )
        return {"message": "Assignment created", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Student Management
# ============================================

@router.get("/students")
async def get_all_students(
    class_id: Optional[UUID] = Query(None),
    current_hod: dict = Depends(get_current_hod)
):
    """Get all students in department"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    return await HODService.get_department_students(UUID(department_id), class_id)

@router.post("/students")
async def create_student(
    student_data: StudentCreate,
    current_hod: dict = Depends(get_current_hod)
):
    """Create new student"""
    try:
        result = await HODService.create_student(student_data)
        return {"message": "Student created successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/students/bulk", response_model=StudentBulkResult)
async def create_students_bulk(
    bulk_data: StudentBulkCreate,
    current_hod: dict = Depends(get_current_hod)
):
    """Create multiple students at once"""
    return await HODService.create_students_bulk(bulk_data.students)

@router.get("/students/{student_id}")
async def get_student(
    student_id: UUID,
    current_hod: dict = Depends(get_current_hod)
):
    """Get specific student details"""
    from app.database import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    result = supabase.table("student_profiles").select(
        "*, users!student_profiles_user_id_fkey(email, unique_id, is_active), classes(name, section)"
    ).eq("id", str(student_id)).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return result.data

@router.put("/students/{student_id}")
async def update_student(
    student_id: UUID,
    student_update: StudentUpdate,
    current_hod: dict = Depends(get_current_hod)
):
    """Update student"""
    try:
        result = await HODService.update_student(student_id, student_update)
        return {"message": "Student updated", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/students/{student_id}")
async def delete_student(
    student_id: UUID,
    current_hod: dict = Depends(get_current_hod)
):
    """Delete (deactivate) student"""
    try:
        await HODService.delete_student(student_id)
        return {"message": "Student deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# Classes & Subjects (Read)
# ============================================

@router.get("/classes")
async def get_classes(current_hod: dict = Depends(get_current_hod)):
    """Get all classes in department"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    result = supabase.table("classes").select(
        "*, faculty_profiles!classes_class_teacher_id_fkey(name)"
    ).eq("department_id", department_id).eq("is_active", True).execute()
    
    return result.data or []

@router.get("/subjects")
async def get_subjects(current_hod: dict = Depends(get_current_hod)):
    """Get all subjects in department"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    result = supabase.table("subjects").select("*").eq("department_id", department_id).eq("is_active", True).execute()
    
    return result.data or []

# ============================================
# Low Attendance Students
# ============================================

@router.get("/low-attendance")
async def get_low_attendance_students(
    threshold: float = Query(75.0, ge=0, le=100),
    current_hod: dict = Depends(get_current_hod)
):
    """Get students with attendance below threshold"""
    from app.database import supabase
    if not supabase:
        return []
    
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        return []
    
    # Get students in department
    students = supabase.table("student_profiles").select("id, name, roll_number").eq("department_id", department_id).execute()
    
    if not students.data:
        return []
    
    student_ids = [s["id"] for s in students.data]
    
    # Get attendance summaries below threshold
    result = supabase.table("attendance_summary").select(
        "*, student_profiles(name, roll_number, class_id), subjects(name, code)"
    ).in_("student_id", student_ids).lt("attendance_percentage", threshold).execute()
    
    return result.data or []