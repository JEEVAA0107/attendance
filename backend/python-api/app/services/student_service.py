"""
SmartAttend Hub - Student Service
Business logic for Student operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

from app.database import supabase
from app.models.attendance import (
    LeaveRequestCreate, LeaveRequest,
    AttendanceCorrectionCreate, AttendanceCorrection,
    AttendanceSummary, StudentAttendanceReport
)
from app.models.student import StudentDashboard

class StudentService:
    """Service for Student operations"""
    
    # ============================================
    # Attendance Viewing
    # ============================================
    
    @staticmethod
    async def get_attendance_summary(student_id: UUID) -> List[Dict]:
        """Get attendance summary for all subjects"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("attendance_summary").select(
                "*, subjects(name, code, credits)"
            ).eq("student_id", str(student_id)).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting summary: {e}")
            return []
    
    @staticmethod
    async def get_attendance_history(
        student_id: UUID, 
        subject_id: Optional[UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get detailed attendance history"""
        if not supabase:
            return []
        
        try:
            query = supabase.table("attendance_records").select(
                "*, attendance_sessions(session_date, start_time, subjects(name, code), faculty_profiles(name))"
            ).eq("student_id", str(student_id))
            
            if subject_id:
                # Need to filter by session's subject
                sessions = supabase.table("attendance_sessions").select("id").eq("subject_id", str(subject_id)).execute()
                if sessions.data:
                    session_ids = [s["id"] for s in sessions.data]
                    query = query.in_("session_id", session_ids)
            
            result = query.order("created_at", desc=True).limit(100).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting history: {e}")
            return []
    
    @staticmethod
    async def get_attendance_report(student_id: UUID) -> StudentAttendanceReport:
        """Get complete attendance report"""
        if not supabase:
            return None
        
        try:
            # Get student info
            student = supabase.table("student_profiles").select("name, roll_number").eq("id", str(student_id)).single().execute()
            if not student.data:
                return None
            
            # Get summary
            summaries = await StudentService.get_attendance_summary(student_id)
            
            # Calculate overall
            total_classes = sum(s.get("total_classes", 0) for s in summaries)
            total_attended = sum(s.get("classes_attended", 0) for s in summaries)
            overall_pct = (total_attended / total_classes * 100) if total_classes > 0 else 0
            
            # Determine risk level
            if overall_pct >= 85:
                risk = "low"
            elif overall_pct >= 75:
                risk = "medium"
            elif overall_pct >= 60:
                risk = "high"
            else:
                risk = "critical"
            
            # Monthly trend (last 6 months)
            monthly_trend = []
            # Simplified - would need proper aggregation in production
            
            return StudentAttendanceReport(
                student_id=student_id,
                student_name=student.data["name"],
                roll_number=student.data["roll_number"],
                overall_percentage=round(overall_pct, 2),
                total_classes=total_classes,
                classes_attended=total_attended,
                subject_wise=[AttendanceSummary(**s) for s in summaries],
                monthly_trend=monthly_trend,
                risk_level=risk
            )
        except Exception as e:
            print(f"Report error: {e}")
            return None
    
    # ============================================
    # Leave Requests
    # ============================================
    
    @staticmethod
    async def create_leave_request(student_id: UUID, request_data: LeaveRequestCreate) -> Dict:
        """Submit leave request"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            result = supabase.table("leave_requests").insert({
                "student_id": str(student_id),
                "leave_type": request_data.leave_type.value,
                "start_date": request_data.start_date.isoformat(),
                "end_date": request_data.end_date.isoformat(),
                "reason": request_data.reason,
                "supporting_document_url": request_data.supporting_document_url,
                "status": "pending"
            }).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to create request: {str(e)}")
    
    @staticmethod
    async def get_leave_requests(student_id: UUID) -> List[Dict]:
        """Get student's leave requests"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("leave_requests").select(
                "*, faculty_profiles!leave_requests_reviewed_by_fkey(name)"
            ).eq("student_id", str(student_id)).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting requests: {e}")
            return []
    
    @staticmethod
    async def cancel_leave_request(student_id: UUID, request_id: UUID) -> bool:
        """Cancel pending leave request"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            result = supabase.table("leave_requests").update({
                "status": "cancelled"
            }).eq("id", str(request_id)).eq("student_id", str(student_id)).eq("status", "pending").execute()
            
            return len(result.data or []) > 0
        except Exception as e:
            raise Exception(f"Failed to cancel: {str(e)}")
    
    # ============================================
    # Attendance Corrections
    # ============================================
    
    @staticmethod
    async def create_correction_request(student_id: UUID, correction_data: AttendanceCorrectionCreate) -> Dict:
        """Submit attendance correction request"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            result = supabase.table("attendance_corrections").insert({
                "student_id": str(student_id),
                "attendance_id": str(correction_data.attendance_id) if correction_data.attendance_id else None,
                "session_id": str(correction_data.session_id),
                "original_status": correction_data.original_status.value,
                "requested_status": correction_data.requested_status.value,
                "reason": correction_data.reason,
                "supporting_document_url": correction_data.supporting_document_url,
                "status": "pending"
            }).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to create correction: {str(e)}")
    
    @staticmethod
    async def get_correction_requests(student_id: UUID) -> List[Dict]:
        """Get student's correction requests"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("attendance_corrections").select(
                "*, attendance_sessions(session_date, subjects(name)), faculty_profiles!attendance_corrections_reviewed_by_fkey(name)"
            ).eq("student_id", str(student_id)).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting corrections: {e}")
            return []
    
    # ============================================
    # Notifications
    # ============================================
    
    @staticmethod
    async def get_notifications(user_id: UUID, unread_only: bool = False) -> List[Dict]:
        """Get student notifications"""
        if not supabase:
            return []
        
        try:
            query = supabase.table("notifications").select("*").eq("recipient_id", str(user_id))
            
            if unread_only:
                query = query.eq("is_read", False)
            
            result = query.order("created_at", desc=True).limit(50).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting notifications: {e}")
            return []
    
    @staticmethod
    async def mark_notifications_read(user_id: UUID, notification_ids: List[UUID]) -> int:
        """Mark notifications as read"""
        if not supabase:
            return 0
        
        try:
            ids = [str(n) for n in notification_ids]
            result = supabase.table("notifications").update({
                "is_read": True,
                "read_at": datetime.utcnow().isoformat()
            }).in_("id", ids).eq("recipient_id", str(user_id)).execute()
            
            return len(result.data or [])
        except Exception as e:
            print(f"Error marking read: {e}")
            return 0
    
    # ============================================
    # Dashboard
    # ============================================
    
    @staticmethod
    async def get_dashboard(student_id: UUID, user_id: UUID) -> StudentDashboard:
        """Get student dashboard statistics"""
        if not supabase:
            return StudentDashboard(
                overall_attendance=0, subjects_count=0, subjects_below_75=0,
                pending_leave_requests=0, pending_corrections=0,
                unread_notifications=0
            )
        
        try:
            sid = str(student_id)
            uid = str(user_id)
            
            # Get attendance summary
            summaries = await StudentService.get_attendance_summary(student_id)
            
            # Calculate overall
            total = sum(s.get("total_classes", 0) for s in summaries)
            attended = sum(s.get("classes_attended", 0) for s in summaries)
            overall = (attended / total * 100) if total > 0 else 0
            
            # Subjects below 75%
            below_75 = len([s for s in summaries if s.get("attendance_percentage", 100) < 75])
            
            # Pending requests
            leave_pending = supabase.table("leave_requests").select("id", count="exact").eq("student_id", sid).eq("status", "pending").execute()
            correction_pending = supabase.table("attendance_corrections").select("id", count="exact").eq("student_id", sid).eq("status", "pending").execute()
            
            # Unread notifications
            unread = supabase.table("notifications").select("id", count="exact").eq("recipient_id", uid).eq("is_read", False).execute()
            
            # Next class (simplified)
            next_class = None
            
            # Attendance summary for display
            attendance_summary = [
                {
                    "subject": s.get("subjects", {}).get("name", "Unknown"),
                    "percentage": s.get("attendance_percentage", 0),
                    "total": s.get("total_classes", 0),
                    "attended": s.get("classes_attended", 0)
                }
                for s in summaries
            ]
            
            return StudentDashboard(
                overall_attendance=round(overall, 2),
                subjects_count=len(summaries),
                subjects_below_75=below_75,
                pending_leave_requests=leave_pending.count or 0,
                pending_corrections=correction_pending.count or 0,
                unread_notifications=unread.count or 0,
                next_class=next_class,
                attendance_summary=attendance_summary
            )
        except Exception as e:
            print(f"Dashboard error: {e}")
            return StudentDashboard(
                overall_attendance=0, subjects_count=0, subjects_below_75=0,
                pending_leave_requests=0, pending_corrections=0,
                unread_notifications=0
            )
    
    # ============================================
    # Timetable
    # ============================================
    
    @staticmethod
    async def get_timetable(class_id: UUID) -> List[Dict]:
        """Get class timetable"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("timetable").select(
                "*, subjects(name, code), faculty_profiles(name)"
            ).eq("class_id", str(class_id)).eq("is_active", True).order("day_of_week").order("period_number").execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting timetable: {e}")
            return []
