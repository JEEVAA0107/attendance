from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class StudentBase(BaseModel):
    name: str
    roll_number: str
    email: str
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    department_id: str
    batch_year: int
    semester: int = 1
    class_id: Optional[str] = None
    biometric_id: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    admission_date: Optional[date] = None

class StudentCreate(StudentBase):
    password: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    semester: Optional[int] = None
    class_id: Optional[str] = None
    biometric_id: Optional[str] = None
    address: Optional[str] = None

class Student(StudentBase):
    id: str
    user_id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True