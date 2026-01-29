"""
SmartAttend Hub - Enhanced Authentication Routes
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta

from app.config import settings
from app.models.user import UserLogin, Token, RefreshTokenRequest, PasswordChange
from app.services.auth import (
    authenticate_hod, authenticate_faculty, authenticate_student,
    create_access_token, create_refresh_token, decode_token,
    hash_password, verify_password, get_current_user
)
from app.database import supabase

router = APIRouter()

# ============================================
# HOD Authentication
# ============================================

@router.options("/hod/login")
async def options_hod_login():
    return {"message": "OK"}

@router.post("/hod/login", response_model=Token)
async def login_hod(credentials: UserLogin):
    """HOD login with email and password"""
    user = authenticate_hod(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {
        "sub": user["email"],
        "role": user["role"],
        "user_id": str(user["id"])
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# ============================================
# Faculty Authentication
# ============================================

@router.post("/faculty/login", response_model=Token)
async def login_faculty(credentials: UserLogin):
    """Faculty login with name/email and unique ID"""
    user = authenticate_faculty(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect name/email or ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {
        "sub": user["email"],
        "role": user["role"],
        "user_id": str(user["id"])
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# ============================================
# Student Authentication
# ============================================

@router.post("/student/login", response_model=Token)
async def login_student(credentials: UserLogin):
    """Student login with email/roll and password/unique ID"""
    user = authenticate_student(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {
        "sub": user["email"],
        "role": user["role"],
        "user_id": str(user["id"])
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# ============================================
# Token Refresh
# ============================================

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    payload = decode_token(request.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    token_data = {
        "sub": payload.sub,
        "role": payload.role,
        "user_id": payload.user_id
    }
    
    access_token = create_access_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=request.refresh_token,  # Reuse refresh token
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# ============================================
# Password Management
# ============================================

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    if not verify_password(password_data.current_password, current_user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        supabase.table("users").update({
            "password_hash": hash_password(password_data.new_password)
        }).eq("id", current_user["id"]).execute()
        
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

# ============================================
# Verify Token
# ============================================

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if current token is valid"""
    return {
        "valid": True,
        "user_id": current_user.get("id"),
        "email": current_user.get("email"),
        "role": current_user.get("role")
    }

# ============================================
# Logout (for tracking)
# ============================================

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout - record logout time"""
    if supabase:
        try:
            # Update last active login history if exists
            supabase.table("login_history").update({
                "logout_at": "now()"
            }).eq("user_id", current_user["id"]).is_("logout_at", "null").execute()
        except Exception:
            pass  # Non-critical
    
    return {"message": "Logged out successfully"}