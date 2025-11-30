import { db } from './db';
import { faculty, subjects, timetable, attendanceLogs, facultySessions, students, attendanceRecords } from './schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';

export interface FacultyAuth {
  facultyId: string;
  biometricId: string;
  sessionToken: string;
  name: string;
  designation: string;
  department: string;
}

export interface SubjectAccess {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  batch: string;
  period: number;
  dayOfWeek: number;
  canMark: boolean;
  canModify: boolean;
  canApprove: boolean;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  rollNo: string;
  isPresent: boolean;
  hours: number;
  markedAt: string;
}

export class FacultyAttendanceEngine {
  private userId: string;
  private readonly MASTER_HOURS = 7;
  private readonly SESSION_DURATION = 8; // hours

  constructor(userId: string) {
    this.userId = userId;
  }

  // Biometric Authentication
  async authenticateFaculty(biometricId: string, ipAddress?: string, userAgent?: string): Promise<FacultyAuth | null> {
    const facultyRecord = await db.select()
      .from(faculty)
      .where(and(
        eq(faculty.biometricId, biometricId),
        eq(faculty.isActive, true),
        eq(faculty.userId, this.userId)
      ))
      .limit(1);

    if (facultyRecord.length === 0) return null;

    const facultyData = facultyRecord[0];
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION * 60 * 60 * 1000);

    // Create session
    await db.insert(facultySessions).values({
      facultyId: facultyData.id,
      biometricId,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
      ipAddress,
      userAgent,
    });

