
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixFacultySchema() {
    try {
        console.log('🚀 Fixing Faculty Schema...');

        // 1. Add biometric_id column if it doesn't exist
        await sql`
      ALTER TABLE faculty 
      ADD COLUMN IF NOT EXISTS biometric_id VARCHAR(50);
    `;
        console.log('✅ Added biometric_id column to faculty table');

        // 2. Populate biometric_id from users table
        await sql`
      UPDATE faculty f
      SET biometric_id = u.biometric_id
      FROM users u
      WHERE f.user_id = u.id;
    `;
        console.log('✅ Populated biometric_id in faculty table');

        // 3. Add unique constraint
        // Note: We need to ensure no duplicates first, but assuming 1:1 mapping and unique biometric_id in users, it should be fine.
        // However, if there are nulls, unique constraint might fail if we don't handle it.
        // For now, let's just add the column and data.

        // Verify
        const result = await sql`SELECT id, name, biometric_id FROM faculty LIMIT 5`;
        console.log('Sample faculty data:', result);

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
    }
}

fixFacultySchema();
