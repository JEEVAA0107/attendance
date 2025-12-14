from app.database import supabase

def populate_hod_only():
    # Only add HOD initially
    faculty_data = [
        {"name": "Ananth", "designation": "HOD / Associate Professor", "biometric_id": "10521", "department": "AI&DS", "email": "ananths@gmail.com"}
    ]
    
    try:
        result = supabase.table('faculty').insert(faculty_data).execute()
        print(f"HOD faculty record created successfully: {len(result.data)} records")
    except Exception as e:
        print(f"Error creating HOD faculty record: {e}")

if __name__ == "__main__":
    populate_hod_only()