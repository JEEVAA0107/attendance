from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr to str to allow names
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str