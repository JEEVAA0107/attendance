
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

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
}

async function fixSchema() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL not found');
        }

        const sql = neon(process.env.DATABASE_URL);

        console.log('Adding biometric_id column to students table...');
        await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS biometric_id VARCHAR(50)`;
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_students_biometric_id ON students(biometric_id)`;

        console.log('Successfully added biometric_id column to students table.');

    } catch (error) {
        console.error('Schema fix failed:', error);
    }
}

fixSchema();
