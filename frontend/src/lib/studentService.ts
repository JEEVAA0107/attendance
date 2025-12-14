import { db } from './db';
import { users, students, attendanceLogs, attendanceRecords } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface StudentData {
    id: number;
    userId: number;
    name: string;
    rollNumber: string;
    regNo?: string;
    email: string;
    phone?: string;
    parentPhone?: string;
    department: string;
    batch: string;
    biometricId?: string;
}

export class StudentService {
    // Get all students
    static async getAllStudents(): Promise<StudentData[]> {
        try {
            const result = await db.select().from(students).orderBy(desc(students.createdAt));
            return result as StudentData[];
        } catch (error) {
            console.error('Error fetching students:', error);
            return [];
        }
    }

    // Create a new student with user account
    static async createStudent(data: Omit<StudentData, 'id' | 'userId'>): Promise<{ success: boolean; error?: string }> {
        try {
            // 1. Check if user already exists (by email)
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, data.email)
            });

            if (existingUser) {
                return { success: false, error: 'User with this email already exists.' };
            }

            // Check if student already exists (by roll number)
            const existingStudent = await db.query.students.findFirst({
                where: eq(students.rollNumber, data.rollNumber)
            });

            if (existingStudent) {
                return { success: false, error: 'Student with this Roll Number already exists.' };
            }

            // 2. Create User account
            // Use roll number as biometric ID if not provided, as it's often used for login
            const biometricId = data.biometricId || data.rollNumber;

            const [newUser] = await db.insert(users).values({
                email: data.email,
                role: 'student',
                biometricId: biometricId,
                isActive: true
            }).returning();

            if (!newUser) {
                return { success: false, error: 'Failed to create user account.' };
            }

            // 3. Create Student profile
            await db.insert(students).values({
                userId: newUser.id,
                name: data.name,
                rollNumber: data.rollNumber,
                regNo: data.regNo,
                email: data.email,
                phone: data.phone,
                parentPhone: data.parentPhone,
                department: data.department,
                batch: data.batch,
                biometricId: biometricId
            });

            return { success: true };
        } catch (error: any) {
            console.error('Error creating student:', error);
            return { success: false, error: error.message || 'Failed to create student.' };
        }
    }

    // Delete a student and their user account
    static async deleteStudent(id: number): Promise<{ success: boolean; error?: string }> {
        try {
            // Get student to find userId
            const student = await db.query.students.findFirst({
                where: eq(students.id, id)
            });

            if (!student) {
                return { success: false, error: 'Student not found.' };
            }

            // Explicitly delete dependencies to avoid foreign key violations
            // 1. Delete attendance logs
            try {
                await db.delete(attendanceLogs).where(eq(attendanceLogs.studentId, id));
            } catch (error: any) {
                // Ignore if table doesn't exist
                if (error.code === '42P01') {
                    console.warn('attendance_logs table does not exist, skipping deletion.');
                } else {
                    console.error('Failed to delete attendance logs:', error);
                }
            }

            // 2. Delete attendance records
            try {
                await db.delete(attendanceRecords).where(eq(attendanceRecords.studentId, id));
            } catch (error: any) {
                // Ignore if table doesn't exist (42P01) or if there's a type mismatch (22P02 - invalid text representation)
                // The type mismatch happens because prod DB has UUID student_id while we use Integer
                if (error.code === '42P01') {
                    console.warn('attendance_records table does not exist, skipping deletion.');
                } else if (error.code === '22P02') {
                    console.warn('attendance_records has incompatible schema (UUID vs Int), skipping deletion.');
                } else {
                    console.error('Failed to delete attendance records:', error);
                }
            }

            // 3. Delete student profile
            await db.delete(students).where(eq(students.id, id));

            // 4. Delete user account
            if (student.userId) {
                await db.delete(users).where(eq(users.id, student.userId));
            }

            return { success: true };
        } catch (error: any) {
            console.error('Error deleting student:', error);
            return { success: false, error: error.message || 'Failed to delete student.' };
        }
    }

    // Bulk create students (optimized for fast uploads)
    static async bulkCreateStudents(studentsData: Omit<StudentData, 'id' | 'userId'>[]): Promise<{
        successCount: number;
        duplicateCount: number;
        failCount: number;
        errors: string[];
    }> {
        let successCount = 0;
        let duplicateCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        try {
            // Process in batches to avoid overwhelming the database
            const batchSize = 10;
            for (let i = 0; i < studentsData.length; i += batchSize) {
                const batch = studentsData.slice(i, i + batchSize);

                // Process each student in the batch
                const results = await Promise.allSettled(
                    batch.map(async (data) => {
                        const result = await this.createStudent(data);
                        if (!result.success) {
                            if (result.error?.includes('already exists')) {
                                return { status: 'duplicate', error: result.error };
                            }
                            return { status: 'failed', error: result.error };
                        }
                        return { status: 'success' };
                    })
                );

                // Count results
                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        const value = result.value as any;
                        if (value.status === 'success') {
                            successCount++;
                        } else if (value.status === 'duplicate') {
                            duplicateCount++;
                        } else {
                            failCount++;
                            errors.push(value.error || 'Unknown error');
                        }
                    } else {
                        failCount++;
                        errors.push(result.reason?.message || 'Unknown error');
                    }
                });
            }

            return { successCount, duplicateCount, failCount, errors };
        } catch (error: any) {
            console.error('Error in bulk create:', error);
            return {
                successCount,
                duplicateCount,
                failCount: studentsData.length - successCount - duplicateCount,
                errors: [error.message || 'Bulk operation failed']
            };
        }
    }

    // Delete all students and their user accounts
    static async deleteAllStudents(): Promise<{ success: boolean; count: number; error?: string }> {
        try {
            // Get all students
            const allStudents = await db.select().from(students);

            if (allStudents.length === 0) {
                return { success: true, count: 0 };
            }

            // Delete all attendance records (ignore errors)
            try {
                await db.delete(attendanceLogs);
            } catch (error: any) {
                if (error.code !== '42P01') {
                    console.warn('Failed to delete attendance logs:', error);
                }
            }

            try {
                await db.delete(attendanceRecords);
            } catch (error: any) {
                if (error.code !== '42P01' && error.code !== '22P02') {
                    console.warn('Failed to delete attendance records:', error);
                }
            }

            // Get all student user IDs
            const userIds = allStudents.map(s => s.userId).filter(Boolean);

            // Delete all student profiles
            await db.delete(students);

            // Delete all student user accounts
            if (userIds.length > 0) {
                for (const userId of userIds) {
                    try {
                        await db.delete(users).where(eq(users.id, userId));
                    } catch (error) {
                        console.warn(`Failed to delete user ${userId}:`, error);
                    }
                }
            }

            return { success: true, count: allStudents.length };
        } catch (error: any) {
            console.error('Error deleting all students:', error);
            return { success: false, count: 0, error: error.message || 'Failed to delete all students.' };
        }
    }
}
