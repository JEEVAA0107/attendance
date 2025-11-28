const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function createDatabase() {
  try {
    await client.connect();
    
    // Drop tables if exist
    await client.query('DROP TABLE IF EXISTS attendance_records CASCADE');
    await client.query('DROP TABLE IF EXISTS students CASCADE');
    
    // Create students table
    await client.query(`
      CREATE TABLE students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        roll_no VARCHAR(50) NOT NULL,
        reg_no VARCHAR(50),
        email VARCHAR(255),
        phone VARCHAR(20),
        parent_phone VARCHAR(20),
        department VARCHAR(100),
        batch VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create attendance table
    await client.query(`
      CREATE TABLE attendance_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES students(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        attendance_date DATE NOT NULL,
        batch VARCHAR(10),
        period1 BOOLEAN DEFAULT FALSE,
        period2 BOOLEAN DEFAULT FALSE,
        period3 BOOLEAN DEFAULT FALSE,
        period4 BOOLEAN DEFAULT FALSE,
        period5 BOOLEAN DEFAULT FALSE,
        period6 BOOLEAN DEFAULT FALSE,
        period7 BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, attendance_date)
      )
    `);
    
    // Create indexes
    await client.query('CREATE INDEX idx_students_user_id ON students(user_id)');
    await client.query('CREATE INDEX idx_students_roll_no ON students(roll_no)');
    await client.query('CREATE INDEX idx_attendance_student_id ON attendance_records(student_id)');
    await client.query('CREATE INDEX idx_attendance_date ON attendance_records(attendance_date)');
    
    console.log('Database created successfully!');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createDatabase();