import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixSchema() {
    try {
        console.log('🚀 Fixing DB Schema...');

        // Add email column if not exists
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`;

        // Add is_active column if not exists
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`;

        // Add last_login column if not exists
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;`;

        // Add updated_at column if not exists
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();`;

        console.log('✅ Schema fixed: All columns added.');

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
    }
}

fixSchema();
