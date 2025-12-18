from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HODBase(BaseModel):
    name: str
    employee_id: str
    email: str
    phone: Optional[str] = None
    department_id: str
    biometric_id: Optional[str] = None

class HODCreate(HODBase):
    password: str

class HODUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    biometric_id: Optional[str] = None

class HOD(HODBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True