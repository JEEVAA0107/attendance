"""
SmartAttend Hub - Analytics API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID
from datetime import date

from app.services.auth import get_current_user, get_current_hod, get_current_faculty
from app.services.analytics_service import AnalyticsService

router = APIRouter()

# ============================================
# Department Analytics (HOD Only)
# ============================================

@router.get("/department/overview")
async def get_department_overview(current_hod: dict = Depends(get_current_hod)):
    """Get department-wide analytics overview"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        raise HTTPException(status_code=400, detail="Department not found")
    
    return await AnalyticsService.get_department_overview(UUID(department_id))

@router.get("/department/trends")
async def get_department_trends(
    days: int = Query(30, ge=7, le=90),
    current_hod: dict = Depends(get_current_hod)
):
    """Get department attendance trends"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        raise HTTPException(status_code=400, detail="Department not found")
    
    return await AnalyticsService.get_department_trends(UUID(department_id), days)

@router.get("/department/class-comparison")
async def get_class_comparison(current_hod: dict = Depends(get_current_hod)):
    """Compare attendance across classes"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        raise HTTPException(status_code=400, detail="Department not found")
    
    return await AnalyticsService.get_class_comparison(UUID(department_id))

@router.get("/department/at-risk")
async def get_department_at_risk(
    threshold: float = Query(75.0, ge=0, le=100),
    current_hod: dict = Depends(get_current_hod)
):
    """Get at-risk students in department"""
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    if not department_id:
        raise HTTPException(status_code=400, detail="Department not found")
    
    return await AnalyticsService.get_at_risk_students(
        department_id=UUID(department_id),
        threshold=threshold
    )

# ============================================
# Class Analytics (Faculty)
# ============================================

@router.get("/class/{class_id}/overview")
async def get_class_overview(
    class_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get class attendance overview"""
    return await AnalyticsService.get_class_overview(class_id)

@router.get("/class/{class_id}/rankings")
async def get_class_rankings(
    class_id: UUID,
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get students ranked by attendance"""
    return await AnalyticsService.get_class_student_rankings(class_id)

@router.get("/class/{class_id}/at-risk")
async def get_class_at_risk(
    class_id: UUID,
    threshold: float = Query(75.0, ge=0, le=100),
    current_faculty: dict = Depends(get_current_faculty)
):
    """Get at-risk students in class"""
    return await AnalyticsService.get_at_risk_students(
        class_id=class_id,
        threshold=threshold
    )

# ============================================
# Student Analytics
# ============================================

@router.get("/student/{student_id}")
async def get_student_analytics(
    student_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive student analytics"""
    # Students can only view their own analytics
    if current_user.get("role") == "student":
        from app.database import supabase
        if supabase:
            student = supabase.table("student_profiles").select("id").eq("user_id", current_user["id"]).single().execute()
            if student.data and str(student.data["id"]) != str(student_id):
                raise HTTPException(status_code=403, detail="Can only view own analytics")
    
    return await AnalyticsService.get_student_analytics(student_id)

# ============================================
# Admin Operations
# ============================================

@router.post("/update-daily")
async def trigger_daily_update(
    analytics_date: Optional[date] = None,
    current_hod: dict = Depends(get_current_hod)
):
    """Manually trigger daily analytics update"""
    success = await AnalyticsService.update_daily_analytics(analytics_date)
    
    if success:
        return {"message": "Daily analytics updated", "date": (analytics_date or date.today()).isoformat()}
    else:
        raise HTTPException(status_code=500, detail="Failed to update analytics")
