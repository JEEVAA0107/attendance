"""
SmartAttend Hub - Analytics Service
Business intelligence and reporting
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from uuid import UUID
import json

from app.database import supabase

class AnalyticsService:
    """Service for analytics and reporting"""
    
    # ============================================
    # Department Analytics (HOD)
    # ============================================
    
    @staticmethod
    async def get_department_overview(department_id: UUID) -> Dict:
        """Get department-wide attendance overview"""
        if not supabase:
            return {}
        
        try:
            dept_id = str(department_id)
            today = date.today()
            month_start = today.replace(day=1)
            
            # Total counts
            faculty_count = supabase.table("faculty_profiles").select("id", count="exact").eq("department_id", dept_id).execute()
            student_count = supabase.table("student_profiles").select("id", count="exact").eq("department_id", dept_id).execute()
            class_count = supabase.table("classes").select("id", count="exact").eq("department_id", dept_id).eq("is_active", True).execute()
            
            # This month's attendance
            analytics = supabase.table("daily_analytics").select("*").eq("department_id", dept_id).gte("date", month_start.isoformat()).execute()
            
            total_present = sum(a.get("present_count", 0) for a in (analytics.data or []))
            total_students_days = sum(a.get("total_students", 0) for a in (analytics.data or []))
            avg_rate = (total_present / total_students_days * 100) if total_students_days > 0 else 0
            
            # Low attendance students
            low_attendance = supabase.table("attendance_summary").select("id", count="exact").lt("attendance_percentage", 75).execute()
            
            return {
                "department_id": dept_id,
                "total_faculty": faculty_count.count or 0,
                "total_students": student_count.count or 0,
                "total_classes": class_count.count or 0,
                "month_attendance_rate": round(avg_rate, 2),
                "low_attendance_students": low_attendance.count or 0,
                "analytics_days": len(analytics.data or [])
            }
        except Exception as e:
            print(f"Department overview error: {e}")
            return {}
    
    @staticmethod
    async def get_department_trends(
        department_id: UUID,
        days: int = 30
    ) -> List[Dict]:
        """Get department attendance trends"""
        if not supabase:
            return []
        
        try:
            start_date = (date.today() - timedelta(days=days)).isoformat()
            
            result = supabase.table("daily_analytics").select(
                "date, attendance_rate, present_count, absent_count, total_students"
            ).eq("department_id", str(department_id)).gte("date", start_date).order("date").execute()
            
            return result.data or []
        except Exception as e:
            print(f"Department trends error: {e}")
            return []
    
    @staticmethod
    async def get_class_comparison(department_id: UUID) -> List[Dict]:
        """Compare attendance across classes"""
        if not supabase:
            return []
        
        try:
            # Get classes in department
            classes = supabase.table("classes").select("id, name, section").eq("department_id", str(department_id)).eq("is_active", True).execute()
            
            if not classes.data:
                return []
            
            comparison = []
            for cls in classes.data:
                # Get average attendance for class
                analytics = supabase.table("daily_analytics").select("attendance_rate").eq("class_id", cls["id"]).execute()
                
                if analytics.data:
                    avg_rate = sum(a.get("attendance_rate", 0) for a in analytics.data) / len(analytics.data)
                else:
                    avg_rate = 0
                
                comparison.append({
                    "class_id": cls["id"],
                    "class_name": f"{cls['name']} {cls.get('section', '')}".strip(),
                    "average_attendance": round(avg_rate, 2)
                })
            
            # Sort by attendance rate
            comparison.sort(key=lambda x: x["average_attendance"], reverse=True)
            
            return comparison
        except Exception as e:
            print(f"Class comparison error: {e}")
            return []
    
    # ============================================
    # Class Analytics (Faculty)
    # ============================================
    
    @staticmethod
    async def get_class_overview(class_id: UUID) -> Dict:
        """Get class attendance overview"""
        if not supabase:
            return {}
        
        try:
            cid = str(class_id)
            today = date.today()
            
            # Class info
            class_info = supabase.table("classes").select("name, section, batch_year, semester").eq("id", cid).single().execute()
            
            # Student count
            student_count = supabase.table("student_profiles").select("id", count="exact").eq("class_id", cid).execute()
            
            # Today's attendance
            today_session = supabase.table("attendance_sessions").select("total_present, total_absent, total_late").eq("class_id", cid).eq("session_date", today.isoformat()).execute()
            
            today_present = sum(s.get("total_present", 0) for s in (today_session.data or []))
            today_absent = sum(s.get("total_absent", 0) for s in (today_session.data or []))
            
            # Monthly average
            month_start = today.replace(day=1)
            monthly = supabase.table("daily_analytics").select("attendance_rate").eq("class_id", cid).gte("date", month_start.isoformat()).execute()
            
            avg_monthly = sum(m.get("attendance_rate", 0) for m in (monthly.data or [])) / max(len(monthly.data or []), 1)
            
            return {
                "class_id": cid,
                "class_info": class_info.data if class_info.data else {},
                "total_students": student_count.count or 0,
                "today_present": today_present,
                "today_absent": today_absent,
                "monthly_average": round(avg_monthly, 2)
            }
        except Exception as e:
            print(f"Class overview error: {e}")
            return {}
    
    @staticmethod
    async def get_class_student_rankings(class_id: UUID) -> List[Dict]:
        """Get students ranked by attendance"""
        if not supabase:
            return []
        
        try:
            # Get students in class
            students = supabase.table("student_profiles").select("id, name, roll_number").eq("class_id", str(class_id)).execute()
            
            if not students.data:
                return []
            
            rankings = []
            for student in students.data:
                # Get overall attendance
                summary = supabase.table("attendance_summary").select("attendance_percentage, total_classes, classes_attended").eq("student_id", student["id"]).execute()
                
                total_classes = sum(s.get("total_classes", 0) for s in (summary.data or []))
                total_attended = sum(s.get("classes_attended", 0) for s in (summary.data or []))
                overall_pct = (total_attended / total_classes * 100) if total_classes > 0 else 0
                
                rankings.append({
                    "student_id": student["id"],
                    "name": student["name"],
                    "roll_number": student["roll_number"],
                    "attendance_percentage": round(overall_pct, 2),
                    "total_classes": total_classes,
                    "classes_attended": total_attended
                })
            
            # Sort by attendance
            rankings.sort(key=lambda x: x["attendance_percentage"], reverse=True)
            
            # Add rank
            for i, r in enumerate(rankings):
                r["rank"] = i + 1
            
            return rankings
        except Exception as e:
            print(f"Class rankings error: {e}")
            return []
    
    # ============================================
    # Student Analytics
    # ============================================
    
    @staticmethod
    async def get_student_analytics(student_id: UUID) -> Dict:
        """Get comprehensive student analytics"""
        if not supabase:
            return {}
        
        try:
            sid = str(student_id)
            
            # Student info
            student = supabase.table("student_profiles").select("name, roll_number, class_id").eq("id", sid).single().execute()
            
            if not student.data:
                return {}
            
            # Subject-wise summary
            summary = supabase.table("attendance_summary").select(
                "*, subjects(name, code)"
            ).eq("student_id", sid).execute()
            
            # Calculate overall
            total_classes = sum(s.get("total_classes", 0) for s in (summary.data or []))
            total_attended = sum(s.get("classes_attended", 0) for s in (summary.data or []))
            overall_pct = (total_attended / total_classes * 100) if total_classes > 0 else 0
            
            # Subjects below 75%
            critical_subjects = [
                {
                    "subject": s.get("subjects", {}).get("name", "Unknown"),
                    "percentage": s.get("attendance_percentage", 0)
                }
                for s in (summary.data or [])
                if s.get("attendance_percentage", 100) < 75
            ]
            
            # Recent attendance (last 10 records)
            recent = supabase.table("attendance_records").select(
                "status, created_at, attendance_sessions(session_date, subjects(name))"
            ).eq("student_id", sid).order("created_at", desc=True).limit(10).execute()
            
            # Trend calculation
            if len(summary.data or []) > 0:
                # Simple trend based on recent vs overall
                recent_present = len([r for r in (recent.data or []) if r.get("status") == "present"])
                if len(recent.data or []) > 0:
                    recent_rate = recent_present / len(recent.data) * 100
                    if recent_rate > overall_pct + 5:
                        trend = "improving"
                    elif recent_rate < overall_pct - 5:
                        trend = "declining"
                    else:
                        trend = "stable"
                else:
                    trend = "stable"
            else:
                trend = "stable"
            
            return {
                "student_id": sid,
                "student_info": student.data,
                "overall_percentage": round(overall_pct, 2),
                "total_classes": total_classes,
                "classes_attended": total_attended,
                "classes_missed": total_classes - total_attended,
                "subject_wise": summary.data or [],
                "critical_subjects": critical_subjects,
                "recent_attendance": recent.data or [],
                "trend": trend,
                "risk_level": "low" if overall_pct >= 85 else "medium" if overall_pct >= 75 else "high" if overall_pct >= 60 else "critical"
            }
        except Exception as e:
            print(f"Student analytics error: {e}")
            return {}
    
    # ============================================
    # At-Risk Students
    # ============================================
    
    @staticmethod
    async def get_at_risk_students(
        department_id: Optional[UUID] = None,
        class_id: Optional[UUID] = None,
        threshold: float = 75.0
    ) -> List[Dict]:
        """Get students at risk of low attendance"""
        if not supabase:
            return []
        
        try:
            # Get summaries below threshold
            query = supabase.table("attendance_summary").select(
                "student_id, attendance_percentage, total_classes, classes_attended, subjects(name, code)"
            ).lt("attendance_percentage", threshold)
            
            result = query.execute()
            
            if not result.data:
                return []
            
            # Get unique students
            student_ids = list(set([r["student_id"] for r in result.data]))
            
            # Get student details
            students = supabase.table("student_profiles").select(
                "id, name, roll_number, class_id, department_id, parent_phone"
            ).in_("id", student_ids).execute()
            
            # Filter by department/class if specified
            filtered_students = []
            for student in (students.data or []):
                if department_id and student.get("department_id") != str(department_id):
                    continue
                if class_id and student.get("class_id") != str(class_id):
                    continue
                
                # Get subjects below threshold for this student
                low_subjects = [
                    {
                        "subject": r.get("subjects", {}).get("name", "Unknown"),
                        "percentage": r.get("attendance_percentage", 0)
                    }
                    for r in result.data
                    if r["student_id"] == student["id"]
                ]
                
                filtered_students.append({
                    "student_id": student["id"],
                    "name": student["name"],
                    "roll_number": student["roll_number"],
                    "parent_phone": student.get("parent_phone"),
                    "low_subjects": low_subjects,
                    "lowest_percentage": min([s["percentage"] for s in low_subjects]) if low_subjects else 0
                })
            
            # Sort by lowest percentage
            filtered_students.sort(key=lambda x: x["lowest_percentage"])
            
            return filtered_students
        except Exception as e:
            print(f"At-risk students error: {e}")
            return []
    
    # ============================================
    # Daily Analytics Update
    # ============================================
    
    @staticmethod
    async def update_daily_analytics(analytics_date: date = None) -> bool:
        """Update daily analytics for all classes"""
        if not supabase:
            return False
        
        try:
            if analytics_date is None:
                analytics_date = date.today()
            
            date_str = analytics_date.isoformat()
            
            # Get all sessions for the date
            sessions = supabase.table("attendance_sessions").select(
                "class_id, total_present, total_absent, total_late, classes(department_id)"
            ).eq("session_date", date_str).execute()
            
            if not sessions.data:
                return True  # No sessions, nothing to update
            
            # Aggregate by class
            class_stats = {}
            for session in sessions.data:
                cid = session["class_id"]
                if cid not in class_stats:
                    class_stats[cid] = {
                        "present": 0,
                        "absent": 0,
                        "late": 0,
                        "department_id": session.get("classes", {}).get("department_id")
                    }
                class_stats[cid]["present"] += session.get("total_present", 0)
                class_stats[cid]["absent"] += session.get("total_absent", 0)
                class_stats[cid]["late"] += session.get("total_late", 0)
            
            # Upsert analytics
            for cid, stats in class_stats.items():
                total = stats["present"] + stats["absent"] + stats["late"]
                rate = (stats["present"] / total * 100) if total > 0 else 0
                
                supabase.table("daily_analytics").upsert({
                    "date": date_str,
                    "class_id": cid,
                    "department_id": stats["department_id"],
                    "present_count": stats["present"],
                    "absent_count": stats["absent"],
                    "late_count": stats["late"],
                    "total_students": total,
                    "attendance_rate": round(rate, 2)
                }, on_conflict="date,department_id,class_id").execute()
            
            return True
        except Exception as e:
            print(f"Update daily analytics error: {e}")
            return False
