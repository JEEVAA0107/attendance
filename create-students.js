import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function createStudentsTable() {
  try {
    console.log('Creating students table...');
    
    await sql`DROP TABLE IF EXISTS students CASCADE`;
    
    await sql`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(20) UNIQUE,
        year INTEGER,
        section VARCHAR(10)
      )
    `;
    
    // Insert student data
    await sql`
      INSERT INTO students (user_id, name, roll_number, year, section) 
      SELECT id, 'Aarav Sharma', '21AI001', 3, 'A' 
      FROM users WHERE biometric_id = 'STU_0001'
    `;
    
    await sql`
      INSERT INTO students (user_id, name, roll_number, year, section) 
      SELECT id, 'Diya Patel', '21AI002', 3, 'A' 
      FROM users WHERE biometric_id = 'STU_0002'
    `;
    
    console.log('✅ Students table created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createStudentsTable();