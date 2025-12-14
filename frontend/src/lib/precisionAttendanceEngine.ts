import { db } from './db';
import { students, attendanceRecords, subjectAttendance, subjects, staff } from './schema';
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

export interface StudentDayRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string;
  totalHours: number;
  isFullDay: boolean;
  subjects: SubjectEntry[];
  overallStatus: 'present' | 'partial' | 'absent';
}

export interface ConsolidatedReport {
  date: string;
  totalStudents: number;
  presentCount: number;
  partialCount: number;
  absentCount: number;
  attendanceRate: number;
  studentRecords: StudentDayRecord[];
  subjectWiseStats: Record<string, { present: number; total: number; rate: number }>;
}

export class PrecisionAttendanceEngine {
  private userId: string;
  private readonly MASTER_HOURS = 7;
  private readonly FULL_DAY_THRESHOLD = 0.8; // 80% of master hours

  constructor(userId: string) {
    this.userId = userId;
  }

  // Core 7-hour rule calculation
  private calculateAttendanceStatus(totalHours: number): 'present' | 'partial' | 'absent' {
    if (totalHours >= this.MASTER_HOURS * this.FULL_DAY_THRESHOLD) return 'present';
    if (totalHours > 0) return 'partial';
    return 'absent';
  }

  // Process subject-wise attendance for a student on a specific date
  async processSubjectAttendance(studentId: string, date: string, subjectEntries: SubjectEntry[]): Promise<void> {
    // Clear existing subject attendance for the date
    await db.delete(subjectAttendance)
      .where(and(
        eq(subjectAttendance.studentId, studentId),
        eq(subjectAttendance.attendanceDate, date),
        eq(subjectAttendance.userId, this.userId)
      ));

    // Insert new subject attendance entries
    for (const entry of subjectEntries) {
      await db.insert(subjectAttendance).values({
        studentId,
        subjectId: entry.subjectId,
        staffId: entry.staffId,
        userId: this.userId,
        attendanceDate: date,
        period: entry.period,
        isPresent: entry.isPresent,
        hours: entry.hours.toString(),
      });
    }

    // Auto-consolidate into overall attendance
    await this.consolidateToOverallAttendance(studentId, date);
  }

