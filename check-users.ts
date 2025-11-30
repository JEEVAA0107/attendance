import { db } from './src/lib/db';
import { users, students } from './src/lib/schema';
import { eq } from 'drizzle-orm';

async function checkState() {
    console.log('Checking DB state...');

    try {
        const allUsers = await db.select().from(users);
        console.log(`Total Users: ${allUsers.length}`);

        console.log('Users list:');
        allUsers.forEach(u => {
            console.log(`- ID: ${u.id}, Role: ${u.role}, Email: ${u.email}, BiometricID: ${u.biometricId}`);
        });

        const allStudents = await db.select().from(students);
        console.log(`Total Student Profiles: ${allStudents.length}`);

    } catch (error) {
        console.error('Error checking state:', error);
    }

    process.exit(0);
}

checkState();
