
import { neon } from '@neondatabase/serverless';

// Hardcoded URL from src/lib/db.ts
const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function fixProdDb() {
    try {
        console.log('Connecting to production database...');
        const sql = neon(DATABASE_URL);

        console.log('Checking columns in students table...');
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students'
        `;

        const columnNames = columns.map((c: any) => c.column_name);
        console.log('Existing columns:', columnNames.join(', '));

        const missingColumns = [
            { name: 'biometric_id', type: 'VARCHAR(50)', index: true },
            { name: 'reg_no', type: 'VARCHAR(50)' },
            { name: 'email', type: 'VARCHAR(255)' },
            { name: 'phone', type: 'VARCHAR(20)' },
            { name: 'parent_phone', type: 'VARCHAR(20)' },
            { name: 'department', type: 'VARCHAR(100)' },
            { name: 'batch', type: 'VARCHAR(10)' },
            { name: 'created_at', type: 'TIMESTAMP DEFAULT NOW()' }
        ];

        for (const col of missingColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`Adding ${col.name} column...`);
                await sql(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
                console.log(`${col.name} added.`);

                if (col.index) {
                    console.log(`Adding index for ${col.name}...`);
                    await sql(`CREATE UNIQUE INDEX idx_students_${col.name} ON students(${col.name})`);
                    console.log(`Index for ${col.name} added.`);
                }
            } else {
                console.log(`${col.name} already exists.`);
            }
        }

        console.log('Schema fix complete.');

    } catch (error) {
        console.error('Fix failed:', error);
    }
}

fixProdDb();
