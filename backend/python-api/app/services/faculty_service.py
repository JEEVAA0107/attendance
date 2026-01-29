"""
SmartAttend Hub - Faculty Service
Business logic for Faculty operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from uuid import UUID

from app.database import supabase
from app.models.attendance import (
    AttendanceSessionCreate, AttendanceSession, 
    AttendanceMarkBulk, AttendanceRecord, AttendanceStatus,
    LeaveRequest, LeaveRequestReview, RequestStatus,
    AttendanceCorrection, AttendanceCorrectionReview
)
from app.models.faculty import FacultyDashboard

class FacultyService:
    """Service for Faculty operations"""
    
    # ============================================
    # Assigned Classes & Students
    # ============================================
    
    @staticmethod
    async def get_assigned_classes(faculty_id: UUID) -> List[Dict]:
        """Get classes assigned to faculty"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("faculty_assignments").select(
                "*, classes(id, name, section, batch_year, semester, room_number), subjects(id, name, code)"
            ).eq("faculty_id", str(faculty_id)).eq("is_active", True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting assigned classes: {e}")
            return []
    
    @staticmethod
    async def get_class_students(faculty_id: UUID, class_id: UUID) -> List[Dict]:
        """Get students in a class (only if faculty is assigned)"""
        if not supabase:
            return []
        
        try:
            # Verify faculty is assigned to this class
            assignment = supabase.table("faculty_assignments").select("id").eq("faculty_id", str(faculty_id)).eq("class_id", str(class_id)).eq("is_active", True).execute()
            
            if not assignment.data:
                raise Exception("Not authorized to view this class")
            
            result = supabase.table("student_profiles").select(
                "*, users!student_profiles_user_id_fkey(unique_id)"
            ).eq("class_id", str(class_id)).order("roll_number").execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting students: {e}")
            return []
    
    # ============================================
    # Attendance Session Management
    # ============================================
    
    @staticmethod
    async def create_session(faculty_id: UUID, session_data: AttendanceSessionCreate) -> Dict:
        """Create new attendance session"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Verify faculty is assigned
            assignment = supabase.table("faculty_assignments").select("id").eq("faculty_id", str(faculty_id)).eq("class_id", str(session_data.class_id)).eq("subject_id", str(session_data.subject_id)).eq("is_active", True).execute()
            
            if not assignment.data:
                raise Exception("Not authorized to create session for this class/subject")
            
            result = supabase.table("attendance_sessions").insert({
                "class_id": str(session_data.class_id),
                "subject_id": str(session_data.subject_id),
                "faculty_id": str(faculty_id),
                "timetable_id": str(session_data.timetable_id) if session_data.timetable_id else None,
                "session_date": session_data.session_date.isoformat(),
                "start_time": session_data.start_time.isoformat(),
                "end_time": session_data.end_time.isoformat() if session_data.end_time else None,
                "status": "in_progress",
                "notes": session_data.notes
            }).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to create session: {str(e)}")
    
    @staticmethod
    async def get_today_sessions(faculty_id: UUID) -> List[Dict]:
        """Get today's sessions for faculty"""
        if not supabase:
            return []
        
        try:
            today = date.today().isoformat()
            result = supabase.table("attendance_sessions").select(
                "*, classes(name, section), subjects(name, code)"
            ).eq("faculty_id", str(faculty_id)).eq("session_date", today).order("start_time").execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting sessions: {e}")
            return []
    
    @staticmethod
    async def complete_session(faculty_id: UUID, session_id: UUID) -> Dict:
        """Mark session as completed"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            result = supabase.table("attendance_sessions").update({
                "status": "completed",
                "end_time": datetime.now().time().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", str(session_id)).eq("faculty_id", str(faculty_id)).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to complete session: {str(e)}")
    
    # ============================================
    # Attendance Marking
    # ============================================
    
    @staticmethod
    async def mark_attendance_bulk(faculty_id: UUID, bulk_data: AttendanceMarkBulk) -> Dict:
        """Mark attendance for multiple students"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Verify session belongs to faculty
            session = supabase.table("attendance_sessions").select("id").eq("id", str(bulk_data.session_id)).eq("faculty_id", str(faculty_id)).single().execute()
            
            if not session.data:
                raise Exception("Session not found or unauthorized")
            
            records_to_insert = []
            for record in bulk_data.records:
                records_to_insert.append({
                    "session_id": str(bulk_data.session_id),
                    "student_id": str(record.student_id),
                    "status": record.status.value,
                    "marked_by": str(faculty_id),
                    "unique_id_verified": record.unique_id_verified,
                    "verification_timestamp": datetime.utcnow().isoformat() if record.unique_id_verified else None,
                    "notes": record.notes,
                    "latitude": record.latitude,
                    "longitude": record.longitude
                })
            
            # Upsert records (update if exists)
            result = supabase.table("attendance_records").upsert(
                records_to_insert,
                on_conflict="session_id,student_id"
            ).execute()
            
            return {
                "success": True,
                "marked": len(result.data or []),
                "session_id": str(bulk_data.session_id)
            }
        except Exception as e:
            raise Exception(f"Failed to mark attendance: {str(e)}")
    
    @staticmethod
    async def get_session_attendance(faculty_id: UUID, session_id: UUID) -> List[Dict]:
        """Get attendance records for a session"""
        if not supabase:
            return []
        
        try:
            # Verify session belongs to faculty
            session = supabase.table("attendance_sessions").select("id").eq("id", str(session_id)).eq("faculty_id", str(faculty_id)).single().execute()
            
            if not session.data:
                raise Exception("Session not found or unauthorized")
            
            result = supabase.table("attendance_records").select(
                "*, student_profiles(name, roll_number, profile_picture_url)"
            ).eq("session_id", str(session_id)).order("marked_at").execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error getting attendance: {e}")
            return []
    
    # ============================================
    # Leave Requests Management
    # ============================================
    
    @staticmethod
    async def get_pending_leave_requests(faculty_id: UUID) -> List[Dict]:
        """Get pending leave requests for faculty's classes"""
        if not supabase:
            return []
        
        try:
            # Get class IDs faculty is assigned to
            assignments = supabase.table("faculty_assignments").select("class_id").eq("faculty_id", str(faculty_id)).eq("is_active", True).execute()
            
            if not assignments.data:
                return []
            
            class_ids = [a["class_id"] for a in assignments.data]
            
            # Get students in those classes
            students = supabase.table("student_profiles").select("id").in_("class_id", class_ids).execute()
            if not students.data:
                return []
            
            student_ids = [s["id"] for s in students.data]
            
            # Get pending requests
            result = supabase.table("leave_requests").select(
                "*, student_profiles(name, roll_number, class_id)"
            ).in_("student_id", student_ids).eq("status", "pending").order("created_at", desc=True).execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error getting leave requests: {e}")
            return []
    
    @staticmethod
    async def review_leave_request(faculty_id: UUID, request_id: UUID, review: LeaveRequestReview) -> Dict:
        """Review (approve/reject) leave request"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            result = supabase.table("leave_requests").update({
                "status": review.status.value,
                "reviewed_by": str(faculty_id),
                "reviewed_at": datetime.utcnow().isoformat(),
                "review_notes": review.review_notes
            }).eq("id", str(request_id)).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to review request: {str(e)}")
    
    # ============================================
    # Attendance Corrections
    # ============================================
    
    @staticmethod
    async def get_pending_corrections(faculty_id: UUID) -> List[Dict]:
        """Get pending correction requests for faculty's sessions"""
        if not supabase:
            return []
        
        try:
            # Get session IDs for faculty
            sessions = supabase.table("attendance_sessions").select("id").eq("faculty_id", str(faculty_id)).execute()
            
            if not sessions.data:
                return []
            
            session_ids = [s["id"] for s in sessions.data]
            
            result = supabase.table("attendance_corrections").select(
                "*, student_profiles(name, roll_number), attendance_sessions(session_date, subjects(name))"
            ).in_("session_id", session_ids).eq("status", "pending").order("created_at", desc=True).execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error getting corrections: {e}")
            return []
    
    @staticmethod
    async def review_correction(faculty_id: UUID, correction_id: UUID, review: AttendanceCorrectionReview) -> Dict:
        """Review correction request and update attendance if approved"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Get correction details
            correction = supabase.table("attendance_corrections").select("*").eq("id", str(correction_id)).single().execute()
            
            if not correction.data:
                raise Exception("Correction not found")
            
            # Update correction status
            result = supabase.table("attendance_corrections").update({
                "status": review.status.value,
                "reviewed_by": str(faculty_id),
                "reviewed_at": datetime.utcnow().isoformat(),
                "review_notes": review.review_notes
            }).eq("id", str(correction_id)).execute()
            
            # If approved, update the attendance record
            if review.status == RequestStatus.APPROVED and correction.data.get("attendance_id"):
                supabase.table("attendance_records").update({
                    "status": correction.data["requested_status"],
                    "updated_at": datetime.utcnow().isoformat()
                }).eq("id", correction.data["attendance_id"]).execute()
            
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to review correction: {str(e)}")
    
    # ============================================
    # Dashboard
    # ============================================
    
    @staticmethod
    async def get_dashboard(faculty_id: UUID) -> FacultyDashboard:
        """Get faculty dashboard statistics"""
        if not supabase:
            return FacultyDashboard(
                assigned_classes=0, assigned_subjects=0, total_students=0,
                today_sessions=0, completed_sessions=0, pending_leave_requests=0,
                pending_corrections=0, overall_attendance_rate=0
            )
        
        try:
            fid = str(faculty_id)
            
            # Assignments
            assignments = supabase.table("faculty_assignments").select("class_id, subject_id").eq("faculty_id", fid).eq("is_active", True).execute()
            class_ids = list(set([a["class_id"] for a in (assignments.data or [])]))
            subject_ids = list(set([a["subject_id"] for a in (assignments.data or [])]))
            
            # Count students in classes
            student_count = 0
            if class_ids:
                students = supabase.table("student_profiles").select("id", count="exact").in_("class_id", class_ids).execute()
                student_count = students.count or 0
            
            # Today's sessions
            today = date.today().isoformat()
            sessions = supabase.table("attendance_sessions").select("id, status").eq("faculty_id", fid).eq("session_date", today).execute()
            today_sessions = len(sessions.data or [])
            completed_sessions = len([s for s in (sessions.data or []) if s["status"] == "completed"])
            
            # Pending requests (simplified)
            pending_leave = supabase.table("leave_requests").select("id", count="exact").eq("status", "pending").execute()
            pending_corrections = supabase.table("attendance_corrections").select("id", count="exact").eq("status", "pending").execute()
            
            # Overall attendance rate
            analytics = supabase.table("daily_analytics").select("attendance_rate").in_("class_id", class_ids).gte("date", (date.today().replace(day=1)).isoformat()).execute()
            avg_rate = sum(a.get("attendance_rate", 0) for a in (analytics.data or [])) / max(len(analytics.data or []), 1)
            
            return FacultyDashboard(
                assigned_classes=len(class_ids),
                assigned_subjects=len(subject_ids),
                total_students=student_count,
                today_sessions=today_sessions,
                completed_sessions=completed_sessions,
                pending_leave_requests=pending_leave.count or 0,
                pending_corrections=pending_corrections.count or 0,
                overall_attendance_rate=round(avg_rate, 2)
            )
        except Exception as e:
            print(f"Dashboard error: {e}")
            return FacultyDashboard(
                assigned_classes=0, assigned_subjects=0, total_students=0,
                today_sessions=0, completed_sessions=0, pending_leave_requests=0,
                pending_corrections=0, overall_attendance_rate=0
            )
