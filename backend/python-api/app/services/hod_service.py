"""
SmartAttend Hub - HOD Service
Business logic for HOD operations
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from uuid import UUID

from app.database import supabase
from app.services.auth import hash_password
from app.models.faculty import FacultyCreate, FacultyUpdate, Faculty
from app.models.student import StudentCreate, StudentUpdate, Student, StudentBulkResult
from app.models.hod import HODDashboard

class HODService:
    """Service for HOD operations"""
    
    # ============================================
    # Faculty Management
    # ============================================
    
    @staticmethod
    async def get_department_faculty(department_id: UUID) -> List[Dict]:
        """Get all faculty in department"""
        if not supabase:
            return []
        
        try:
            result = supabase.table("faculty_profiles").select(
                "*, users!faculty_profiles_user_id_fkey(email, is_active, unique_id)"
            ).eq("department_id", str(department_id)).execute()
            return result.data or []
        except Exception as e:
            print(f"Error fetching faculty: {e}")
            return []
    
    @staticmethod
    async def create_faculty(faculty_data: FacultyCreate, created_by: UUID) -> Dict:
        """Create new faculty member"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Create user account
            user_result = supabase.table("users").insert({
                "email": faculty_data.email,
                "password_hash": hash_password(faculty_data.password),
                "role": "faculty",
                "unique_id": faculty_data.unique_id or faculty_data.employee_id,
                "is_active": True
            }).execute()
            
            if not user_result.data:
                raise Exception("Failed to create user account")
            
            user_id = user_result.data[0]["id"]
            
            # Create faculty profile
            profile_result = supabase.table("faculty_profiles").insert({
                "user_id": user_id,
                "employee_id": faculty_data.employee_id,
                "name": faculty_data.name,
                "department_id": str(faculty_data.department_id),
                "designation": faculty_data.designation,
                "phone": faculty_data.phone,
                "qualification": faculty_data.qualification,
                "specialization": faculty_data.specialization,
                "created_by": str(created_by)
            }).execute()
            
            if not profile_result.data:
                # Rollback user creation
                supabase.table("users").delete().eq("id", user_id).execute()
                raise Exception("Failed to create faculty profile")
            
            return {**profile_result.data[0], "user": user_result.data[0]}
        except Exception as e:
            raise Exception(f"Failed to create faculty: {str(e)}")
    
    @staticmethod
    async def update_faculty(faculty_id: UUID, update_data: FacultyUpdate) -> Dict:
        """Update faculty member"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            update_dict["updated_at"] = datetime.utcnow().isoformat()
            
            result = supabase.table("faculty_profiles").update(update_dict).eq("id", str(faculty_id)).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to update faculty: {str(e)}")
    
    @staticmethod
    async def delete_faculty(faculty_id: UUID) -> bool:
        """Delete faculty member (soft delete via user)"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Get user_id from faculty profile
            faculty = supabase.table("faculty_profiles").select("user_id").eq("id", str(faculty_id)).single().execute()
            if not faculty.data:
                raise Exception("Faculty not found")
            
            # Soft delete - set is_active to false
            supabase.table("users").update({"is_active": False}).eq("id", faculty.data["user_id"]).execute()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete faculty: {str(e)}")
    
    # ============================================
    # Student Management
    # ============================================
    
    @staticmethod
    async def get_department_students(department_id: UUID, class_id: Optional[UUID] = None) -> List[Dict]:
        """Get all students in department"""
        if not supabase:
            return []
        
        try:
            query = supabase.table("student_profiles").select(
                "*, users!student_profiles_user_id_fkey(email, is_active, unique_id)"
            ).eq("department_id", str(department_id))
            
            if class_id:
                query = query.eq("class_id", str(class_id))
            
            result = query.execute()
            return result.data or []
        except Exception as e:
            print(f"Error fetching students: {e}")
            return []
    
    @staticmethod
    async def create_student(student_data: StudentCreate) -> Dict:
        """Create new student"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            # Create user account
            user_result = supabase.table("users").insert({
                "email": student_data.email,
                "password_hash": hash_password(student_data.password),
                "role": "student",
                "unique_id": student_data.unique_id or student_data.roll_number,
                "is_active": True
            }).execute()
            
            if not user_result.data:
                raise Exception("Failed to create user account")
            
            user_id = user_result.data[0]["id"]
            
            # Create student profile
            profile_data = {
                "user_id": user_id,
                "roll_number": student_data.roll_number,
                "name": student_data.name,
                "department_id": str(student_data.department_id),
                "batch_year": student_data.batch_year,
                "semester": student_data.semester,
                "section": student_data.section,
                "phone": student_data.phone,
                "parent_phone": student_data.parent_phone,
                "parent_email": student_data.parent_email,
                "date_of_birth": student_data.date_of_birth.isoformat() if student_data.date_of_birth else None,
                "address": student_data.address,
                "blood_group": student_data.blood_group
            }
            
            if student_data.class_id:
                profile_data["class_id"] = str(student_data.class_id)
            
            profile_result = supabase.table("student_profiles").insert(profile_data).execute()
            
            if not profile_result.data:
                supabase.table("users").delete().eq("id", user_id).execute()
                raise Exception("Failed to create student profile")
            
            return {**profile_result.data[0], "user": user_result.data[0]}
        except Exception as e:
            raise Exception(f"Failed to create student: {str(e)}")
    
    @staticmethod
    async def create_students_bulk(students: List[StudentCreate]) -> StudentBulkResult:
        """Create multiple students"""
        result = StudentBulkResult(total=len(students), successful=0, failed=0, errors=[])
        
        for idx, student_data in enumerate(students):
            try:
                await HODService.create_student(student_data)
                result.successful += 1
            except Exception as e:
                result.failed += 1
                result.errors.append({
                    "index": idx,
                    "roll_number": student_data.roll_number,
                    "error": str(e)
                })
        
        return result
    
    @staticmethod
    async def update_student(student_id: UUID, update_data: StudentUpdate) -> Dict:
        """Update student"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            if "class_id" in update_dict:
                update_dict["class_id"] = str(update_dict["class_id"])
            update_dict["updated_at"] = datetime.utcnow().isoformat()
            
            result = supabase.table("student_profiles").update(update_dict).eq("id", str(student_id)).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to update student: {str(e)}")
    
    @staticmethod
    async def delete_student(student_id: UUID) -> bool:
        """Delete student (soft delete)"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            student = supabase.table("student_profiles").select("user_id").eq("id", str(student_id)).single().execute()
            if not student.data:
                raise Exception("Student not found")
            
            supabase.table("users").update({"is_active": False}).eq("id", student.data["user_id"]).execute()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete student: {str(e)}")
    
    # ============================================
    # Dashboard & Analytics
    # ============================================
    
    @staticmethod
    async def get_dashboard(department_id: UUID) -> HODDashboard:
        """Get HOD dashboard statistics"""
        if not supabase:
            return HODDashboard(
                total_faculty=0, total_students=0, total_classes=0,
                today_attendance_rate=0, pending_leave_requests=0,
                pending_corrections=0, low_attendance_students=0,
                recent_announcements=0
            )
        
        try:
            dept_id = str(department_id)
            
            # Count faculty
            faculty_count = supabase.table("faculty_profiles").select("id", count="exact").eq("department_id", dept_id).execute()
            
            # Count students
            student_count = supabase.table("student_profiles").select("id", count="exact").eq("department_id", dept_id).execute()
            
            # Count classes
            classes_count = supabase.table("classes").select("id", count="exact").eq("department_id", dept_id).eq("is_active", True).execute()
            
            # Today's attendance rate
            today = date.today().isoformat()
            today_analytics = supabase.table("daily_analytics").select("attendance_rate").eq("department_id", dept_id).eq("date", today).execute()
            avg_attendance = sum(r.get("attendance_rate", 0) for r in (today_analytics.data or [])) / max(len(today_analytics.data or []), 1)
            
            # Pending leave requests
            leave_count = supabase.table("leave_requests").select("id", count="exact").eq("status", "pending").execute()
            
            # Pending corrections
            correction_count = supabase.table("attendance_corrections").select("id", count="exact").eq("status", "pending").execute()
            
            # Low attendance students (< 75%)
            low_attendance = supabase.table("attendance_summary").select("id", count="exact").lt("attendance_percentage", 75).execute()
            
            return HODDashboard(
                total_faculty=faculty_count.count or 0,
                total_students=student_count.count or 0,
                total_classes=classes_count.count or 0,
                today_attendance_rate=round(avg_attendance, 2),
                pending_leave_requests=leave_count.count or 0,
                pending_corrections=correction_count.count or 0,
                low_attendance_students=low_attendance.count or 0,
                recent_announcements=0
            )
        except Exception as e:
            print(f"Dashboard error: {e}")
            return HODDashboard(
                total_faculty=0, total_students=0, total_classes=0,
                today_attendance_rate=0, pending_leave_requests=0,
                pending_corrections=0, low_attendance_students=0,
                recent_announcements=0
            )
    
    # ============================================
    # Faculty Assignment Management
    # ============================================
    
    @staticmethod
    async def assign_faculty_to_class(
        faculty_id: UUID, 
        subject_id: UUID, 
        class_id: UUID,
        assigned_by: UUID,
        academic_year_id: Optional[UUID] = None
    ) -> Dict:
        """Assign faculty to teach a subject in a class"""
        if not supabase:
            raise Exception("Database unavailable")
        
        try:
            data = {
                "faculty_id": str(faculty_id),
                "subject_id": str(subject_id),
                "class_id": str(class_id),
                "assigned_by": str(assigned_by),
                "is_active": True
            }
            if academic_year_id:
                data["academic_year_id"] = str(academic_year_id)
            
            result = supabase.table("faculty_assignments").insert(data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            raise Exception(f"Failed to assign faculty: {str(e)}")
    
    @staticmethod
    async def get_faculty_assignments(department_id: UUID) -> List[Dict]:
        """Get all faculty assignments in department"""
        if not supabase:
            return []
        
        try:
            # Get faculty in department first
            faculty_ids = supabase.table("faculty_profiles").select("id").eq("department_id", str(department_id)).execute()
            
            if not faculty_ids.data:
                return []
            
            ids = [f["id"] for f in faculty_ids.data]
            
            result = supabase.table("faculty_assignments").select(
                "*, faculty_profiles(name, employee_id), subjects(name, code), classes(name, section)"
            ).in_("faculty_id", ids).eq("is_active", True).execute()
            
            return result.data or []
        except Exception as e:
            print(f"Error fetching assignments: {e}")
            return []
