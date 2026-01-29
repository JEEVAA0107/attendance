"""
SmartAttend Hub - n8n Webhook Integration Routes
Endpoints for n8n automation workflows
"""
from fastapi import APIRouter, HTTPException, Request, Header
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel

from app.config import settings
from app.database import supabase
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService

router = APIRouter()

# ============================================
# Webhook Request/Response Models
# ============================================

class AttendanceWebhookPayload(BaseModel):
    """Payload for attendance marking webhook"""
    session_id: str
    class_id: str
    subject_name: str
    faculty_name: str
    total_present: int
    total_absent: int
    absent_students: List[dict]  # [{name, roll_number, parent_phone}]
    timestamp: str

class LowAttendancePayload(BaseModel):
    """Payload for low attendance alert webhook"""
    student_id: str
    student_name: str
    roll_number: str
    subject_name: str
    attendance_percentage: float
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None

class RequestStatusPayload(BaseModel):
    """Payload for leave/correction status webhook"""
    request_type: str  # 'leave' or 'correction'
    request_id: str
    student_id: str
    student_name: str
    status: str  # 'approved' or 'rejected'
    faculty_name: str
    notes: Optional[str] = None
    parent_phone: Optional[str] = None

class DailyReportPayload(BaseModel):
    """Payload for daily report webhook"""
    date: str
    department_name: str
    total_sessions: int
    total_students: int
    present_count: int
    absent_count: int
    attendance_rate: float
    low_attendance_students: List[dict]

# ============================================
# Webhook Security
# ============================================

def verify_webhook_secret(x_webhook_secret: Optional[str] = Header(None)) -> bool:
    """Verify webhook secret for security"""
    expected_secret = getattr(settings, 'WEBHOOK_SECRET', None)
    if expected_secret and x_webhook_secret != expected_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return True

# ============================================
# Incoming Webhooks (from n8n to API)
# ============================================

