import { db } from './db';
import { students, attendanceRecords, attendanceReports } from './schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';
import * as XLSX from 'xlsx';

export interface AttendanceStats {
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  partialStudents: number;
  attendancePercentage: number;
}

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  periods: boolean[];
  totalHours: number;
  isFullDay: boolean;

}



export interface ReportData {
  type: 'daily' | 'weekly' | 'monthly';
  dateRange: { start: string; end: string };
  stats: AttendanceStats;
  studentRecords: StudentAttendanceRecord[];
  subjectWiseStats?: any[];
}

export class AttendanceService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Common Attendance Functions
  async markDailyAttendance(studentId: string, date: string, periods: boolean[]): Promise<void> {
    const totalHours = this.calculateTotalHours(periods);
    const isFullDay = totalHours >= 7;

    try {
      await db.insert(attendanceRecords).values({
        studentId,
        userId: this.userId,
        attendanceDate: date,
        period1: periods[0] || false,
        period2: periods[1] || false,
        period3: periods[2] || false,
        period4: periods[3] || false,
        period5: periods[4] || false,
        period6: periods[5] || false,
        period7: periods[6] || false,
      });
    } catch (error) {
      // Record might already exist, try to update
      await db.update(attendanceRecords)
        .set({
          period1: periods[0] || false,
          period2: periods[1] || false,
          period3: periods[2] || false,
          period4: periods[3] || false,
          period5: periods[4] || false,
          period6: periods[5] || false,
          period7: periods[6] || false,
        })
        .where(and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.attendanceDate, date)
        ));
    }
  }





  private calculateTotalHours(periods: boolean[]): number {
    return periods.filter(p => p).length;
  }

  // Report Generation Functions
  async generateDailyReport(date: string, batch?: string): Promise<ReportData> {
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
    
    const studentRecords: StudentAttendanceRecord[] = results.map(result => ({
      studentId: result.student.id,
      studentName: result.student.name,
      rollNo: result.student.rollNo,
      periods: [
        result.attendance?.period1 || false,
        result.attendance?.period2 || false,
        result.attendance?.period3 || false,
        result.attendance?.period4 || false,
        result.attendance?.period5 || false,
        result.attendance?.period6 || false,
        result.attendance?.period7 || false,
      ],
      totalHours: this.calculateTotalHours([
        result.attendance?.period1 || false,
        result.attendance?.period2 || false,
        result.attendance?.period3 || false,
        result.attendance?.period4 || false,
        result.attendance?.period5 || false,
        result.attendance?.period6 || false,
        result.attendance?.period7 || false,
      ]),
      isFullDay: this.calculateTotalHours([
        result.attendance?.period1 || false,
        result.attendance?.period2 || false,
        result.attendance?.period3 || false,
        result.attendance?.period4 || false,
        result.attendance?.period5 || false,
        result.attendance?.period6 || false,
        result.attendance?.period7 || false,
      ]) >= 7,
    }));

    const stats = this.calculateStats(studentRecords);

    return {
      type: 'daily',
      dateRange: { start: date, end: date },
      stats,
      studentRecords,
    };
  }

  async generateWeeklyReport(startDate: string, endDate: string, batch?: string): Promise<ReportData> {
    const dates = this.getDateRange(startDate, endDate);
    const allRecords: StudentAttendanceRecord[] = [];

    for (const date of dates) {
      const dailyReport = await this.generateDailyReport(date, batch);
      allRecords.push(...dailyReport.studentRecords);
    }

    // Aggregate weekly data per student
    const studentMap = new Map<string, StudentAttendanceRecord>();
    
    allRecords.forEach(record => {
      const key = record.studentId;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          ...record,
          periods: Array(7).fill(0),
          totalHours: 0,
          isFullDay: false,
        });
      }
      
      const existing = studentMap.get(key)!;
      existing.totalHours += record.totalHours;
      record.periods.forEach((present, index) => {
        if (present) existing.periods[index] = (existing.periods[index] as number) + 1;
      });
    });

    const weeklyRecords = Array.from(studentMap.values()).map(record => ({
      ...record,
      isFullDay: record.totalHours >= (dates.length * 7 * 0.8), // 80% threshold
    }));

    const stats = this.calculateStats(weeklyRecords);

    return {
      type: 'weekly',
      dateRange: { start: startDate, end: endDate },
      stats,
      studentRecords: weeklyRecords,
    };
  }

  async generateMonthlyReport(year: number, month: number, batch?: string): Promise<ReportData> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return this.generateWeeklyReport(startDate, endDate, batch);
  }

  private calculateStats(records: StudentAttendanceRecord[]): AttendanceStats {
    const totalStudents = records.length;
    let presentStudents = 0;
    let partialStudents = 0;
    let absentStudents = 0;

    records.forEach(record => {
      if (record.isFullDay) {
        presentStudents++;
      } else if (record.totalHours > 0) {
        partialStudents++;
      } else {
        absentStudents++;
      }
    });

    const attendancePercentage = totalStudents > 0 
      ? Math.round(((presentStudents + partialStudents * 0.5) / totalStudents) * 100)
      : 0;

    return {
      totalStudents,
      presentStudents,
      absentStudents,
      partialStudents,
      attendancePercentage,
    };
  }

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

  // Excel Export Functions
  async exportToExcel(reportData: ReportData, templateType: 'standard' | 'college' = 'standard'): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Report Type', reportData.type.toUpperCase()],
      ['Date Range', `${reportData.dateRange.start} to ${reportData.dateRange.end}`],
      ['Total Students', reportData.stats.totalStudents],
      ['Present Students', reportData.stats.presentStudents],
      ['Partial Present', reportData.stats.partialStudents],
      ['Absent Students', reportData.stats.absentStudents],
      ['Attendance %', `${reportData.stats.attendancePercentage}%`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Detailed Sheet
    const detailedData = [
      ['S.No', 'Roll No', 'Student Name', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'Total Hours', 'Status']
    ];

    reportData.studentRecords.forEach((record, index) => {
      detailedData.push([
        index + 1,
        record.rollNo,
        record.studentName,
        ...record.periods.map(p => typeof p === 'boolean' ? (p ? 'P' : 'A') : p),
        record.totalHours,
        record.isFullDay ? 'Full Day' : record.totalHours > 0 ? 'Partial' : 'Absent'
      ]);
    });

    const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Report');

    // Convert to blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Analytics Functions
  async getAttendancePatterns(studentId: string, days: number = 30): Promise<any> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const records = await db.select()
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.studentId, studentId),
        eq(attendanceRecords.userId, this.userId),
        gte(attendanceRecords.attendanceDate, startDate),
        lte(attendanceRecords.attendanceDate, endDate)
      ))
      .orderBy(asc(attendanceRecords.attendanceDate));

    return {
      totalDays: records.length,
      presentDays: records.filter(r => r.isFullDay).length,
      partialDays: records.filter(r => !r.isFullDay && parseFloat(r.totalHours || '0') > 0).length,
      absentDays: records.filter(r => parseFloat(r.totalHours || '0') === 0).length,
      averageHours: records.reduce((sum, r) => sum + parseFloat(r.totalHours || '0'), 0) / records.length,
      trend: records.map(r => ({
        date: r.attendanceDate,
        hours: parseFloat(r.totalHours || '0'),
        isFullDay: r.isFullDay,
      })),
    };
  }

  async identifyInconsistencies(date: string): Promise<any[]> {
    // Basic inconsistency check - can be extended later
    return [];
  }
}