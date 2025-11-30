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
    // Mock Data Store
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
        }
    ];

    // Get all faculty members
    static async getAllFaculty(): Promise<FacultyData[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
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
}
