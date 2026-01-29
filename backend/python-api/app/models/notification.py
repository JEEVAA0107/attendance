"""
SmartAttend Hub - Notification Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

class NotificationType(str, Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    ATTENDANCE = "attendance"
    REQUEST = "request"
    ANNOUNCEMENT = "announcement"
    SMS = "sms"

class NotificationPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class NotificationCreate(BaseModel):
    recipient_id: UUID
    title: str = Field(..., max_length=200)
    message: str
    type: NotificationType = NotificationType.INFO
    priority: NotificationPriority = NotificationPriority.NORMAL
    action_url: Optional[str] = None
    metadata: Optional[dict] = None
    send_sms: bool = False  # Also queue SMS

class Notification(BaseModel):
    id: UUID
    recipient_id: UUID
    sender_id: Optional[UUID] = None
    title: str
    message: str
    type: NotificationType
    priority: NotificationPriority
    is_read: bool = False
    read_at: Optional[datetime] = None
    action_url: Optional[str] = None
    metadata: Optional[dict] = None
    sms_sent: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationMarkRead(BaseModel):
    notification_ids: List[UUID]

class AnnouncementCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    target_audience: List[str] = ["all"]  # ['all', 'faculty', 'students', 'class:uuid']
    department_id: Optional[UUID] = None
    class_id: Optional[UUID] = None
    priority: NotificationPriority = NotificationPriority.NORMAL
    is_pinned: bool = False
    expires_at: Optional[datetime] = None

class Announcement(BaseModel):
    id: UUID
    title: str
    content: str
    created_by: UUID
    target_audience: List[str]
    department_id: Optional[UUID] = None
    class_id: Optional[UUID] = None
    priority: NotificationPriority
    is_pinned: bool
    publish_at: datetime
    expires_at: Optional[datetime] = None
    created_at: datetime
    
    # Expanded
    author_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    recipient_id: UUID
    subject: Optional[str] = None
    content: str
    parent_message_id: Optional[UUID] = None
    attachments: Optional[List[dict]] = None

class Message(BaseModel):
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    subject: Optional[str] = None
    content: str
    parent_message_id: Optional[UUID] = None
    is_read: bool = False
    read_at: Optional[datetime] = None
    attachments: Optional[List[dict]] = None
    created_at: datetime
    
    # Expanded
    sender_name: Optional[str] = None
    recipient_name: Optional[str] = None
    
    class Config:
        from_attributes = True
