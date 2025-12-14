from pydantic import BaseModel
from typing import Optional

class FacultyCreate(BaseModel):
    name: str
    designation: str
    biometric_id: str
    department: str = "AI&DS"
    email: str

class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    biometric_id: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None

class FacultyResponse(BaseModel):
    id: str
    name: str
    designation: str
    biometric_id: str
    department: str
    email: str
    created_at: str