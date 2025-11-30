
import { db } from './src/lib/db';
import { students, users, attendanceLogs, attendanceRecords } from './src/lib/schema';
import { eq, inArray } from 'drizzle-orm';

async function deleteAllStudents() {
    console.log('Starting bulk deletion of students...');

    try {
        // 1. Get all students to identify user IDs
        const allStudents = await db.select().from(students);
        console.log(`Found ${allStudents.length} students to delete.`);

        if (allStudents.length === 0) {
            console.log('No students found in students table. Checking for orphaned users...');
        }

        const studentIds = allStudents.map(s => s.id);
        const userIds = allStudents.map(s => s.userId).filter(id => id !== null) as number[];

        // 2. Delete attendance logs
        if (studentIds.length > 0) {
            console.log('Deleting attendance logs...');
            try {
                await db.delete(attendanceLogs).where(inArray(attendanceLogs.studentId, studentIds));
            } catch (error: any) {
                if (error.code === '42P01') {
                    console.warn('attendance_logs table does not exist, skipping.');
                } else {
                    console.error('Error deleting attendance logs:', error);
                }
            }

            // 3. Delete attendance records
            console.log('Deleting attendance records...');
            try {
                await db.delete(attendanceRecords).where(inArray(attendanceRecords.studentId, studentIds));
            } catch (error: any) {
                if (error.code === '42P01') {
                    console.warn('attendance_records table does not exist, skipping.');
                } else if (error.code === '22P02') {
                    console.warn('attendance_records schema mismatch (UUID vs Int), skipping.');
                } else {
                    console.error('Error deleting attendance records:', error);
                }
            }
        }

        // 4. Delete students
        console.log('Deleting students...');
        await db.delete(students);

        // 5. Delete users
        if (userIds.length > 0) {
            console.log(`Deleting ${userIds.length} linked user accounts...`);
            await db.delete(users).where(inArray(users.id, userIds));
        }

        // 6. Delete any remaining users with role 'student' (orphaned accounts)
        console.log('Checking for orphaned student user accounts...');
        const orphanedStudents = await db.select().from(users).where(eq(users.role, 'student'));
        if (orphanedStudents.length > 0) {
            console.log(`Found ${orphanedStudents.length} orphaned student accounts. Deleting...`);
            await db.delete(users).where(eq(users.role, 'student'));
        }

        console.log('Successfully deleted all students and associated data.');
        process.exit(0);

    } catch (error) {
        console.error('Fatal error during deletion:', error);
        process.exit(1);
    }
}

deleteAllStudents();
