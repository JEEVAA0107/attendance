
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env
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

async function debugDb() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found');
        return;
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        console.log('Checking columns in students table...');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        `);

        console.log('Columns found:', res.rows.map(r => r.column_name).join(', '));

        const hasBiometric = res.rows.some(r => r.column_name === 'biometric_id');
        if (!hasBiometric) {
            console.log('biometric_id column MISSING. Attempting to add...');
            await client.query('ALTER TABLE students ADD COLUMN biometric_id VARCHAR(50)');
            console.log('Column added.');
            await client.query('CREATE UNIQUE INDEX idx_students_biometric_id ON students(biometric_id)');
            console.log('Index added.');
        } else {
            console.log('biometric_id column EXISTS.');
        }

    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await client.end();
    }
}

debugDb();
