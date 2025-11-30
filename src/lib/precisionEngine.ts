import { db } from './db';
import { students, attendanceRecords } from './schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

export interface SubjectEntry {
  subjectId: string;
  subjectName: string;
  staffId: string;
  staffName: string;
  period: number;
  isPresent: boolean;
  hours: number;
}

export interface StudentRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string;
  totalHours: number;
  isFullDay: boolean;
  subjects: SubjectEntry[];
  status: 'present' | 'partial' | 'absent';
}

export interface PrecisionReport {
  date: string;
  totalStudents: number;
  presentCount: number;
  partialCount: number;
  absentCount: number;
  attendanceRate: number;
  studentRecords: StudentRecord[];
  subjectStats: Record<string, { present: number; total: number; rate: number }>;
}

export class PrecisionAttendanceEngine {
  private userId: string;
  private readonly MASTER_HOURS = 7;
  private readonly FULL_DAY_THRESHOLD = 0.8;

  constructor(userId: string) {
    this.userId = userId;
  }

  // 7-hour rule calculation
  private calculateStatus(totalHours: number): 'present' | 'partial' | 'absent' {
    if (totalHours >= this.MASTER_HOURS * this.FULL_DAY_THRESHOLD) return 'present';
    if (totalHours > 0) return 'partial';
    return 'absent';
  }

  // Process subject-wise attendance
  async processSubjectAttendance(studentId: string, date: string, subjects: SubjectEntry[]): Promise<void> {
    // Calculate periods from subjects
    const periods = Array(7).fill(false);
    let totalHours = 0;

    subjects.forEach(subject => {
      if (subject.isPresent && subject.period >= 1 && subject.period <= 7) {
        periods[subject.period - 1] = true;
        totalHours += subject.hours;
      }
    });

    // Auto-consolidate to overall attendance
    await db.insert(attendanceRecords).values({
      studentId,
      userId: this.userId,
      attendanceDate: date,
      period1: periods[0],
      period2: periods[1],
      period3: periods[2],
      period4: periods[3],
      period5: periods[4],
      period6: periods[5],
      period7: periods[6],
    }).onConflictDoUpdate({
      target: [attendanceRecords.studentId, attendanceRecords.attendanceDate],
      set: {
        period1: periods[0],
        period2: periods[1],
        period3: periods[2],
        period4: periods[3],
        period5: periods[4],
        period6: periods[5],
        period7: periods[6],
      }
    });
  }

