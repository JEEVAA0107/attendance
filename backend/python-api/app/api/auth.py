from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from app.models.user import UserLogin, Token, UserResponse
from app.services.auth import authenticate_hod, create_access_token

router = APIRouter()

@router.options("/hod/login")
async def options_hod_login():
    return {"message": "OK"}

@router.post("/hod/login", response_model=Token)
async def login_hod(user_credentials: UserLogin):
    user = authenticate_hod(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/faculty/login", response_model=Token)
async def login_faculty(user_credentials: UserLogin):
    from app.services.auth import authenticate_faculty
    
    user = authenticate_faculty(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect name/email or biometric ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/student/login", response_model=Token)
async def login_student(user_credentials: UserLogin):
    from app.services.auth import authenticate_student
    
    user = authenticate_student(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}