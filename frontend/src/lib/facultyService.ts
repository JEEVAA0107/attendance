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
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...this.mockFaculty];
    }

    // Create a new faculty member
    static async createFaculty(data: Omit<FacultyData, 'id' | 'isActive'>): Promise<{ success: boolean; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check for duplicate ID
        if (this.mockFaculty.some(f => f.biometricId === data.biometricId)) {
            return { success: false, error: 'Faculty ID already exists (Mock).' };
        }

        const newId = Math.max(...this.mockFaculty.map(f => f.id)) + 1;
        const newFacultyMember: FacultyData = {
            id: newId,
            ...data,
            isActive: true
        };

        this.mockFaculty.unshift(newFacultyMember);
        return { success: true };
    }

    // Toggle faculty active status
    static async toggleFacultyStatus(biometricId: string, isActive: boolean): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const faculty = this.mockFaculty.find(f => f.biometricId === biometricId);
        if (faculty) {
            faculty.isActive = isActive;
            return true;
        }
        return false;
    }

    // Update faculty member
    static async updateFaculty(biometricId: string, data: Partial<Pick<FacultyData, 'name' | 'email' | 'designation' | 'department'>>): Promise<{ success: boolean; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const facultyIndex = this.mockFaculty.findIndex(f => f.biometricId === biometricId);
        if (facultyIndex === -1) {
            return { success: false, error: 'Faculty not found' };
        }

        this.mockFaculty[facultyIndex] = {
            ...this.mockFaculty[facultyIndex],
            ...data
        };
        return { success: true };
    }

    // Delete faculty member
    static async deleteFaculty(biometricId: string): Promise<{ success: boolean; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const facultyIndex = this.mockFaculty.findIndex(f => f.biometricId === biometricId);
        if (facultyIndex === -1) {
            return { success: false, error: 'Faculty not found' };
        }

        this.mockFaculty.splice(facultyIndex, 1);
        return { success: true };
    }
}
