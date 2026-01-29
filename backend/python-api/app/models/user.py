"""
SmartAttend Hub - User Models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

# ============================================
# Base Models
# ============================================

class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(..., pattern="^(super_admin|hod|faculty|student|parent)$")
    unique_id: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    unique_id: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    unique_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================
# Token Models
# ============================================

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 minutes

class TokenPayload(BaseModel):
    sub: str  # user email
    role: str
    user_id: str
    exp: Optional[datetime] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# ============================================
# Password Reset Models
# ============================================

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)