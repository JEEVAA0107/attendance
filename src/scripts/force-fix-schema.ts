
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

async function forceFixSchema() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL not found');
        }

        const sql = neon(process.env.DATABASE_URL);

        console.log('Checking current columns in students table...');
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        `;
        console.log('Current columns:', JSON.stringify(columns, null, 2));

        const hasBiometric = columns.some((c: any) => c.column_name === 'biometric_id');

        if (!hasBiometric) {
            console.log('Adding biometric_id column...');
            await sql`ALTER TABLE students ADD COLUMN biometric_id VARCHAR(50)`;
            console.log('Column added.');

            console.log('Adding unique index...');
            await sql`CREATE UNIQUE INDEX idx_students_biometric_id ON students(biometric_id)`;
            console.log('Index added.');
        } else {
            console.log('biometric_id column already exists.');
        }

        console.log('Verifying columns after update...');
        const newColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        `;
        console.log('New columns:', JSON.stringify(newColumns, null, 2));

    } catch (error) {
        console.error('Force fix failed:', error);
    }
}

forceFixSchema();
