import { db } from './db';
import { users, students, faculty } from './schema';
import { eq, and } from 'drizzle-orm';

export interface FacultyUser {
  id: string;
  email: string;
  facultyId: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  name: string;
  profileData?: any;
}

export interface FacultyAuthResult {
  success: boolean;
  user?: FacultyUser;
  redirectPath?: string;
  error?: string;
}

export class FacultyAuthService {
  
  // Authenticate user with Name and Faculty ID
  static async authenticateWithFacultyId(name: string, facultyId: string): Promise<FacultyAuthResult> {
    try {
      // Find user by Faculty ID (stored in biometricId field)
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
          eq(users.biometricId, facultyId),
          eq(users.isActive, true)
        ))
        .limit(1);

      if (!user.length) {
        return {
          success: false,
          error: 'Invalid Faculty ID or user inactive'
        };
      }

      const userData = user[0];
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
      } else {
         return {
          success: false,
          error: 'This login is restricted to Faculty and HoD only.'
        };
      }

      // Verify Name (Case insensitive partial match or exact match?)
      // The requirement implies "use name and their id for login". 
      // Let's do a simple case-insensitive check.
      if (dbName.toLowerCase() !== name.toLowerCase()) {
          // Try checking if the input name is part of the DB name or vice versa to be more forgiving?
          // For security, exact match (case-insensitive) is better, but let's stick to strict for now.
          // Actually, let's allow if the input name is contained in the DB name to handle "Dr. S. Ananth" vs "S. Ananth"
          if (!dbName.toLowerCase().includes(name.toLowerCase()) && !name.toLowerCase().includes(dbName.toLowerCase())) {
             return {
              success: false,
              error: 'Name does not match the Faculty ID provided.'
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
          facultyId: userData.biometricId!,
          role: userData.role as any,
          name: dbName,
          profileData
        },
        redirectPath
      };

    } catch (error) {
      console.error('Faculty authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
  }

  // Get redirect path based on user role
  private static getRedirectPath(role: string): string {
    switch (role) {
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
    try {
      // Create mock users from the provided list
      const facultyList = [
        { name: 'Dr. S. Ananth', id: '10521', role: 'hod', designation: 'HOD / Associate Professor' },
        { name: 'Mrs. R. Mekala', id: '10528', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. M. Chitra', id: '10533', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. M. Nithiya', id: '10534', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. P. Jayapriya', id: '10544', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Ms. P. Baby Priyadharshini', id: '13202', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mr. R. Sathishkumar', id: '10540', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. L. S. Kavitha', id: '13201', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mr. K. Thangadurai', id: '13208', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. M. Gomathi', id: '13209', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mr. V. Aravindraj', id: '13207', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. K. Priyadharshini', id: '13204', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mrs. M. Suganthi', id: '13206', role: 'faculty', designation: 'Assistant Professor' },
        { name: 'Mr. K. Rahmaan', id: '10546', role: 'faculty', designation: 'Assistant Professor' },
      ];

      for (const fac of facultyList) {
        // Check if user already exists
        const existing = await db.select().from(users).where(eq(users.biometricId, fac.id));
        
        if (existing.length === 0) {
            // Insert user
            const [insertedUser] = await db
            .insert(users)
            .values({
                email: `${fac.id}@aids.edu`, // Dummy email
                biometricId: fac.id,
                role: fac.role as any,
                isActive: true,
            })
            .returning({ id: users.id });

            // Insert profile data
            await db.insert(faculty).values({
                userId: insertedUser.id,
                name: fac.name,
                designation: fac.designation,
                biometricId: fac.id,
                department: 'AI&DS',
                email: `${fac.id}@aids.edu`,
                isActive: true,
            });
            console.log(`Seeded ${fac.name}`);
        }
      }

      console.log('Faculty users seeded successfully');
    } catch (error) {
      console.error('Error seeding mock users:', error);
    }
  }
}

export default FacultyAuthService;