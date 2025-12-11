import { db } from './db';
import { users, students, faculty } from './schema';
import { eq, and } from 'drizzle-orm';

export interface AppUser {
    id: string;
    email: string;
    authId: string; // biometricId/facultyId/studentId
    role: 'student' | 'faculty' | 'hod' | 'admin';
    name: string;
    profileData?: any;
}

export interface AuthResult {
    success: boolean;
    user?: AppUser;
    redirectPath?: string;
    error?: string;
}

export class AppAuthService {

    // Authenticate user with Name and ID (biometricId in DB)
    static async authenticateUser(name: string, authId: string, allowedRoles: string[]): Promise<AuthResult> {
        try {
            // Find user by Auth ID (stored in biometricId field)
            const user = await db
                .select({
                    id: users.id,
                    email: users.email,
                    biometricId: users.biometricId,
                    role: users.role,
                    isActive: users.isActive,
                })
                .from(users)
                .where(and(
                    eq(users.biometricId, authId),
                    eq(users.isActive, true)
                ))
                .limit(1);

            if (!user.length) {
                return {
                    success: false,
                    error: 'Invalid ID or user inactive'
                };
            }

            const userData = user[0];

            // Check role permission
            if (!allowedRoles.includes(userData.role)) {
                return {
                    success: false,
                    error: `Access denied. This login is for ${allowedRoles.join(' or ')} only.`
                };
            }

            let profileData = null;
            let dbName = '';

            // Get additional profile data based on role
            if (userData.role === 'faculty' || userData.role === 'hod') {
                const facultyProfile = await db
                    .select({
                        name: faculty.name,
                        designation: faculty.designation,
                        department: faculty.department,
                        biometricId: faculty.biometricId,
                    })
                    .from(faculty)
                    .where(eq(faculty.userId, userData.id))
                    .limit(1);

                if (facultyProfile.length) {
                    profileData = facultyProfile[0];
                    dbName = facultyProfile[0].name;
                }
            } else if (userData.role === 'student') {
                const studentProfile = await db
                    .select({
                        name: students.name,
                        rollNumber: students.rollNumber,
                        department: students.department,
                        batch: students.batch,
                    })
                    .from(students)
                    .where(eq(students.userId, userData.id))
                    .limit(1);

                if (studentProfile.length) {
                    profileData = studentProfile[0];
                    dbName = studentProfile[0].name;
                }
            }

            // Verify Name (Case insensitive check)
            if (dbName && name) {
                if (!dbName.toLowerCase().includes(name.toLowerCase()) && !name.toLowerCase().includes(dbName.toLowerCase())) {
                    return {
                        success: false,
                        error: 'Name does not match the ID provided.'
                    };
                }
            }

            // Update last login
            await db
                .update(users)
                .set({ lastLogin: new Date() })
                .where(eq(users.id, userData.id));

            // Determine redirect path based on role
            const redirectPath = this.getRedirectPath(userData.role);

            return {
                success: true,
                user: {
                    id: userData.id,
                    email: userData.email,
                    authId: userData.biometricId!,
                    role: userData.role as any,
                    name: dbName || name, // Fallback to input name if no profile
                    profileData
                },
                redirectPath
            };

        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: 'Authentication failed. Please try again.'
            };
        }
    }

    // Get redirect path based on user role
    private static getRedirectPath(role: string): string {
        switch (role) {
            case 'student':
                return '/student-dashboard';
            case 'faculty':
                return '/faculty-dashboard';
            case 'hod':
                return '/hod-workspace';
            case 'admin':
                return '/admin-dashboard';
            default:
                return '/dashboard';
        }
    }

    // Mock data seeder for testing
    static async seedMockUsers(): Promise<void> {
        console.log('Use setup-faculty-data.js for seeding.');
    }
}

export default AppAuthService;
