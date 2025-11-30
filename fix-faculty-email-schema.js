
import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function fixSchema() {
    try {
        console.log('Adding email column to faculty table...');

        // Check if column exists
        const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'faculty' AND column_name = 'email';
    `;

        if (checkColumn.length === 0) {
            await sql`ALTER TABLE faculty ADD COLUMN email VARCHAR(255);`;
            console.log('Successfully added email column to faculty table.');
        } else {
            console.log('email column already exists in faculty table.');
        }

        console.log('Schema fix completed.');
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

fixSchema();
