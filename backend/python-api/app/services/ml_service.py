"""
SmartAttend Hub - AI/ML Service
Attendance prediction, anomaly detection, and risk analysis
"""
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, date, timedelta
from uuid import UUID
import statistics
from enum import Enum

from app.database import supabase

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class MLService:
    """Service for AI/ML features"""
    
    # ============================================
    # Attendance Prediction
    # ============================================
    
    @staticmethod
    async def predict_attendance(
        student_id: UUID,
        subject_id: Optional[UUID] = None,
        prediction_date: Optional[date] = None
    ) -> Dict:
        """
        Predict probability of student attending class
        Uses historical patterns, day-of-week trends, and recent behavior
        """
        if not supabase:
            return {"error": "Database unavailable"}
        
        try:
            sid = str(student_id)
            target_date = prediction_date or date.today() + timedelta(days=1)
            day_of_week = target_date.weekday() + 1  # 1=Monday
            
            # Get historical attendance
            history = supabase.table("attendance_records").select(
                "status, attendance_sessions(session_date, subject_id)"
            ).eq("student_id", sid).order("created_at", desc=True).limit(100).execute()
            
            if not history.data:
                return {
                    "student_id": sid,
                    "prediction_date": target_date.isoformat(),
                    "probability": 0.5,
                    "confidence": "low",
                    "risk_level": RiskLevel.MEDIUM.value,
                    "factors": ["No historical data available"]
                }
            
            records = history.data
            total = len(records)
            present = len([r for r in records if r.get("status") == "present"])
            absent = len([r for r in records if r.get("status") == "absent"])
            
            # Base probability from overall attendance
            base_prob = present / total if total > 0 else 0.5
            
            # Day-of-week factor
            day_records = []
            for r in records:
                session = r.get("attendance_sessions", {})
                if session:
                    try:
                        sess_date = datetime.strptime(session.get("session_date", ""), "%Y-%m-%d")
                        if sess_date.weekday() + 1 == day_of_week:
                            day_records.append(r)
                    except:
                        pass
            
            if day_records:
                day_present = len([r for r in day_records if r.get("status") == "present"])
                day_factor = day_present / len(day_records)
            else:
                day_factor = base_prob
            
            # Subject-specific factor
            if subject_id:
                subject_records = [
                    r for r in records 
                    if r.get("attendance_sessions", {}).get("subject_id") == str(subject_id)
                ]
                if subject_records:
                    subj_present = len([r for r in subject_records if r.get("status") == "present"])
                    subj_factor = subj_present / len(subject_records)
                else:
                    subj_factor = base_prob
            else:
                subj_factor = base_prob
            
            # Recent trend (last 10 sessions)
            recent = records[:10]
            recent_present = len([r for r in recent if r.get("status") == "present"])
            recent_factor = recent_present / len(recent) if recent else base_prob
            
            # Weighted probability
            probability = (
                base_prob * 0.3 +
                day_factor * 0.2 +
                subj_factor * 0.2 +
                recent_factor * 0.3
            )
            
            # Determine risk level
            if probability >= 0.85:
                risk_level = RiskLevel.LOW
            elif probability >= 0.75:
                risk_level = RiskLevel.MEDIUM
            elif probability >= 0.60:
                risk_level = RiskLevel.HIGH
            else:
                risk_level = RiskLevel.CRITICAL
            
            # Contributing factors
            factors = []
            if recent_factor < base_prob - 0.1:
                factors.append("Recent attendance declining")
            if recent_factor > base_prob + 0.1:
                factors.append("Recent attendance improving")
            if day_factor < base_prob - 0.15:
                factors.append(f"Lower attendance on this day of week")
            if subj_factor < base_prob - 0.15 and subject_id:
                factors.append("Lower attendance for this subject")
            if not factors:
                factors.append("Stable attendance pattern")
            
            # Confidence based on data availability
            if total >= 50:
                confidence = "high"
            elif total >= 20:
                confidence = "medium"
            else:
                confidence = "low"
            
            # Store prediction
            await MLService._save_prediction(
                student_id, subject_id, target_date, 
                probability, risk_level.value, factors
            )
            
            return {
                "student_id": sid,
                "subject_id": str(subject_id) if subject_id else None,
                "prediction_date": target_date.isoformat(),
                "probability": round(probability, 4),
                "percentage": round(probability * 100, 1),
                "confidence": confidence,
                "risk_level": risk_level.value,
                "factors": factors,
                "historical_stats": {
                    "total_sessions": total,
                    "present": present,
                    "absent": absent,
                    "overall_rate": round(present / total * 100, 1) if total > 0 else 0
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return {"error": str(e)}
    
    @staticmethod
    async def _save_prediction(
        student_id: UUID, subject_id: Optional[UUID], prediction_date: date,
        probability: float, risk_level: str, factors: List[str]
    ):
        """Save prediction to database"""
        if not supabase:
            return
        
        try:
            supabase.table("attendance_predictions").upsert({
                "student_id": str(student_id),
                "subject_id": str(subject_id) if subject_id else None,
                "prediction_date": prediction_date.isoformat(),
                "predicted_probability": probability,
                "risk_level": risk_level,
                "contributing_factors": factors
            }).execute()
        except Exception as e:
            print(f"Save prediction error: {e}")
    
    # ============================================
    # Anomaly Detection
    # ============================================
    
    @staticmethod
    async def detect_anomalies(
        department_id: Optional[UUID] = None,
        class_id: Optional[UUID] = None,
        days: int = 7
    ) -> List[Dict]:
        """
        Detect unusual attendance patterns
        - Sudden attendance drops
        - Unusual class-wide absences
        - Potential proxy attendance patterns
        """
        if not supabase:
            return []
        
        try:
            anomalies = []
            start_date = (date.today() - timedelta(days=days)).isoformat()
            
            # 1. Detect individual sudden drops
            student_anomalies = await MLService._detect_student_drops(start_date, department_id, class_id)
            anomalies.extend(student_anomalies)
            
            # 2. Detect class-wide unusual patterns
            class_anomalies = await MLService._detect_class_anomalies(start_date, department_id, class_id)
            anomalies.extend(class_anomalies)
            
            # Sort by severity
            severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
            anomalies.sort(key=lambda x: severity_order.get(x.get("severity", "low"), 4))
            
            return anomalies
        except Exception as e:
            print(f"Anomaly detection error: {e}")
            return []
    
    @staticmethod
    async def _detect_student_drops(
        start_date: str, 
        department_id: Optional[UUID] = None,
        class_id: Optional[UUID] = None
    ) -> List[Dict]:
        """Detect students with sudden attendance drops"""
        anomalies = []
        
        if not supabase:
            return anomalies
        
        try:
            # Get students
            query = supabase.table("student_profiles").select("id, name, roll_number, class_id")
            
            if class_id:
                query = query.eq("class_id", str(class_id))
            elif department_id:
                query = query.eq("department_id", str(department_id))
            
            students = query.execute()
            
            for student in (students.data or []):
                sid = student["id"]
                
                # Get recent vs historical attendance
                recent = supabase.table("attendance_records").select("status").eq("student_id", sid).gte("created_at", start_date).execute()
                historical = supabase.table("attendance_records").select("status").eq("student_id", sid).lt("created_at", start_date).limit(50).execute()
                
                if not recent.data or not historical.data:
                    continue
                
                recent_present = len([r for r in recent.data if r["status"] == "present"])
                recent_total = len(recent.data)
                recent_rate = recent_present / recent_total if recent_total > 0 else 0
                
                hist_present = len([r for r in historical.data if r["status"] == "present"])
                hist_total = len(historical.data)
                hist_rate = hist_present / hist_total if hist_total > 0 else 0
                
                # Detect significant drop (>20% decrease)
                if hist_rate - recent_rate > 0.20 and hist_total >= 10:
                    severity = "critical" if hist_rate - recent_rate > 0.40 else "high" if hist_rate - recent_rate > 0.30 else "medium"
                    
                    anomaly = {
                        "type": "sudden_drop",
                        "entity_type": "student",
                        "entity_id": sid,
                        "student_name": student["name"],
                        "roll_number": student["roll_number"],
                        "severity": severity,
                        "details": {
                            "historical_rate": round(hist_rate * 100, 1),
                            "recent_rate": round(recent_rate * 100, 1),
                            "drop_percentage": round((hist_rate - recent_rate) * 100, 1)
                        },
                        "detected_at": datetime.utcnow().isoformat()
                    }
                    anomalies.append(anomaly)
                    
                    # Save to database
                    await MLService._save_anomaly(anomaly)
            
            return anomalies
        except Exception as e:
            print(f"Student drops detection error: {e}")
            return []
    
    @staticmethod
    async def _detect_class_anomalies(
        start_date: str,
        department_id: Optional[UUID] = None,
        class_id: Optional[UUID] = None
    ) -> List[Dict]:
        """Detect class-wide unusual attendance patterns"""
        anomalies = []
        
        if not supabase:
            return anomalies
        
        try:
            # Get daily analytics
            query = supabase.table("daily_analytics").select("*").gte("date", start_date)
            
            if class_id:
                query = query.eq("class_id", str(class_id))
            elif department_id:
                query = query.eq("department_id", str(department_id))
            
            analytics = query.order("date", desc=True).execute()
            
            if not analytics.data or len(analytics.data) < 3:
                return []
            
            # Calculate average and check for outliers
            rates = [a.get("attendance_rate", 0) for a in analytics.data]
            if len(rates) >= 3:
                avg_rate = statistics.mean(rates)
                
                # Check for significant drops
                for analytic in analytics.data:
                    day_rate = analytic.get("attendance_rate", 0)
                    
                    # If more than 25% below average
                    if avg_rate > 0 and (avg_rate - day_rate) / avg_rate > 0.25:
                        anomaly = {
                            "type": "class_wide_drop",
                            "entity_type": "class",
                            "entity_id": analytic.get("class_id"),
                            "date": analytic.get("date"),
                            "severity": "high" if (avg_rate - day_rate) / avg_rate > 0.40 else "medium",
                            "details": {
                                "day_rate": round(day_rate, 1),
                                "average_rate": round(avg_rate, 1),
                                "absent_count": analytic.get("absent_count", 0),
                                "total_students": analytic.get("total_students", 0)
                            },
                            "detected_at": datetime.utcnow().isoformat()
                        }
                        anomalies.append(anomaly)
            
            return anomalies
        except Exception as e:
            print(f"Class anomalies detection error: {e}")
            return []
    
    @staticmethod
    async def _save_anomaly(anomaly: Dict):
        """Save anomaly to database"""
        if not supabase:
            return
        
        try:
            supabase.table("attendance_anomalies").insert({
                "anomaly_type": anomaly["type"],
                "affected_entity_type": anomaly["entity_type"],
                "affected_entity_id": anomaly["entity_id"],
                "severity": anomaly["severity"],
                "details": anomaly.get("details", {})
            }).execute()
        except Exception as e:
            print(f"Save anomaly error: {e}")
    
    # ============================================
    # Risk Analysis
    # ============================================
    
    @staticmethod
    async def analyze_risk(
        department_id: Optional[UUID] = None,
        class_id: Optional[UUID] = None,
        threshold: float = 75.0
    ) -> Dict:
        """
        Comprehensive risk analysis for at-risk students
        Returns categorized students with recommendations
        """
        if not supabase:
            return {"error": "Database unavailable"}
        
        try:
            # Get all students with summaries
            query = supabase.table("attendance_summary").select(
                "*, student_profiles(id, name, roll_number, class_id, department_id, parent_phone), subjects(name)"
            ).lt("attendance_percentage", threshold)
            
            results = query.execute()
            
            if not results.data:
                return {
                    "risk_summary": {
                        "critical": 0,
                        "high": 0,
                        "medium": 0,
                        "total_at_risk": 0
                    },
                    "students": [],
                    "recommendations": []
                }
            
            # Categorize students
            students_map = {}
            for record in results.data:
                student = record.get("student_profiles", {})
                if not student:
                    continue
                
                # Filter by department/class if specified
                if department_id and student.get("department_id") != str(department_id):
                    continue
                if class_id and student.get("class_id") != str(class_id):
                    continue
                
                sid = student["id"]
                if sid not in students_map:
                    students_map[sid] = {
                        "student_id": sid,
                        "name": student["name"],
                        "roll_number": student["roll_number"],
                        "parent_phone": student.get("parent_phone"),
                        "low_subjects": [],
                        "lowest_percentage": 100
                    }
                
                pct = record.get("attendance_percentage", 0)
                subject_name = record.get("subjects", {}).get("name", "Unknown")
                
                students_map[sid]["low_subjects"].append({
                    "subject": subject_name,
                    "percentage": pct
                })
                
                if pct < students_map[sid]["lowest_percentage"]:
                    students_map[sid]["lowest_percentage"] = pct
            
            # Assign risk levels and sort
            students_list = []
            critical_count = 0
            high_count = 0
            medium_count = 0
            
            for student in students_map.values():
                lowest = student["lowest_percentage"]
                if lowest < 50:
                    student["risk_level"] = RiskLevel.CRITICAL.value
                    critical_count += 1
                elif lowest < 65:
                    student["risk_level"] = RiskLevel.HIGH.value
                    high_count += 1
                else:
                    student["risk_level"] = RiskLevel.MEDIUM.value
                    medium_count += 1
                
                students_list.append(student)
            
            # Sort by risk
            students_list.sort(key=lambda x: x["lowest_percentage"])
            
            # Generate recommendations
            recommendations = []
            if critical_count > 0:
                recommendations.append({
                    "priority": "urgent",
                    "action": "Immediate parent meeting required",
                    "count": critical_count,
                    "description": f"{critical_count} student(s) have attendance below 50%"
                })
            if high_count > 0:
                recommendations.append({
                    "priority": "high",
                    "action": "Send warning notification to parents",
                    "count": high_count,
                    "description": f"{high_count} student(s) have attendance between 50-65%"
                })
            if medium_count > 0:
                recommendations.append({
                    "priority": "medium",
                    "action": "Monitor and counsel students",
                    "count": medium_count,
                    "description": f"{medium_count} student(s) have attendance between 65-75%"
                })
            
            return {
                "risk_summary": {
                    "critical": critical_count,
                    "high": high_count,
                    "medium": medium_count,
                    "total_at_risk": len(students_list)
                },
                "students": students_list,
                "recommendations": recommendations,
                "generated_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"Risk analysis error: {e}")
            return {"error": str(e)}
    
    # ============================================
    # Batch Predictions
    # ============================================
    
    @staticmethod
    async def batch_predict_class(
        class_id: UUID,
        subject_id: Optional[UUID] = None,
        prediction_date: Optional[date] = None
    ) -> List[Dict]:
        """Generate predictions for all students in a class"""
        if not supabase:
            return []
        
        try:
            # Get all students in class
            students = supabase.table("student_profiles").select("id, name, roll_number").eq("class_id", str(class_id)).execute()
            
            predictions = []
            for student in (students.data or []):
                prediction = await MLService.predict_attendance(
                    UUID(student["id"]), 
                    subject_id, 
                    prediction_date
                )
                prediction["student_name"] = student["name"]
                prediction["roll_number"] = student["roll_number"]
                predictions.append(prediction)
            
            # Sort by probability (lowest first - most at risk)
            predictions.sort(key=lambda x: x.get("probability", 1))
            
            return predictions
        except Exception as e:
            print(f"Batch prediction error: {e}")
            return []