@router.post("/attendance-complete")
async def webhook_attendance_complete(
    payload: AttendanceWebhookPayload,
    _: bool = Header(None, alias="X-Webhook-Secret")
):
    """
    Called by n8n after attendance is marked
    Triggers SMS notifications to absent students' parents
    """
    try:
        notifications_sent = 0
        
        for student in payload.absent_students:
            if student.get("parent_phone"):
                # Queue SMS notification
                success = await NotificationService.queue_sms(
                    recipient_id=student.get("student_id"),
                    title="Attendance Alert",
                    message=f"{student['name']} was absent in {payload.subject_name} class on {payload.timestamp}",
                    phone=student["parent_phone"]
                )
                if success:
                    notifications_sent += 1
        
        return {
            "status": "success",
            "message": f"Processed {len(payload.absent_students)} absent students",
            "notifications_sent": notifications_sent
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/low-attendance-alert")
async def webhook_low_attendance(
    payload: LowAttendancePayload,
    _: bool = Header(None, alias="X-Webhook-Secret")
):
    """
    Called by n8n when student attendance drops below threshold
    Sends alert to student and parent
    """
    try:
        from uuid import UUID
        
        # Send notification to student
        await NotificationService.send_attendance_alert(
            student_id=UUID(payload.student_id),
            subject_name=payload.subject_name,
            attendance_percentage=payload.attendance_percentage,
            send_to_parent=bool(payload.parent_phone)
        )
        
        return {
            "status": "success",
            "message": f"Alert sent for {payload.student_name}",
            "attendance": payload.attendance_percentage
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/request-status")
async def webhook_request_status(
    payload: RequestStatusPayload,
    _: bool = Header(None, alias="X-Webhook-Secret")
):
    """
    Called by n8n when leave/correction request status changes
    Notifies student and optionally parent
    """
    try:
        from uuid import UUID
        
        # Notify student
        await NotificationService.notify_request_status(
            student_id=UUID(payload.student_id),
            request_type=payload.request_type,
            status=payload.status,
            notes=payload.notes
        )
        
        return {
            "status": "success",
            "message": f"Notification sent for {payload.request_type} request"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# Outgoing Data Endpoints (for n8n to fetch)
# ============================================

@router.get("/data/daily-summary")
async def get_daily_summary(
    date_str: Optional[str] = None,
    department_id: Optional[str] = None
):
    """
    Get daily attendance summary for n8n reporting workflow
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        target_date = date_str or date.today().isoformat()
        
        query = supabase.table("daily_analytics").select(
            "*, departments(name)"
        ).eq("date", target_date)
        
        if department_id:
            query = query.eq("department_id", department_id)
        
        result = query.execute()
        
        # Aggregate data
        total_present = sum(r.get("present_count", 0) for r in (result.data or []))
        total_absent = sum(r.get("absent_count", 0) for r in (result.data or []))
        total_students = total_present + total_absent
        avg_rate = (total_present / total_students * 100) if total_students > 0 else 0
        
        return {
            "date": target_date,
            "total_classes": len(result.data or []),
            "total_present": total_present,
            "total_absent": total_absent,
            "average_attendance_rate": round(avg_rate, 2),
            "by_class": result.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/low-attendance-students")
async def get_low_attendance_for_n8n(
    threshold: float = 75.0,
    department_id: Optional[str] = None
):
    """
    Get students with low attendance for n8n alert workflow
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        query = supabase.table("attendance_summary").select(
            "*, student_profiles(id, name, roll_number, parent_phone, parent_email, department_id), subjects(name)"
        ).lt("attendance_percentage", threshold)
        
        result = query.execute()
        
        students = []
        for record in (result.data or []):
            student = record.get("student_profiles", {})
            if department_id and student.get("department_id") != department_id:
                continue
            
            students.append({
                "student_id": student.get("id"),
                "student_name": student.get("name"),
                "roll_number": student.get("roll_number"),
                "subject_name": record.get("subjects", {}).get("name"),
                "attendance_percentage": record.get("attendance_percentage"),
                "parent_phone": student.get("parent_phone"),
                "parent_email": student.get("parent_email")
            })
        
        return {
            "threshold": threshold,
            "count": len(students),
            "students": students
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/pending-requests")
async def get_pending_requests_for_n8n():
    """
    Get pending leave and correction requests for n8n reminder workflow
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        # Get pending leave requests
        leaves = supabase.table("leave_requests").select(
            "id, start_date, end_date, reason, created_at, student_profiles(name, roll_number)"
        ).eq("status", "pending").execute()
        
        # Get pending corrections
        corrections = supabase.table("attendance_corrections").select(
            "id, reason, created_at, student_profiles(name, roll_number)"
        ).eq("status", "pending").execute()
        
        return {
            "pending_leaves": len(leaves.data or []),
            "pending_corrections": len(corrections.data or []),
            "leaves": leaves.data or [],
            "corrections": corrections.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/sms-queue")
async def get_sms_queue():
    """
    Get pending SMS messages for n8n SMS sending workflow
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        result = supabase.table("sms_queue").select("*").eq("status", "pending").limit(50).execute()
        
        return {
            "count": len(result.data or []),
            "messages": result.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/data/sms-queue/{sms_id}/sent")
async def mark_sms_sent(sms_id: str):
    """
    Mark SMS as sent after n8n sends it
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        result = supabase.table("sms_queue").update({
            "status": "sent",
            "sent_at": datetime.utcnow().isoformat()
        }).eq("id", sms_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="SMS not found")
        
        return {"status": "success", "message": "SMS marked as sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# Trigger Endpoints (API to trigger n8n)
# ============================================

@router.post("/trigger/daily-report")
async def trigger_daily_report():
    """
    Trigger n8n to generate and send daily report
    """
    import httpx
    
    if not settings.SMS_WEBHOOK_URL:
        return {"status": "skipped", "message": "n8n webhook not configured"}
    
    try:
        # Get today's summary
        summary = await get_daily_summary()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.SMS_WEBHOOK_URL.replace("/sms", "/daily-report"),
                json={
                    "type": "daily_report",
                    "data": summary,
                    "timestamp": datetime.utcnow().isoformat()
                },
                timeout=30.0
            )
        
        return {
            "status": "triggered",
            "webhook_status": response.status_code
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/trigger/low-attendance-alerts")
async def trigger_low_attendance_alerts(threshold: float = 75.0):
    """
    Trigger n8n to send low attendance alerts
    """
    import httpx
    
    if not settings.SMS_WEBHOOK_URL:
        return {"status": "skipped", "message": "n8n webhook not configured"}
    
    try:
        # Get low attendance students
        students = await get_low_attendance_for_n8n(threshold)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.SMS_WEBHOOK_URL.replace("/sms", "/low-attendance"),
                json={
                    "type": "low_attendance_batch",
                    "data": students,
                    "timestamp": datetime.utcnow().isoformat()
                },
                timeout=30.0
            )
        
        return {
            "status": "triggered",
            "students_count": students["count"],
            "webhook_status": response.status_code
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
