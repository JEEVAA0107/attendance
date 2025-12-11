import { neon } from '@neondatabase/serverless';

// Using your Neon DB connection string
const DATABASE_URL = 'postgresql://smartattend_owner:pw_test123@ep-aged-mode-a5q9er2l.us-east-2.aws.neon.tech/smartattend?sslmode=require';

const sql = neon(DATABASE_URL);

const setupSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  biometric_id VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) DEFAULT 'AI&DS',
  designation VARCHAR(50)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  roll_number VARCHAR(20) UNIQUE,
  year INTEGER,
  section VARCHAR(10)
);

-- Insert HoD
INSERT INTO users (biometric_id, role) VALUES ('FAC_0001', 'hod') ON CONFLICT (biometric_id) DO NOTHING;

-- Insert Faculty members
INSERT INTO users (biometric_id, role) VALUES 
('FAC_0002', 'faculty'), ('FAC_0003', 'faculty'), ('FAC_0004', 'faculty'), ('FAC_0005', 'faculty')
ON CONFLICT (biometric_id) DO NOTHING;

-- Insert Students
INSERT INTO users (biometric_id, role) VALUES 
('STU_0001', 'student'), ('STU_0002', 'student'), ('STU_0003', 'student'), 
('STU_0004', 'student'), ('STU_0005', 'student')
ON CONFLICT (biometric_id) DO NOTHING;
`;

async function setupDatabase() {
  try {
    console.log('🚀 Setting up SmartAttend Hub Database...');
    
    // Split and execute each statement
    const statements = setupSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql(statement);
      }
    }
    
    console.log('✅ Database setup complete!');
    console.log('📱 You can now use these IDs:');
    console.log('   HoD: FAC_0001');
    console.log('   Faculty: FAC_0002 to FAC_0005');
    console.log('   Students: STU_0001 to STU_0005');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();