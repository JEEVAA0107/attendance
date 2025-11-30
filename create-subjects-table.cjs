const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function createSubjectsTable() {
  try {
    console.log('Creating subjects table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        department VARCHAR(100),
        batch VARCHAR(10),
        faculty_id INTEGER,
        credits INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code)`;
    
    console.log('✅ Subjects table created successfully');
    
  } catch (error) {
    console.error('❌ Error creating subjects table:', error);
  }
}

createSubjectsTable();