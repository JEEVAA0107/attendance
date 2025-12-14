from datetime import datetime, timedelta
from jose import JWTError, jwt
import hashlib
from app.config import JWT_SECRET, JWT_ALGORITHM
from app.database import supabase

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def authenticate_hod(email_or_name: str, password: str):
    try:
        # Try to find user by email first
        result = supabase.table('users').select('*').eq('email', email_or_name).eq('role', 'hod').execute()
        
        # If not found by email, try by name
        if not result.data:
            result = supabase.table('users').select('*').eq('name', email_or_name).eq('role', 'hod').execute()
        
        if not result.data:
            return False
            
        user = result.data[0]
        if not verify_password(password, user['password']):
            return False
            
        return user
    except Exception as e:
        print(f"Authentication error: {e}")
        return False