const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function fixStudentIdType() {
  try {
    console.log('Fixing studentId column type...');
    
    // Drop and recreate the table with correct integer type
    await sql`DROP TABLE IF EXISTS attendance_records CASCADE`;
    
    await sql`
      CREATE TABLE attendance_records (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        attendance_date DATE NOT NULL,
        period1 BOOLEAN DEFAULT false,
        period2 BOOLEAN DEFAULT false,
        period3 BOOLEAN DEFAULT false,
        period4 BOOLEAN DEFAULT false,
        period5 BOOLEAN DEFAULT false,
        period6 BOOLEAN DEFAULT false,
        period7 BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX idx_attendance_student_id ON attendance_records(student_id)`;
    await sql`CREATE INDEX idx_attendance_date ON attendance_records(attendance_date)`;
    
    console.log('✅ Fixed studentId column type to INTEGER');
    
  } catch (error) {
    console.error('❌ Error fixing column type:', error);
  }
}

fixStudentIdType();