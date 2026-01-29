"""
SmartAttend Hub - Notification Service
Handles SMS, Email, and Push notifications
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
import httpx

from app.database import supabase
from app.config import settings
from app.models.notification import NotificationCreate, NotificationType, NotificationPriority

class NotificationService:
    """Service for all notification types"""
    
    # ============================================
    # In-App Notifications
    # ============================================
    
    @staticmethod
    async def create_notification(
        recipient_id: UUID,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        sender_id: Optional[UUID] = None,
        action_url: Optional[str] = None,
        metadata: Optional[dict] = None,
        send_sms: bool = False
    ) -> Dict:
        """Create in-app notification"""
        if not supabase:
            return {"error": "Database unavailable"}
        
        try:
            notification_data = {
                "recipient_id": str(recipient_id),
                "title": title,
                "message": message,
                "type": notification_type.value,
                "priority": priority.value,
                "action_url": action_url,
                "metadata": metadata or {}
            }
            
            if sender_id:
                notification_data["sender_id"] = str(sender_id)
            
            result = supabase.table("notifications").insert(notification_data).execute()
            
            # Queue SMS if requested
            if send_sms:
                await NotificationService.queue_sms(recipient_id, title, message)
            
            return result.data[0] if result.data else {}
        except Exception as e:
            print(f"Notification error: {e}")
            return {"error": str(e)}
    
    @staticmethod
    async def create_bulk_notifications(
        recipient_ids: List[UUID],
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        sender_id: Optional[UUID] = None
    ) -> int:
        """Create notifications for multiple recipients"""
        if not supabase:
            return 0
        
        try:
            notifications = [
                {
                    "recipient_id": str(rid),
                    "title": title,
                    "message": message,
                    "type": notification_type.value,
                    "priority": priority.value,
                    "sender_id": str(sender_id) if sender_id else None
                }
                for rid in recipient_ids
            ]
            
            result = supabase.table("notifications").insert(notifications).execute()
            return len(result.data or [])
        except Exception as e:
            print(f"Bulk notification error: {e}")
            return 0
    
    @staticmethod
    async def get_user_notifications(
        user_id: UUID, 
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for a user"""
        if not supabase:
            return []
        
        try:
            query = supabase.table("notifications").select("*").eq("recipient_id", str(user_id))
            
            if unread_only:
                query = query.eq("is_read", False)
            
            result = query.order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            print(f"Get notifications error: {e}")
            return []
    
    @staticmethod
    async def mark_as_read(user_id: UUID, notification_ids: List[UUID]) -> int:
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
            print(f"Mark read error: {e}")
            return 0
    
    @staticmethod
    async def get_unread_count(user_id: UUID) -> int:
        """Get unread notification count"""
        if not supabase:
            return 0
        
        try:
            result = supabase.table("notifications").select("id", count="exact").eq("recipient_id", str(user_id)).eq("is_read", False).execute()
            return result.count or 0
        except Exception:
            return 0
    
    # ============================================
    # SMS Notifications (via n8n webhook)
    # ============================================
    
    @staticmethod
    async def queue_sms(
        recipient_id: UUID,
        title: str,
        message: str,
        phone: Optional[str] = None
    ) -> bool:
        """Queue SMS for sending via n8n webhook"""
        if not supabase:
            return False
        
        try:
            # Get recipient phone if not provided
            if not phone:
                # Try student profile first
                student = supabase.table("student_profiles").select("phone, parent_phone").eq("user_id", str(recipient_id)).single().execute()
                if student.data:
                    phone = student.data.get("parent_phone") or student.data.get("phone")
                else:
                    # Try faculty profile
                    faculty = supabase.table("faculty_profiles").select("phone").eq("user_id", str(recipient_id)).single().execute()
                    if faculty.data:
                        phone = faculty.data.get("phone")
            
            if not phone:
                print(f"No phone number for recipient {recipient_id}")
                return False
            
            # Queue in sms_queue table
            sms_data = {
                "recipient_id": str(recipient_id),
                "phone_number": phone,
                "message": f"{title}: {message}",
                "status": "pending"
            }
            
            supabase.table("sms_queue").insert(sms_data).execute()
            
            # Trigger n8n webhook if configured
            if settings.SMS_WEBHOOK_URL and settings.SMS_ENABLED:
                await NotificationService._send_sms_webhook(phone, title, message)
            
            return True
        except Exception as e:
            print(f"SMS queue error: {e}")
            return False
    
    @staticmethod
    async def _send_sms_webhook(phone: str, title: str, message: str) -> bool:
        """Send SMS via n8n webhook"""
        if not settings.SMS_WEBHOOK_URL:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.SMS_WEBHOOK_URL,
                    json={
                        "phone": phone,
                        "title": title,
                        "message": message,
                        "timestamp": datetime.utcnow().isoformat()
                    },
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception as e:
            print(f"SMS webhook error: {e}")
            return False
    
    # ============================================
    # Attendance Alerts
    # ============================================
    
    @staticmethod
    async def send_attendance_alert(
        student_id: UUID,
        subject_name: str,
        attendance_percentage: float,
        send_to_parent: bool = True
    ) -> bool:
        """Send low attendance alert"""
        if not supabase:
            return False
        
        try:
            # Get student info
            student = supabase.table("student_profiles").select(
                "user_id, name, parent_phone, parent_email"
            ).eq("id", str(student_id)).single().execute()
            
            if not student.data:
                return False
            
            title = "⚠️ Low Attendance Alert"
            message = f"Your attendance in {subject_name} is {attendance_percentage:.1f}% (below 75% threshold)"
            
            # Notify student
            await NotificationService.create_notification(
                recipient_id=UUID(student.data["user_id"]),
                title=title,
                message=message,
                notification_type=NotificationType.WARNING,
                priority=NotificationPriority.HIGH
            )
            
            # Send SMS to parent
            if send_to_parent and student.data.get("parent_phone"):
                parent_message = f"{student.data['name']}'s attendance in {subject_name} is {attendance_percentage:.1f}%"
                await NotificationService.queue_sms(
                    recipient_id=UUID(student.data["user_id"]),
                    title="Low Attendance Alert",
                    message=parent_message,
                    phone=student.data["parent_phone"]
                )
            
            return True
        except Exception as e:
            print(f"Attendance alert error: {e}")
            return False
    
    @staticmethod
    async def send_attendance_marked_notification(
        student_id: UUID,
        subject_name: str,
        status: str,
        session_date: str
    ) -> bool:
        """Notify student of attendance marked"""
        if not supabase:
            return False
        
        try:
            student = supabase.table("student_profiles").select("user_id").eq("id", str(student_id)).single().execute()
            
            if not student.data:
                return False
            
            status_emoji = "✅" if status == "present" else "❌" if status == "absent" else "⏰"
            title = f"{status_emoji} Attendance Marked"
            message = f"You were marked {status} for {subject_name} on {session_date}"
            
            await NotificationService.create_notification(
                recipient_id=UUID(student.data["user_id"]),
                title=title,
                message=message,
                notification_type=NotificationType.ATTENDANCE
            )
            
            return True
        except Exception as e:
            print(f"Attendance marked notification error: {e}")
            return False
    
    # ============================================
    # Request Notifications
    # ============================================
    
    @staticmethod
    async def notify_request_status(
        student_id: UUID,
        request_type: str,  # 'leave' or 'correction'
        status: str,  # 'approved', 'rejected'
        notes: Optional[str] = None
    ) -> bool:
        """Notify student of request status change"""
        if not supabase:
            return False
        
        try:
            student = supabase.table("student_profiles").select("user_id").eq("id", str(student_id)).single().execute()
            
            if not student.data:
                return False
            
            status_emoji = "✅" if status == "approved" else "❌"
            title = f"{status_emoji} {request_type.title()} Request {status.title()}"
            message = f"Your {request_type} request has been {status}"
            if notes:
                message += f". Note: {notes}"
            
            await NotificationService.create_notification(
                recipient_id=UUID(student.data["user_id"]),
                title=title,
                message=message,
                notification_type=NotificationType.REQUEST,
                priority=NotificationPriority.HIGH if status == "rejected" else NotificationPriority.NORMAL
            )
            
            return True
        except Exception as e:
            print(f"Request notification error: {e}")
            return False
    
    @staticmethod
    async def notify_pending_request(
        faculty_id: UUID,
        student_name: str,
        request_type: str
    ) -> bool:
        """Notify faculty of new pending request"""
        if not supabase:
            return False
        
        try:
            faculty = supabase.table("faculty_profiles").select("user_id").eq("id", str(faculty_id)).single().execute()
            
            if not faculty.data:
                return False
            
            title = f"📝 New {request_type.title()} Request"
            message = f"{student_name} has submitted a {request_type} request for your review"
            
            await NotificationService.create_notification(
                recipient_id=UUID(faculty.data["user_id"]),
                title=title,
                message=message,
                notification_type=NotificationType.REQUEST,
                action_url=f"/faculty/{request_type}-requests"
            )
            
            return True
        except Exception as e:
            print(f"Pending request notification error: {e}")
            return False
