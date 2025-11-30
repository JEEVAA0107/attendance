const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

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