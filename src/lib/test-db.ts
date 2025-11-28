import { db } from './db';
import { students, attendanceRecords } from './schema';

export async function testDatabase() {
  try {
    // Test connection and show tables
    const studentCount = await db.select().from(students);
    const attendanceCount = await db.select().from(attendanceRecords);
    
    console.log('Database connected successfully!');
    console.log(`Students: ${studentCount.length}`);
    console.log(`Attendance records: ${attendanceCount.length}`);
    
    return { students: studentCount, attendance: attendanceCount };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}