from app.database import supabase
from app.services.auth import verify_password

def authenticate_faculty(email_or_name: str, password: str):
    try:
        # Try to find user by email first
        result = supabase.table('users').select('*').eq('email', email_or_name).eq('role', 'faculty').execute()
        
        # If not found by email, try by name
        if not result.data:
            result = supabase.table('users').select('*').eq('name', email_or_name).eq('role', 'faculty').execute()
        
        if not result.data:
            return False
            
        user = result.data[0]
        if not verify_password(password, user['password']):
            return False
            
        return user
    except Exception as e:
        print(f"Faculty authentication error: {e}")
        return False