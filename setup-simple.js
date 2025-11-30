import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        biometric_id VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create faculty table
    await sql`
      CREATE TABLE IF NOT EXISTS faculty (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        department VARCHAR(50) DEFAULT 'AI&DS',
        designation VARCHAR(50)
      )
    `;
    
    // Create students table
    await sql`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(20) UNIQUE,
        year INTEGER,
        section VARCHAR(10)
      )
    `;
    
    // Insert sample data
    await sql`INSERT INTO users (biometric_id, role) VALUES ('FAC_0001', 'hod') ON CONFLICT (biometric_id) DO NOTHING`;
    await sql`INSERT INTO users (biometric_id, role) VALUES ('FAC_0002', 'faculty') ON CONFLICT (biometric_id) DO NOTHING`;
    await sql`INSERT INTO users (biometric_id, role) VALUES ('STU_0001', 'student') ON CONFLICT (biometric_id) DO NOTHING`;
    await sql`INSERT INTO users (biometric_id, role) VALUES ('STU_0002', 'student') ON CONFLICT (biometric_id) DO NOTHING`;
    
    // Insert faculty names
    await sql`
      INSERT INTO faculty (user_id, name, designation) 
      SELECT id, 'Dr. Rajesh Kumar', 'Head of Department' 
      FROM users WHERE biometric_id = 'FAC_0001' 
      ON CONFLICT DO NOTHING
    `;
    
    await sql`
      INSERT INTO faculty (user_id, name, designation) 
      SELECT id, 'Dr. Priya Sharma', 'Assistant Professor' 
      FROM users WHERE biometric_id = 'FAC_0002' 
      ON CONFLICT DO NOTHING
    `;
    
    // Insert student names (check if students table exists first)
    try {
      await sql`
        INSERT INTO students (user_id, name, roll_number, year, section) 
        SELECT id, 'Aarav Sharma', '21AI001', 3, 'A' 
        FROM users WHERE biometric_id = 'STU_0001' 
        AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = users.id)
      `;
      
      await sql`
        INSERT INTO students (user_id, name, roll_number, year, section) 
        SELECT id, 'Diya Patel', '21AI002', 3, 'A' 
        FROM users WHERE biometric_id = 'STU_0002' 
        AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = users.id)
      `;
    } catch (err) {
      console.log('Note: Students table may need to be created manually');
    }
    
    console.log('✅ Database setup complete!');
    console.log('📱 Test with these IDs:');
    console.log('   HoD: FAC_0001 (Dr. Rajesh Kumar)');
    console.log('   Faculty: FAC_0002 (Dr. Priya Sharma)');
    console.log('   Students: STU_0001 (Aarav), STU_0002 (Diya)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();