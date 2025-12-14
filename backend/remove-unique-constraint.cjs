const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function removeUniqueConstraint() {
  try {
    console.log('Removing unique constraint from roll_number...');
    
    // Drop the unique constraint
    await sql`ALTER TABLE students DROP CONSTRAINT IF EXISTS students_roll_number_key`;
    
    console.log('✅ Unique constraint removed successfully');
    console.log('Students can now have duplicate roll numbers');
    
  } catch (error) {
    console.error('❌ Error removing constraint:', error);
  }
}

removeUniqueConstraint();