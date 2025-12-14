from app.database import supabase
from app.services.auth import get_password_hash

def create_hod_user():
    # Create a sample HOD user
    hashed_password = get_password_hash("10521")
    
    user_data = {
        "email": "ananths@gmail.com",
        "password": hashed_password,
        "role": "hod",
        "name": "Ananth"
    }
    
    try:
        result = supabase.table('users').insert(user_data).execute()
        print("HOD user created successfully:", result.data)
    except Exception as e:
        print("Error creating HOD user:", e)

if __name__ == "__main__":
    create_hod_user()