"""
SmartAttend Hub - Enhanced Authentication Service
Handles JWT tokens, password hashing, and role-based access
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Union
from uuid import UUID
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.database import supabase
from app.models.user import TokenPayload
from app.models.hod import HOD
from app.models.faculty import Faculty
from app.models.student import Student

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# ============================================
# Password Utilities
# ============================================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

# ============================================
# JWT Token Utilities
# ============================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(
            sub=payload.get("sub"),
            role=payload.get("role"),
            user_id=payload.get("user_id"),
            exp=datetime.fromtimestamp(payload.get("exp", 0))
        )
    except JWTError:
        return None

# ============================================
# Authentication Functions
# ============================================

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate any user by email and password"""
    if not supabase:
        return None
    
    try:
        result = supabase.table("users").select("*").eq("email", email).eq("is_active", True).single().execute()
        
        if result.data and verify_password(password, result.data.get("password_hash", "")):
            # Update last login
            supabase.table("users").update({"last_login": datetime.utcnow().isoformat()}).eq("id", result.data["id"]).execute()
            return result.data
        return None
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def authenticate_hod(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate HOD user"""
    user = authenticate_user(email, password)
    if user and user.get("role") == "hod":
        return user
    return None

def authenticate_faculty(email_or_name: str, unique_id: str) -> Optional[Dict[str, Any]]:
    """Authenticate faculty by email/name and unique ID"""
    if not supabase:
        return None
    
    try:
        # Try by unique_id first
        result = supabase.table("users").select("*").eq("unique_id", unique_id).eq("role", "faculty").eq("is_active", True).single().execute()
        
        if result.data:
            # Verify name or email matches
            faculty = supabase.table("faculty_profiles").select("*").eq("user_id", result.data["id"]).single().execute()
            if faculty.data:
                if faculty.data["name"].lower() == email_or_name.lower() or result.data["email"].lower() == email_or_name.lower():
                    return {**result.data, "profile": faculty.data}
        return None
    except Exception as e:
        print(f"Faculty auth error: {e}")
        return None

def authenticate_student(email_or_roll: str, password_or_id: str) -> Optional[Dict[str, Any]]:
    """Authenticate student by email/roll and password/unique ID"""
    if not supabase:
        return None
    
    try:
        # Try email first
        result = supabase.table("users").select("*").eq("email", email_or_roll).eq("role", "student").eq("is_active", True).single().execute()
        
        if result.data:
            if verify_password(password_or_id, result.data.get("password_hash", "")):
                return result.data
        
        # Try by unique ID
        result = supabase.table("users").select("*").eq("unique_id", password_or_id).eq("role", "student").eq("is_active", True).single().execute()
        if result.data:
            student = supabase.table("student_profiles").select("*").eq("user_id", result.data["id"]).single().execute()
            if student.data and (student.data["roll_number"] == email_or_roll or student.data["name"].lower() == email_or_roll.lower()):
                return result.data
        
        return None
    except Exception as e:
        print(f"Student auth error: {e}")
        return None

# ============================================
# Dependency Injection for Routes
# ============================================

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Get current authenticated user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        result = supabase.table("users").select("*").eq("email", payload.sub).eq("is_active", True).single().execute()
        if not result.data:
            raise credentials_exception
        return result.data
    except Exception:
        raise credentials_exception

async def get_current_hod(current_user: Dict = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user is HOD"""
    if current_user.get("role") != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HOD access required"
        )
    
    # Get HOD profile
    try:
        result = supabase.table("hod_profiles").select("*").eq("user_id", current_user["id"]).single().execute()
        if result.data:
            return {**current_user, "profile": result.data}
        return current_user
    except Exception:
        return current_user

async def get_current_faculty(current_user: Dict = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user is Faculty"""
    if current_user.get("role") not in ["faculty", "hod"]:  # HOD can act as faculty
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty access required"
        )
    
    # Get Faculty profile
    try:
        result = supabase.table("faculty_profiles").select("*").eq("user_id", current_user["id"]).single().execute()
        if result.data:
            return {**current_user, "profile": result.data}
        return current_user
    except Exception:
        return current_user

async def get_current_student(current_user: Dict = Depends(get_current_user)) -> Dict[str, Any]:
    """Ensure current user is Student"""
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )
    
    # Get Student profile
    try:
        result = supabase.table("student_profiles").select("*").eq("user_id", current_user["id"]).single().execute()
        if result.data:
            return {**current_user, "profile": result.data}
        return current_user
    except Exception:
        return current_user

# ============================================
# Role Hierarchy Permission Check
# ============================================

class RolePermission:
    """Check role-based permissions"""
    
    HIERARCHY = {
        "super_admin": 100,
        "hod": 80,
        "faculty": 50,
        "student": 20,
        "parent": 10
    }
    
    @staticmethod
    def can_manage(manager_role: str, target_role: str) -> bool:
        """Check if manager role can manage target role"""
        return RolePermission.HIERARCHY.get(manager_role, 0) > RolePermission.HIERARCHY.get(target_role, 0)
    
    @staticmethod
    def has_access(user_role: str, required_role: str) -> bool:
        """Check if user has at least the required role level"""
        return RolePermission.HIERARCHY.get(user_role, 0) >= RolePermission.HIERARCHY.get(required_role, 0)

def require_role(*allowed_roles: str):
    """Decorator to require specific roles"""
    async def role_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker