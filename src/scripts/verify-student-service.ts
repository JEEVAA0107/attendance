
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
} else {
    console.error('.env file not found!');
}

async function verify() {
    try {
        // Dynamic import to ensure env vars are set before db is initialized
        const { StudentService } = await import('../lib/studentService.js');

        console.log('Fetching all students...');
        const allStudents = await StudentService.getAllStudents();
        console.log('Successfully fetched students:', allStudents.length);
        console.log('Students data:', JSON.stringify(allStudents, null, 2));

        if (allStudents.length === 0) {
            console.log('No students found. Attempting to create a test student...');
            const testStudent = {
                name: 'Test Student',
                rollNumber: 'TEST002', // Changed to avoid conflict with previous run if it partially succeeded
                email: 'test.student2@example.com',
                department: 'CSE',
                batch: '2024'
            };

            const result = await StudentService.createStudent(testStudent);
            console.log('Create student result:', result);

            if (result.success) {
                console.log('Test student created. Fetching again...');
                const updatedStudents = await StudentService.getAllStudents();
                console.log('Updated students count:', updatedStudents.length);
            }
        }
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
