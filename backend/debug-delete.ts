
import { db } from './src/lib/db';
import { students, users } from './src/lib/schema';
import { eq, ilike } from 'drizzle-orm';
import { StudentService } from './src/lib/studentService';

async function main() {
    console.log('Connecting to DB...');

    // 1. List all students
    console.log('Fetching students...');
    const allStudents = await db.select().from(students);
    console.log(`Found ${allStudents.length} students.`);

    // 2. Find the problematic student
    const targetName = "III YEAR BATCH WISE NAME LIST FOR INDUSTRIAL VISIT";
    const targetStudent = allStudents.find(s => s.name === targetName || s.name.includes("III YEAR"));

    if (targetStudent) {
        console.log('Found target student:', targetStudent);

        // 3. Try to delete it
        console.log(`Attempting to delete student ID: ${targetStudent.id} (User ID: ${targetStudent.userId})`);

        try {
            // Use StudentService to delete
            console.log('Calling StudentService.deleteStudent...');
            const result = await StudentService.deleteStudent(targetStudent.id);

            if (result.success) {
                console.log('StudentService reported success.');
            } else {
                console.error('StudentService reported error:', result.error);
            }

            // Verify student is gone
            const checkStudent = await db.query.students.findFirst({
                where: eq(students.id, targetStudent.id)
            });
            console.log('Student exists after delete:', !!checkStudent);

        } catch (error) {
            console.error('Error deleting student:', error);
        }

    } else {
        console.log('Target student not found in DB. Listing top 5 students:');
        allStudents.slice(0, 5).forEach(s => console.log(`${s.id}: ${s.name} (${s.rollNumber})`));
    }
}

main().catch(console.error).finally(() => process.exit());