  // Consolidate subject-wise entries into overall daily attendance
  private async consolidateToOverallAttendance(studentId: string, date: string): Promise<void> {
    const subjectRecords = await db.select({
      period: subjectAttendance.period,
      isPresent: subjectAttendance.isPresent,
      hours: subjectAttendance.hours,
    })
    .from(subjectAttendance)
    .where(and(
      eq(subjectAttendance.studentId, studentId),
      eq(subjectAttendance.attendanceDate, date),
      eq(subjectAttendance.userId, this.userId)
    ));

    // Calculate period-wise presence and total hours
    const periods = Array(7).fill(false);
    let totalHours = 0;

    subjectRecords.forEach(record => {
      if (record.isPresent && record.period >= 1 && record.period <= 7) {
        periods[record.period - 1] = true;
        totalHours += parseFloat(record.hours || '1');
      }
    });

    const isFullDay = this.calculateAttendanceStatus(totalHours) === 'present';

    // Update overall attendance record
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
  async generateDailyReport(date: string, batch?: string): Promise<ConsolidatedReport> {
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
    const studentRecords: StudentDayRecord[] = [];
    let presentCount = 0, partialCount = 0, absentCount = 0;

    for (const result of results) {
      // Get subject-wise attendance for this student
      const subjectData = await db.select({
        subjectAttendance: subjectAttendance,
        subject: subjects,
        staff: staff,
      })
      .from(subjectAttendance)
      .innerJoin(subjects, eq(subjects.id, subjectAttendance.subjectId))
      .innerJoin(staff, eq(staff.id, subjectAttendance.staffId))
      .where(and(
        eq(subjectAttendance.studentId, result.student.id),
        eq(subjectAttendance.attendanceDate, date),
        eq(subjectAttendance.userId, this.userId)
      ));

      const subjectEntries: SubjectEntry[] = subjectData.map(item => ({
        subjectId: item.subject.id,
        subjectName: item.subject.name,
        staffId: item.staff.id,
        staffName: item.staff.name,
        period: item.subjectAttendance.period,
        isPresent: item.subjectAttendance.isPresent,
        hours: parseFloat(item.subjectAttendance.hours || '1'),
      }));

      const totalHours = subjectEntries.reduce((sum, entry) => 
        sum + (entry.isPresent ? entry.hours : 0), 0);
      
      const overallStatus = this.calculateAttendanceStatus(totalHours);
      
      if (overallStatus === 'present') presentCount++;
      else if (overallStatus === 'partial') partialCount++;
      else absentCount++;

      studentRecords.push({
        studentId: result.student.id,
        studentName: result.student.name,
        rollNo: result.student.rollNo,
        date,
        totalHours,
        isFullDay: overallStatus === 'present',
        subjects: subjectEntries,
        overallStatus,
      });
    }

    // Calculate subject-wise statistics
    const subjectWiseStats: Record<string, { present: number; total: number; rate: number }> = {};
    
    studentRecords.forEach(record => {
      record.subjects.forEach(subject => {
        if (!subjectWiseStats[subject.subjectName]) {
          subjectWiseStats[subject.subjectName] = { present: 0, total: 0, rate: 0 };
        }
        subjectWiseStats[subject.subjectName].total++;
        if (subject.isPresent) {
          subjectWiseStats[subject.subjectName].present++;
        }
      });
    });

    // Calculate rates
    Object.keys(subjectWiseStats).forEach(subject => {
      const stats = subjectWiseStats[subject];
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
      subjectWiseStats,
    };
  }

  // Generate weekly consolidated report
  async generateWeeklyReport(startDate: string, endDate: string, batch?: string): Promise<ConsolidatedReport[]> {
    const dates = this.getDateRange(startDate, endDate);
    const reports: ConsolidatedReport[] = [];

    for (const date of dates) {
      const dailyReport = await this.generateDailyReport(date, batch);
      reports.push(dailyReport);
    }

    return reports;
  }

  // Generate monthly consolidated report
  async generateMonthlyReport(year: number, month: number, batch?: string): Promise<ConsolidatedReport[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return this.generateWeeklyReport(startDate, endDate, batch);
  }

  // Export to college Excel template
  async exportToCollegeTemplate(report: ConsolidatedReport): Promise<any[]> {
    const excelData = [
      // Header row
      ['S.No', 'Roll No', 'Student Name', 'Total Hours', 'Status', 'Attendance %', ...Object.keys(report.subjectWiseStats)],
    ];

    report.studentRecords.forEach((record, index) => {
      const subjectColumns = Object.keys(report.subjectWiseStats).map(subjectName => {
        const subjectEntry = record.subjects.find(s => s.subjectName === subjectName);
        return subjectEntry ? (subjectEntry.isPresent ? 'P' : 'A') : '-';
      });

      const attendancePercentage = Math.round((record.totalHours / this.MASTER_HOURS) * 100);

      excelData.push([
        index + 1,
        record.rollNo,
        record.studentName,
        record.totalHours,
        record.overallStatus.toUpperCase(),
        `${attendancePercentage}%`,
        ...subjectColumns,
      ]);
    });

    // Add summary row
    excelData.push([]);
    excelData.push(['SUMMARY', '', '', '', '', '', '']);
    excelData.push(['Total Students', report.totalStudents, '', '', '', '', '']);
    excelData.push(['Present', report.presentCount, '', '', '', '', '']);
    excelData.push(['Partial', report.partialCount, '', '', '', '', '']);
    excelData.push(['Absent', report.absentCount, '', '', '', '', '']);
    excelData.push(['Overall Rate', `${report.attendanceRate}%`, '', '', '', '', '']);

    return excelData;
  }

  // N8n automation data format
  formatForN8nAutomation(report: ConsolidatedReport): any {
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
      subjectStats: report.subjectWiseStats,
      studentData: report.studentRecords.map(record => ({
        studentId: record.studentId,
        rollNo: record.rollNo,
        name: record.studentName,
        totalHours: record.totalHours,
        status: record.overallStatus,
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

  // Error detection and validation
  async validateAttendanceData(date: string): Promise<string[]> {
    const errors: string[] = [];

    // Check for students with subject attendance but no overall record
    const orphanedSubjects = await db.select({
      student: students,
      subject: subjects,
    })
    .from(subjectAttendance)
    .innerJoin(students, eq(students.id, subjectAttendance.studentId))
    .innerJoin(subjects, eq(subjects.id, subjectAttendance.subjectId))
    .leftJoin(attendanceRecords, and(
      eq(attendanceRecords.studentId, subjectAttendance.studentId),
      eq(attendanceRecords.attendanceDate, date)
    ))
    .where(and(
      eq(subjectAttendance.attendanceDate, date),
      eq(subjectAttendance.userId, this.userId),
      sql`${attendanceRecords.id} IS NULL`
    ));

    orphanedSubjects.forEach(record => {
      errors.push(`${record.student.name} has ${record.subject.name} attendance but no overall record`);
    });

    return errors;
  }
}