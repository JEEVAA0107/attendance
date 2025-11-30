
import { db } from './src/lib/db';
import { students } from './src/lib/schema';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Fetching student summary...');

    try {
        const allStudents = await db.select().from(students);
        console.log(`Total students in DB: ${allStudents.length}`);

        if (allStudents.length === 0) {
            console.log('No students found.');
            return;
        }

        // Group by batch
        const batchCounts: Record<string, number> = {};
        allStudents.forEach(s => {
            const batch = s.batch || 'Unknown';
            batchCounts[batch] = (batchCounts[batch] || 0) + 1;
        });

        console.log('Students by Batch:');
        console.table(batchCounts);

        console.log('Sample Students (first 5):');
        allStudents.slice(0, 5).forEach(s => {
            console.log(`- ${s.name} (${s.rollNumber}) - Batch: ${s.batch}`);
        });

    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

main();
