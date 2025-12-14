from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.faculty import FacultyCreate, FacultyResponse, FacultyUpdate
from app.database import supabase
from app.services.auth import get_password_hash
import secrets
import string

router = APIRouter()

@router.get("/", response_model=List[FacultyResponse])
async def get_faculty():
    try:
        result = supabase.table('faculty').select('*').order('name').execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=FacultyResponse)
async def create_faculty(faculty: FacultyCreate):
    try:
        # Use biometric_id as password
        hashed_password = get_password_hash(faculty.biometric_id)
        
        # Insert into faculty table
        faculty_result = supabase.table('faculty').insert(faculty.dict()).execute()
        
        # Create user account for faculty
        user_data = {
            "email": faculty.email,
            "password": hashed_password,
            "role": "faculty",
            "name": faculty.name
        }
        user_result = supabase.table('users').insert(user_data).execute()
        
        return faculty_result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{faculty_id}", response_model=FacultyResponse)
async def update_faculty(faculty_id: str, faculty_update: FacultyUpdate):
    try:
        # Get current faculty data
        current_result = supabase.table('faculty').select('*').eq('id', faculty_id).execute()
        if not current_result.data:
            raise HTTPException(status_code=404, detail="Faculty not found")
        
        current_faculty = current_result.data[0]
        
        # Prepare update data (only non-None fields)
        update_data = {k: v for k, v in faculty_update.dict().items() if v is not None}
        
        if not update_data:
            return current_faculty
        
        # Update faculty table
        faculty_result = supabase.table('faculty').update(update_data).eq('id', faculty_id).execute()
        
        # Update users table if email, name, or biometric_id changed
        user_update_data = {}
        if 'email' in update_data:
            user_update_data['email'] = update_data['email']
        if 'name' in update_data:
            user_update_data['name'] = update_data['name']
        if 'biometric_id' in update_data:
            user_update_data['password'] = get_password_hash(update_data['biometric_id'])
        
        if user_update_data:
            supabase.table('users').update(user_update_data).eq('email', current_faculty['email']).execute()
        
        return faculty_result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{faculty_id}")
async def delete_faculty(faculty_id: str):
    try:
        # Get faculty email before deletion
        faculty_result = supabase.table('faculty').select('email').eq('id', faculty_id).execute()
        if not faculty_result.data:
            raise HTTPException(status_code=404, detail="Faculty not found")
        
        faculty_email = faculty_result.data[0]['email']
        
        # Delete from faculty table
        supabase.table('faculty').delete().eq('id', faculty_id).execute()
        
        # Delete from users table
        supabase.table('users').delete().eq('email', faculty_email).execute()
        
        return {"message": "Faculty deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))