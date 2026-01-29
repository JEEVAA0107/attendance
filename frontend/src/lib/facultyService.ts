import { db } from './db';
import { users, faculty } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface FacultyData {
    id: number;
    name: string;
    email: string;
    biometricId: string; // Used as Faculty ID
    designation: string;
    department: string;
    isActive: boolean;
}

export class FacultyService {
    // AI&DS Faculty Registry - 14 faculty members with biometric IDs
    private static mockFaculty: FacultyData[] = [
        {
            id: 1,
            name: 'Dr. S. Ananth',
            email: 'ananth@college.edu',
            biometricId: '10521',
            designation: 'Professor & HoD',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 2,
            name: 'Prof. K. Priya',
            email: 'priya@college.edu',
            biometricId: '10522',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 3,
            name: 'Dr. Rajesh Kumar',
            email: 'rajesh@college.edu',
            biometricId: '10523',
            designation: 'Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 4,
            name: 'Prof. Meera Singh',
            email: 'meera@college.edu',
            biometricId: '10524',
            designation: 'Associate Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 5,
            name: 'Dr. Amit Patel',
            email: 'amit@college.edu',
            biometricId: '10525',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: false
        },
        {
            id: 6,
            name: 'Prof. Sneha Gupta',
            email: 'sneha@college.edu',
            biometricId: '10526',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 7,
            name: 'Dr. Vikram Sharma',
            email: 'vikram@college.edu',
            biometricId: '10527',
            designation: 'Associate Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 8,
            name: 'Prof. Anjali Desai',
            email: 'anjali@college.edu',
            biometricId: '10528',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 9,
            name: 'Dr. Ravi Verma',
            email: 'ravi@college.edu',
            biometricId: '10529',
            designation: 'Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 10,
            name: 'Prof. Kavya Nair',
            email: 'kavya@college.edu',
            biometricId: '10530',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 11,
            name: 'Dr. Suresh Reddy',
            email: 'suresh@college.edu',
            biometricId: '10531',
            designation: 'Associate Professor',
            department: 'AI & Data Science',
            isActive: false
        },
        {
            id: 12,
            name: 'Prof. Deepika Joshi',
            email: 'deepika@college.edu',
            biometricId: '10532',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 13,
            name: 'Dr. Arjun Mehta',
            email: 'arjun@college.edu',
            biometricId: '10533',
            designation: 'Professor',
            department: 'AI & Data Science',
            isActive: true
        },
        {
            id: 14,
            name: 'Prof. Pooja Agarwal',
            email: 'pooja@college.edu',
            biometricId: '10534',
            designation: 'Assistant Professor',
            department: 'AI & Data Science',
            isActive: true
        }
    ];

    // Get all faculty members
    static async getAllFaculty(): Promise<FacultyData[]> {
        try {
            const facultyData = await db.select({
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                biometricId: faculty.biometricId,
                designation: faculty.designation,
                department: faculty.department
            })
            .from(faculty)
            .orderBy(desc(faculty.createdAt));

            return facultyData.map(f => ({ ...f, isActive: true }));
        } catch (error) {
            console.error('Error fetching faculty:', error);
            return [];
        }
    }

    // Create a new faculty member
    static async createFaculty(data: Omit<FacultyData, 'id' | 'isActive'>): Promise<{ success: boolean; error?: string }> {
        try {
            // Check for duplicate biometric ID in users table
            const existingUser = await db.select().from(users).where(eq(users.biometricId, data.biometricId)).limit(1);
            if (existingUser.length > 0) {
                return { success: false, error: 'Faculty ID already exists.' };
            }

            // Check for duplicate email
            const existingEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
            if (existingEmail.length > 0) {
                return { success: false, error: 'Email already exists.' };
            }

            // Insert into users table first
            const [newUser] = await db.insert(users).values({
                email: data.email,
                biometricId: data.biometricId,
                role: 'faculty',
                isActive: true
            }).returning({ id: users.id });

            // Insert into faculty table
            await db.insert(faculty).values({
                userId: newUser.id,
                name: data.name,
                designation: data.designation,
                biometricId: data.biometricId,
                department: data.department,
                email: data.email,
                isActive: true
            });

            return { success: true };
        } catch (error) {
            console.error('Error creating faculty:', error);
            return { success: false, error: 'Failed to create faculty member.' };
        }
    }

    // Toggle faculty active status
    static async toggleFacultyStatus(biometricId: string, isActive: boolean): Promise<boolean> {
        try {
            // Update both users and faculty tables
            await db.update(users)
                .set({ isActive })
                .where(eq(users.biometricId, biometricId));

            await db.update(faculty)
                .set({ isActive })
                .where(eq(faculty.biometricId, biometricId));

            return true;
        } catch (error) {
            console.error('Error updating faculty status:', error);
            return false;
        }
    }

    // Update faculty member
    static async updateFaculty(biometricId: string, data: Partial<Pick<FacultyData, 'name' | 'email' | 'designation' | 'department'>>): Promise<{ success: boolean; error?: string }> {
        try {
            // Update users table if email is provided
            if (data.email) {
                await db.update(users)
                    .set({ email: data.email })
                    .where(eq(users.biometricId, biometricId));
            }

            // Update faculty table
            await db.update(faculty)
                .set({
                    ...(data.name && { name: data.name }),
                    ...(data.email && { email: data.email }),
                    ...(data.designation && { designation: data.designation }),
                    ...(data.department && { department: data.department })
                })
                .where(eq(faculty.biometricId, biometricId));

            return { success: true };
        } catch (error) {
            console.error('Error updating faculty:', error);
            return { success: false, error: 'Failed to update faculty member.' };
        }
    }

    // Authenticate faculty member
    static async authenticateFaculty(nameOrEmail: string, biometricId: string): Promise<{ success: boolean; faculty?: FacultyData; error?: string }> {
        try {
            const facultyData = await db.select({
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                biometricId: faculty.biometricId,
                designation: faculty.designation,
                department: faculty.department
            })
            .from(faculty)
            .where(eq(faculty.biometricId, biometricId))
            .limit(1);

            if (facultyData.length === 0) {
                return { success: false, error: 'Invalid biometric ID.' };
            }

            const facultyMember = facultyData[0];

            // Check if name or email matches
            const nameMatch = facultyMember.name?.toLowerCase().includes(nameOrEmail.toLowerCase()) || false;
            const emailMatch = facultyMember.email?.toLowerCase() === nameOrEmail.toLowerCase() || false;

            if (!nameMatch && !emailMatch) {
                return { success: false, error: 'Name/Email does not match.' };
            }

            return { success: true, faculty: { ...facultyMember, isActive: true } };
        } catch (error) {
            console.error('Error authenticating faculty:', error);
            return { success: false, error: 'Authentication failed.' };
        }
    }
    // Delete faculty member
    static async deleteFaculty(biometricId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Delete from faculty table (cascade will handle users table)
            const result = await db.delete(faculty)
                .where(eq(faculty.biometricId, biometricId));

            return { success: true };
        } catch (error) {
            console.error('Error deleting faculty:', error);
            return { success: false, error: 'Failed to delete faculty member.' };
        }
    }
}