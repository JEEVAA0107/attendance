import { db } from './db';
import { faculty, attendance_logs, faculty_sessions, students, subjects, timetable } from './schema';
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';

export interface FacultyPerformanceMetrics {
  id: string;
  name: string;
  biometricId: string;
  attendanceRate: number;
  classesCompleted: number;
  totalClasses: number;
  avgClassDuration: number;
  lastLogin: string;
  status: 'active' | 'inactive' | 'attention';
  weeklyHours: number;
  punctualityScore: number;
}

export interface StudentAlert {
  id: string;
  name: string;
  rollNumber: string;
  attendanceRate: number;
  subject: string;
  facultyName: string;
  consecutiveAbsences: number;
  lastAttendance: string;
  alertType: 'low_attendance' | 'consecutive_absence' | 'performance_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DepartmentOverview {
  totalFaculty: number;
  activeFaculty: number;
  totalStudents: number;
  avgAttendance: number;
  todayClasses: number;
  completedClasses: number;
  systemUptime: number;
  dataAccuracy: number;
}

export interface SystemAlert {
  id: string;
  type: 'system_error' | 'data_inconsistency' | 'security_breach' | 'performance_issue';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export class HoDSurveillanceService {
  
  // Faculty Performance Monitoring
  static async getFacultyPerformanceMetrics(dateRange?: { start: Date; end: Date }): Promise<FacultyPerformanceMetrics[]> {
    try {
      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      const endDate = dateRange?.end || new Date();

      const facultyData = await db
        .select({
          id: faculty.id,
          name: faculty.name,
          biometricId: faculty.biometricId,
          department: faculty.department,
        })
        .from(faculty)
        .where(eq(faculty.department, 'AI&DS'));

      const performanceMetrics: FacultyPerformanceMetrics[] = [];

      for (const f of facultyData) {
        // Get attendance logs for the faculty
        const attendanceLogs = await db
          .select()
          .from(attendance_logs)
          .where(
            and(
              eq(attendance_logs.facultyId, f.id),
              gte(attendance_logs.timestamp, startDate),
              lte(attendance_logs.timestamp, endDate)
            )
          );

        // Get faculty sessions
        const sessions = await db
          .select()
          .from(faculty_sessions)
          .where(
            and(
              eq(faculty_sessions.facultyId, f.id),
              gte(faculty_sessions.loginTime, startDate),
              lte(faculty_sessions.loginTime, endDate)
            )
          )
          .orderBy(desc(faculty_sessions.loginTime));

        // Calculate metrics
        const totalScheduledClasses = await this.getTotalScheduledClasses(f.id, startDate, endDate);
        const completedClasses = attendanceLogs.length;
        const attendanceRate = totalScheduledClasses > 0 ? (completedClasses / totalScheduledClasses) * 100 : 0;
        
        // Calculate average class duration
        const avgClassDuration = this.calculateAverageClassDuration(sessions);
        
        // Calculate weekly hours
        const weeklyHours = this.calculateWeeklyHours(sessions);
        
        // Calculate punctuality score
        const punctualityScore = this.calculatePunctualityScore(sessions, attendanceLogs);
        
        // Determine status
        const status = this.determineFacultyStatus(attendanceRate, punctualityScore, weeklyHours);
        
        const lastSession = sessions[0];
        
        performanceMetrics.push({
          id: f.id,
          name: f.name,
          biometricId: f.biometricId,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          classesCompleted: completedClasses,
          totalClasses: totalScheduledClasses,
          avgClassDuration,
          lastLogin: lastSession?.loginTime?.toISOString() || 'Never',
          status,
          weeklyHours,
          punctualityScore
        });
      }

      return performanceMetrics.sort((a, b) => b.attendanceRate - a.attendanceRate);
    } catch (error) {
      console.error('Error fetching faculty performance metrics:', error);
      return [];
    }
  }

  // Student Monitoring and Alerts
  static async getStudentAlerts(threshold: number = 75): Promise<StudentAlert[]> {
    try {
      const alerts: StudentAlert[] = [];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get all students with low attendance
      const studentsData = await db
        .select()
        .from(students);

      for (const student of studentsData) {
        // Get attendance logs for the student
        const attendanceLogs = await db
          .select({
            timestamp: attendance_logs.timestamp,
            facultyId: attendance_logs.facultyId,
            subjectId: attendance_logs.subjectId,
          })
          .from(attendance_logs)
          .where(
            and(
              eq(attendance_logs.studentId, student.id),
              gte(attendance_logs.timestamp, thirtyDaysAgo)
            )
          )
          .orderBy(desc(attendance_logs.timestamp));

        // Calculate attendance rate
        const totalClasses = await this.getTotalClassesForStudent(student.id, thirtyDaysAgo);
        const attendedClasses = attendanceLogs.length;
        const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        if (attendanceRate < threshold) {
          // Get subject and faculty info for the most recent class
          const recentLog = attendanceLogs[0];
          let subjectName = 'Unknown';
          let facultyName = 'Unknown';

          if (recentLog) {
            const subjectInfo = await db
              .select({ name: subjects.name })
              .from(subjects)
              .where(eq(subjects.id, recentLog.subjectId))
              .limit(1);

            const facultyInfo = await db
              .select({ name: faculty.name })
              .from(faculty)
              .where(eq(faculty.id, recentLog.facultyId))
              .limit(1);

            subjectName = subjectInfo[0]?.name || 'Unknown';
            facultyName = facultyInfo[0]?.name || 'Unknown';
          }

          // Calculate consecutive absences
          const consecutiveAbsences = this.calculateConsecutiveAbsences(attendanceLogs);

          // Determine alert type and severity
          const { alertType, severity } = this.determineAlertTypeAndSeverity(
            attendanceRate,
            consecutiveAbsences,
            threshold
          );

          alerts.push({
            id: student.id,
            name: student.name,
            rollNumber: student.rollNumber,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            subject: subjectName,
            facultyName,
            consecutiveAbsences,
            lastAttendance: attendanceLogs[0]?.timestamp?.toISOString() || 'Never',
            alertType,
            severity
          });
        }
      }

      return alerts.sort((a, b) => a.attendanceRate - b.attendanceRate);
    } catch (error) {
      console.error('Error fetching student alerts:', error);
      return [];
    }
  }

  // Department Overview
  static async getDepartmentOverview(): Promise<DepartmentOverview> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      // Get total faculty count
      const totalFacultyResult = await db
        .select({ count: count() })
        .from(faculty)
        .where(eq(faculty.department, 'AI&DS'));

      // Get active faculty (logged in today)
      const activeFacultyResult = await db
        .select({ count: count() })
        .from(faculty_sessions)
        .innerJoin(faculty, eq(faculty_sessions.facultyId, faculty.id))
        .where(
          and(
            eq(faculty.department, 'AI&DS'),
            gte(faculty_sessions.loginTime, startOfDay),
            lte(faculty_sessions.loginTime, endOfDay)
          )
        );

      // Get total students
      const totalStudentsResult = await db
        .select({ count: count() })
        .from(students);

      // Get today's classes
      const todayClassesResult = await db
        .select({ count: count() })
        .from(timetable)
        .where(
          and(
            eq(timetable.dayOfWeek, today.getDay()),
            eq(timetable.isActive, true)
          )
        );

      // Get completed classes today
      const completedClassesResult = await db
        .select({ count: count() })
        .from(attendance_logs)
        .where(
          and(
            gte(attendance_logs.timestamp, startOfDay),
            lte(attendance_logs.timestamp, endOfDay)
          )
        );

      // Calculate average attendance (last 30 days)
      const avgAttendance = await this.calculateDepartmentAverageAttendance();

      return {
        totalFaculty: totalFacultyResult[0]?.count || 0,
        activeFaculty: activeFacultyResult[0]?.count || 0,
        totalStudents: totalStudentsResult[0]?.count || 0,
        avgAttendance,
        todayClasses: todayClassesResult[0]?.count || 0,
        completedClasses: completedClassesResult[0]?.count || 0,
        systemUptime: 99.8, // Mock data - would be calculated from system metrics
        dataAccuracy: 97.5  // Mock data - would be calculated from validation checks
      };
    } catch (error) {
      console.error('Error fetching department overview:', error);
      return {
        totalFaculty: 0,
        activeFaculty: 0,
        totalStudents: 0,
        avgAttendance: 0,
        todayClasses: 0,
        completedClasses: 0,
        systemUptime: 0,
        dataAccuracy: 0
      };
    }
  }

  // System Monitoring
  static async getSystemAlerts(): Promise<SystemAlert[]> {
    // Mock implementation - in real system, this would check various system metrics
    const alerts: SystemAlert[] = [
      {
        id: '1',
        type: 'performance_issue',
        message: 'Database query response time increased by 15%',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'data_inconsistency',
        message: 'Attendance record mismatch detected for 3 students',
        severity: 'high',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];

    return alerts;
  }

  // Helper Methods
  private static async getTotalScheduledClasses(facultyId: string, startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation - would calculate based on timetable
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekdays = Math.floor(daysDiff * 5 / 7); // Approximate weekdays
    return Math.floor(weekdays * 2.5); // Assume 2.5 classes per day on average
  }

  private static async getTotalClassesForStudent(studentId: string, startDate: Date): Promise<number> {
    // Mock implementation - would calculate based on student's timetable
    const daysDiff = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekdays = Math.floor(daysDiff * 5 / 7);
    return Math.floor(weekdays * 6); // Assume 6 classes per day
  }

  private static calculateAverageClassDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const durations = sessions
      .filter(s => s.logoutTime)
      .map(s => (new Date(s.logoutTime).getTime() - new Date(s.loginTime).getTime()) / (1000 * 60)); // minutes
    
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  private static calculateWeeklyHours(sessions: any[]): number {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(s => new Date(s.loginTime) >= oneWeekAgo);
    
    const totalMinutes = recentSessions
      .filter(s => s.logoutTime)
      .reduce((total, s) => {
        const duration = (new Date(s.logoutTime).getTime() - new Date(s.loginTime).getTime()) / (1000 * 60);
        return total + duration;
      }, 0);
    
    return totalMinutes / 60; // Convert to hours
  }

  private static calculatePunctualityScore(sessions: any[], attendanceLogs: any[]): number {
    // Mock implementation - would calculate based on scheduled vs actual login times
    return Math.random() * 20 + 80; // Random score between 80-100
  }

  private static determineFacultyStatus(attendanceRate: number, punctualityScore: number, weeklyHours: number): 'active' | 'inactive' | 'attention' {
    if (attendanceRate >= 90 && punctualityScore >= 85 && weeklyHours >= 35) {
      return 'active';
    } else if (attendanceRate < 70 || punctualityScore < 70 || weeklyHours < 25) {
      return 'attention';
    } else if (weeklyHours === 0) {
      return 'inactive';
    }
    return 'active';
  }

  private static calculateConsecutiveAbsences(attendanceLogs: any[]): number {
    // Mock implementation - would calculate actual consecutive absences
    return Math.floor(Math.random() * 5); // Random between 0-4
  }

  private static determineAlertTypeAndSeverity(
    attendanceRate: number,
    consecutiveAbsences: number,
    threshold: number
  ): { alertType: StudentAlert['alertType']; severity: StudentAlert['severity'] } {
    if (consecutiveAbsences >= 5) {
      return { alertType: 'consecutive_absence', severity: 'critical' };
    } else if (attendanceRate < threshold * 0.6) {
      return { alertType: 'low_attendance', severity: 'critical' };
    } else if (attendanceRate < threshold * 0.8) {
      return { alertType: 'low_attendance', severity: 'high' };
    } else if (consecutiveAbsences >= 3) {
      return { alertType: 'consecutive_absence', severity: 'medium' };
    } else {
      return { alertType: 'performance_drop', severity: 'low' };
    }
  }

  private static async calculateDepartmentAverageAttendance(): Promise<number> {
    // Mock implementation - would calculate actual department average
    return Math.random() * 15 + 75; // Random between 75-90
  }

  // Real-time Monitoring Methods
  static async getFacultyLoginStatus(): Promise<{ facultyId: string; name: string; isLoggedIn: boolean; loginTime?: string }[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const facultyWithSessions = await db
        .select({
          facultyId: faculty.id,
          name: faculty.name,
          loginTime: faculty_sessions.loginTime,
          logoutTime: faculty_sessions.logoutTime,
        })
        .from(faculty)
        .leftJoin(
          faculty_sessions,
          and(
            eq(faculty_sessions.facultyId, faculty.id),
            gte(faculty_sessions.loginTime, startOfDay),
            sql`${faculty_sessions.logoutTime} IS NULL OR ${faculty_sessions.logoutTime} > ${startOfDay}`
          )
        )
        .where(eq(faculty.department, 'AI&DS'));

      return facultyWithSessions.map(f => ({
        facultyId: f.facultyId,
        name: f.name,
        isLoggedIn: !!f.loginTime && !f.logoutTime,
        loginTime: f.loginTime?.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching faculty login status:', error);
      return [];
    }
  }

  // Audit and Compliance
  static async generateAuditReport(startDate: Date, endDate: Date): Promise<{
    facultyCompliance: any[];
    studentCompliance: any[];
    systemIntegrity: any[];
  }> {
    // Mock implementation for audit report generation
    return {
      facultyCompliance: [],
      studentCompliance: [],
      systemIntegrity: []
    };
  }
}

export default HoDSurveillanceService;