    return {
      facultyId: facultyData.id,
      biometricId,
      sessionToken,
      name: facultyData.name,
      designation: facultyData.designation,
      department: facultyData.department || '',
    };
  }

  // Get Faculty Subject Access
  async getFacultySubjects(facultyId: string, date: string): Promise<SubjectAccess[]> {
    const dayOfWeek = new Date(date).getDay() || 7; // Convert Sunday (0) to 7

    const subjectAccess = await db.select({
      subject: subjects,
      timetable: timetable,
    })
    .from(subjects)
    .innerJoin(timetable, eq(timetable.subjectId, subjects.id))
    .where(and(
      eq(subjects.facultyId, facultyId),
      eq(timetable.facultyId, facultyId),
      eq(timetable.dayOfWeek, dayOfWeek),
      eq(timetable.isActive, true),
      eq(subjects.userId, this.userId)
    ))
    .orderBy(timetable.period);

    return subjectAccess.map(item => ({
      subjectId: item.subject.id,
      subjectName: item.subject.name,
      subjectCode: item.subject.code,
      batch: item.timetable.batch,
      period: item.timetable.period,
      dayOfWeek: item.timetable.dayOfWeek,
      canMark: true,
      canModify: true,
      canApprove: true,
    }));
  }

  // Mark Subject Attendance
  async markSubjectAttendance(
    facultyId: string,
    subjectId: string,
    date: string,
    period: number,
    attendanceEntries: AttendanceEntry[]
  ): Promise<boolean> {
    // Verify faculty has access to this subject/period
    const hasAccess = await this.verifyFacultyAccess(facultyId, subjectId, period);
    if (!hasAccess) throw new Error('Unauthorized: Faculty does not have access to this subject/period');

    try {
      // Mark attendance for each student
      for (const entry of attendanceEntries) {
        await db.insert(attendanceLogs).values({
          studentId: entry.studentId,
          subjectId,
          facultyId,
          userId: this.userId,
          attendanceDate: date,
          period,
          isPresent: entry.isPresent,
          hours: entry.hours.toString(),
          markedBy: facultyId,
        }).onConflictDoUpdate({
          target: [attendanceLogs.studentId, attendanceLogs.subjectId, attendanceLogs.attendanceDate, attendanceLogs.period],
          set: {
            isPresent: entry.isPresent,
            hours: entry.hours.toString(),
            isModified: true,
            modifiedBy: facultyId,
            modifiedAt: new Date().toISOString(),
          }
        });
      }

      // Auto-consolidate to overall attendance
      await this.consolidateAttendance(date);
      return true;

    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  }

  // 7-Hour Precision Logic Consolidation
  private async consolidateAttendance(date: string): Promise<void> {
    // Get all students with attendance logs for the date
    const studentLogs = await db.select({
      studentId: attendanceLogs.studentId,
      period: attendanceLogs.period,
      isPresent: attendanceLogs.isPresent,
      hours: attendanceLogs.hours,
    })
    .from(attendanceLogs)
    .where(and(
      eq(attendanceLogs.attendanceDate, date),
      eq(attendanceLogs.userId, this.userId)
    ));

    // Group by student
    const studentMap = new Map<string, { periods: boolean[], totalHours: number }>();

    studentLogs.forEach(log => {
      if (!studentMap.has(log.studentId)) {
        studentMap.set(log.studentId, { periods: Array(7).fill(false), totalHours: 0 });
      }

      const studentData = studentMap.get(log.studentId)!;
      if (log.isPresent && log.period >= 1 && log.period <= 7) {
        studentData.periods[log.period - 1] = true;
        studentData.totalHours += parseFloat(log.hours || '1');
      }
    });

    // Update overall attendance records
    for (const [studentId, data] of studentMap) {
      const isFullDay = data.totalHours >= (this.MASTER_HOURS * 0.8); // 80% threshold

      await db.insert(attendanceRecords).values({
        studentId,
        userId: this.userId,
        attendanceDate: date,
        period1: data.periods[0],
        period2: data.periods[1],
        period3: data.periods[2],
        period4: data.periods[3],
        period5: data.periods[4],
        period6: data.periods[5],
        period7: data.periods[6],
        totalHours: data.totalHours.toString(),
        isFullDay,
        computedBy: 'faculty-engine',
        lastUpdated: new Date().toISOString(),
      }).onConflictDoUpdate({
        target: [attendanceRecords.studentId, attendanceRecords.attendanceDate],
        set: {
          period1: data.periods[0],
          period2: data.periods[1],
          period3: data.periods[2],
          period4: data.periods[3],
          period5: data.periods[4],
          period6: data.periods[5],
          period7: data.periods[6],
          totalHours: data.totalHours.toString(),
          isFullDay,
          lastUpdated: new Date().toISOString(),
        }
      });
    }
  }

  // Verify Faculty Access
  private async verifyFacultyAccess(facultyId: string, subjectId: string, period: number): Promise<boolean> {
    const access = await db.select()
      .from(timetable)
      .where(and(
        eq(timetable.facultyId, facultyId),
        eq(timetable.subjectId, subjectId),
        eq(timetable.period, period),
        eq(timetable.isActive, true)
      ))
      .limit(1);

    return access.length > 0;
  }

  // Generate Reports
  async generateFacultyReport(facultyId: string, startDate: string, endDate: string): Promise<any> {
    const logs = await db.select({
      log: attendanceLogs,
      student: students,
      subject: subjects,
    })
    .from(attendanceLogs)
    .innerJoin(students, eq(students.id, attendanceLogs.studentId))
    .innerJoin(subjects, eq(subjects.id, attendanceLogs.subjectId))
    .where(and(
      eq(attendanceLogs.facultyId, facultyId),
      gte(attendanceLogs.attendanceDate, startDate),
      lte(attendanceLogs.attendanceDate, endDate),
      eq(attendanceLogs.userId, this.userId)
    ))
    .orderBy(desc(attendanceLogs.attendanceDate));

    // Process and structure the data
    const reportData = {
      facultyId,
      dateRange: { start: startDate, end: endDate },
      totalClasses: logs.length,
      subjectWise: this.groupBySubject(logs),
      dailySummary: this.groupByDate(logs),
    };

    return reportData;
  }

  // Export for N8n
  formatForN8n(reportData: any): any {
    return {
      timestamp: new Date().toISOString(),
      source: 'FacultyAttendanceEngine',
      engine: 'neon-db-powered',
      facultyId: reportData.facultyId,
      dateRange: reportData.dateRange,
      summary: {
        totalClasses: reportData.totalClasses,
        subjects: Object.keys(reportData.subjectWise).length,
        avgAttendance: this.calculateAverageAttendance(reportData.subjectWise),
      },
      data: reportData,
    };
  }

  // Utility Methods
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private groupBySubject(logs: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    logs.forEach(item => {
      const subjectName = item.subject.name;
      if (!grouped[subjectName]) {
        grouped[subjectName] = { total: 0, present: 0, logs: [] };
      }
      grouped[subjectName].total++;
      if (item.log.isPresent) grouped[subjectName].present++;
      grouped[subjectName].logs.push(item);
    });
    return grouped;
  }

  private groupByDate(logs: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    logs.forEach(item => {
      const date = item.log.attendanceDate;
      if (!grouped[date]) {
        grouped[date] = { total: 0, present: 0 };
      }
      grouped[date].total++;
      if (item.log.isPresent) grouped[date].present++;
    });
    return grouped;
  }

  private calculateAverageAttendance(subjectWise: Record<string, any>): number {
    const subjects = Object.values(subjectWise);
    if (subjects.length === 0) return 0;
    
    const totalRate = subjects.reduce((sum: number, subject: any) => {
      return sum + (subject.total > 0 ? (subject.present / subject.total) * 100 : 0);
    }, 0);
    
    return Math.round(totalRate / subjects.length);
  }

  // Session Management
  async validateSession(sessionToken: string): Promise<FacultyAuth | null> {
    const session = await db.select({
      session: facultySessions,
      faculty: faculty,
    })
    .from(facultySessions)
    .innerJoin(faculty, eq(faculty.id, facultySessions.facultyId))
    .where(and(
      eq(facultySessions.sessionToken, sessionToken),
      eq(facultySessions.isActive, true),
      gte(facultySessions.expiresAt, new Date().toISOString())
    ))
    .limit(1);

    if (session.length === 0) return null;

    return {
      facultyId: session[0].faculty.id,
      biometricId: session[0].session.biometricId,
      sessionToken,
      name: session[0].faculty.name,
      designation: session[0].faculty.designation,
      department: session[0].faculty.department || '',
    };
  }

  async logout(sessionToken: string): Promise<boolean> {
    try {
      await db.update(facultySessions)
        .set({ isActive: false })
        .where(eq(facultySessions.sessionToken, sessionToken));
      return true;
    } catch {
      return false;
    }
  }
}