"""
SmartAttend Hub - AI/ML API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from uuid import UUID
from datetime import date

from app.services.auth import get_current_user, get_current_hod, get_current_faculty
from app.services.ml_service import MLService

router = APIRouter()

# ============================================
# Attendance Predictions
# ============================================

@router.get("/predict/{student_id}")
async def predict_student_attendance(
    student_id: UUID,
    subject_id: Optional[UUID] = Query(None),
    prediction_date: Optional[date] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Predict attendance probability for a student
    
    Uses historical patterns, day-of-week trends, and recent behavior
    """
    result = await MLService.predict_attendance(student_id, subject_id, prediction_date)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/predict/class/{class_id}")
async def predict_class_attendance(
    class_id: UUID,
    subject_id: Optional[UUID] = Query(None),
    prediction_date: Optional[date] = Query(None),
    current_faculty: dict = Depends(get_current_faculty)
):
    """
    Predict attendance for all students in a class
    
    Returns predictions sorted by risk (highest risk first)
    """
    predictions = await MLService.batch_predict_class(class_id, subject_id, prediction_date)
    
    return {
        "class_id": str(class_id),
        "prediction_date": (prediction_date or date.today()).isoformat(),
        "total_students": len(predictions),
        "predictions": predictions
    }

# ============================================
# Anomaly Detection
# ============================================

@router.get("/anomalies")
async def get_anomalies(
    days: int = Query(7, ge=1, le=30),
    current_hod: dict = Depends(get_current_hod)
):
    """
    Detect unusual attendance patterns
    
    - Sudden student attendance drops
    - Class-wide unusual absences
    """
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    anomalies = await MLService.detect_anomalies(
        department_id=UUID(department_id) if department_id else None,
        days=days
    )
    
    return {
        "period_days": days,
        "total_anomalies": len(anomalies),
        "anomalies": anomalies
    }

@router.get("/anomalies/class/{class_id}")
async def get_class_anomalies(
    class_id: UUID,
    days: int = Query(7, ge=1, le=30),
    current_faculty: dict = Depends(get_current_faculty)
):
    """Detect anomalies for a specific class"""
    anomalies = await MLService.detect_anomalies(class_id=class_id, days=days)
    
    return {
        "class_id": str(class_id),
        "period_days": days,
        "total_anomalies": len(anomalies),
        "anomalies": anomalies
    }

# ============================================
# Risk Analysis
# ============================================

@router.get("/risk-analysis")
async def get_risk_analysis(
    threshold: float = Query(75.0, ge=0, le=100),
    current_hod: dict = Depends(get_current_hod)
):
    """
    Comprehensive risk analysis for at-risk students
    
    Returns:
    - Risk summary (critical, high, medium counts)
    - Categorized student list
    - Actionable recommendations
    """
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    analysis = await MLService.analyze_risk(
        department_id=UUID(department_id) if department_id else None,
        threshold=threshold
    )
    
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])
    
    return analysis

@router.get("/risk-analysis/class/{class_id}")
async def get_class_risk_analysis(
    class_id: UUID,
    threshold: float = Query(75.0, ge=0, le=100),
    current_faculty: dict = Depends(get_current_faculty)
):
    """Risk analysis for a specific class"""
    analysis = await MLService.analyze_risk(class_id=class_id, threshold=threshold)
    
    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])
    
    return analysis

# ============================================
# AI Insights Dashboard
# ============================================

@router.get("/insights")
async def get_ai_insights(current_hod: dict = Depends(get_current_hod)):
    """
    Get aggregated AI insights for dashboard
    
    Combines predictions, anomalies, and risk data
    """
    profile = current_hod.get("profile", {})
    department_id = profile.get("department_id")
    
    # Get all insights
    dept_uuid = UUID(department_id) if department_id else None
    
    anomalies = await MLService.detect_anomalies(department_id=dept_uuid, days=7)
    risk_analysis = await MLService.analyze_risk(department_id=dept_uuid)
    
    # Summary stats
    critical_anomalies = len([a for a in anomalies if a.get("severity") == "critical"])
    high_anomalies = len([a for a in anomalies if a.get("severity") == "high"])
    
    return {
        "summary": {
            "anomalies_detected": len(anomalies),
            "critical_anomalies": critical_anomalies,
            "high_anomalies": high_anomalies,
            "students_at_risk": risk_analysis.get("risk_summary", {}).get("total_at_risk", 0),
            "critical_students": risk_analysis.get("risk_summary", {}).get("critical", 0)
        },
        "top_anomalies": anomalies[:5],
        "top_risk_students": (risk_analysis.get("students", []))[:10],
        "recommendations": risk_analysis.get("recommendations", []),
        "generated_at": risk_analysis.get("generated_at")
    }

# ============================================
# Historical Predictions
# ============================================

@router.get("/predictions/history")
async def get_prediction_history(
    student_id: Optional[UUID] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Get historical predictions"""
    from app.database import supabase
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    query = supabase.table("attendance_predictions").select(
        "*, student_profiles(name, roll_number), subjects(name)"
    )
    
    if student_id:
        query = query.eq("student_id", str(student_id))
    
    result = query.order("created_at", desc=True).limit(limit).execute()
    
    return result.data or []

@router.get("/anomalies/history")
async def get_anomaly_history(
    resolved: Optional[bool] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_hod: dict = Depends(get_current_hod)
):
    """Get historical anomalies"""
    from app.database import supabase
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    query = supabase.table("attendance_anomalies").select("*")
    
    if resolved is not None:
        query = query.eq("is_resolved", resolved)
    if severity:
        query = query.eq("severity", severity)
    
    result = query.order("detected_at", desc=True).limit(limit).execute()
    
    return result.data or []

@router.put("/anomalies/{anomaly_id}/resolve")
async def resolve_anomaly(
    anomaly_id: UUID,
    notes: Optional[str] = None,
    current_hod: dict = Depends(get_current_hod)
):
    """Mark an anomaly as resolved"""
    from app.database import supabase
    from datetime import datetime
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    user_id = current_hod.get("id")
    
    result = supabase.table("attendance_anomalies").update({
        "is_resolved": True,
        "resolved_by": user_id,
        "resolved_at": datetime.utcnow().isoformat(),
        "resolution_notes": notes
    }).eq("id", str(anomaly_id)).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    return {"message": "Anomaly resolved", "data": result.data[0]}