  // Generate precision daily report
  async generateDailyReport(date: string, batch?: string): Promise<PrecisionReport> {
    const query = db.select({
      student: students,
      attendance: attendanceRecords,
    })
    .from(students)
    .leftJoin(attendanceRecords, and(
      eq(attendanceRecords.studentId, students.id),
      eq(attendanceRecords.attendanceDate, date)
    ))
    .where(eq(students.userId, this.userId));

    if (batch) {
      query.where(and(eq(students.userId, this.userId), eq(students.batch, batch)));
    }

    const results = await query;
    const studentRecords: StudentRecord[] = [];
    let presentCount = 0, partialCount = 0, absentCount = 0;
    const subjectStats: Record<string, { present: number; total: number; rate: number }> = {};

    for (const result of results) {
      // Mock subject data - in real implementation, this would come from subject_attendance table
      const mockSubjects: SubjectEntry[] = [
        { subjectId: '1', subjectName: 'Mathematics', staffId: '1', staffName: 'Dr. Smith', period: 1, isPresent: result.attendance?.period1 || false, hours: 1 },
        { subjectId: '2', subjectName: 'Physics', staffId: '2', staffName: 'Dr. Johnson', period: 2, isPresent: result.attendance?.period2 || false, hours: 1 },
        { subjectId: '3', subjectName: 'Chemistry', staffId: '3', staffName: 'Dr. Brown', period: 3, isPresent: result.attendance?.period3 || false, hours: 1 },
        { subjectId: '4', subjectName: 'English', staffId: '4', staffName: 'Prof. Davis', period: 4, isPresent: result.attendance?.period4 || false, hours: 1 },
        { subjectId: '5', subjectName: 'Biology', staffId: '5', staffName: 'Dr. Wilson', period: 5, isPresent: result.attendance?.period5 || false, hours: 1 },
        { subjectId: '6', subjectName: 'Computer Science', staffId: '6', staffName: 'Prof. Miller', period: 6, isPresent: result.attendance?.period6 || false, hours: 1 },
        { subjectId: '7', subjectName: 'History', staffId: '7', staffName: 'Dr. Taylor', period: 7, isPresent: result.attendance?.period7 || false, hours: 1 },
      ];

      const totalHours = mockSubjects.reduce((sum, subject) => 
        sum + (subject.isPresent ? subject.hours : 0), 0);
      
      const status = this.calculateStatus(totalHours);
      
      if (status === 'present') presentCount++;
      else if (status === 'partial') partialCount++;
      else absentCount++;

      // Update subject stats
      mockSubjects.forEach(subject => {
        if (!subjectStats[subject.subjectName]) {
          subjectStats[subject.subjectName] = { present: 0, total: 0, rate: 0 };
        }
        subjectStats[subject.subjectName].total++;
        if (subject.isPresent) {
          subjectStats[subject.subjectName].present++;
        }
      });

      studentRecords.push({
        studentId: result.student.id,
        studentName: result.student.name,
        rollNo: result.student.rollNo,
        date,
        totalHours,
        isFullDay: status === 'present',
        subjects: mockSubjects,
        status,
      });
    }

    // Calculate subject rates
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    });

    const totalStudents = studentRecords.length;
    const attendanceRate = totalStudents > 0 
      ? Math.round(((presentCount + partialCount * 0.5) / totalStudents) * 100) 
      : 0;

    return {
      date,
      totalStudents,
      presentCount,
      partialCount,
      absentCount,
      attendanceRate,
      studentRecords,
      subjectStats,
    };
  }

  // Generate weekly report
  async generateWeeklyReport(startDate: string, endDate: string, batch?: string): Promise<PrecisionReport[]> {
    const dates = this.getDateRange(startDate, endDate);
    const reports: PrecisionReport[] = [];

    for (const date of dates) {
      const dailyReport = await this.generateDailyReport(date, batch);
      reports.push(dailyReport);
    }

    return reports;
  }

  // Generate monthly report
  async generateMonthlyReport(year: number, month: number, batch?: string): Promise<PrecisionReport[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return this.generateWeeklyReport(startDate, endDate, batch);
  }

  // Export to college Excel template
  exportToCollegeTemplate(report: PrecisionReport): any[] {
    const excelData = [
      ['S.No', 'Roll No', 'Student Name', 'Total Hours', 'Status', 'Attendance %', ...Object.keys(report.subjectStats)],
    ];

    report.studentRecords.forEach((record, index) => {
      const subjectColumns = Object.keys(report.subjectStats).map(subjectName => {
        const subject = record.subjects.find(s => s.subjectName === subjectName);
        return subject ? (subject.isPresent ? 'P' : 'A') : '-';
      });

      const attendancePercentage = Math.round((record.totalHours / this.MASTER_HOURS) * 100);

      excelData.push([
        index + 1,
        record.rollNo,
        record.studentName,
        record.totalHours,
        record.status.toUpperCase(),
        `${attendancePercentage}%`,
        ...subjectColumns,
      ]);
    });

    // Summary
    excelData.push([]);
    excelData.push(['SUMMARY']);
    excelData.push(['Total Students', report.totalStudents]);
    excelData.push(['Present', report.presentCount]);
    excelData.push(['Partial', report.partialCount]);
    excelData.push(['Absent', report.absentCount]);
    excelData.push(['Overall Rate', `${report.attendanceRate}%`]);

    return excelData;
  }

  // N8n automation format
  formatForN8n(report: PrecisionReport): any {
    return {
      timestamp: new Date().toISOString(),
      source: 'PrecisionAttendanceEngine',
      reportDate: report.date,
      summary: {
        totalStudents: report.totalStudents,
        presentCount: report.presentCount,
        partialCount: report.partialCount,
        absentCount: report.absentCount,
        attendanceRate: report.attendanceRate,
      },
      subjectStats: report.subjectStats,
      studentData: report.studentRecords.map(record => ({
        studentId: record.studentId,
        rollNo: record.rollNo,
        name: record.studentName,
        totalHours: record.totalHours,
        status: record.status,
        subjects: record.subjects.map(s => ({
          name: s.subjectName,
          staff: s.staffName,
          period: s.period,
          present: s.isPresent,
        })),
      })),
    };
  }

  // Utility: Get date range
  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
      dates.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }

    return dates;
  }

  // Error detection
  async validateData(date: string): Promise<string[]> {
    const errors: string[] = [];
    
    // Basic validation - can be extended
    const records = await db.select()
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.attendanceDate, date),
        eq(attendanceRecords.userId, this.userId)
      ));

    if (records.length === 0) {
      errors.push('No attendance records found for this date');
    }

    return errors;
  }
}