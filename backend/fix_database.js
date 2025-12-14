import { neon } from '@neondatabase/serverless';

async function fixDatabase() {
  const sql = neon('postgresql://neondb_owner:npg_password@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');
  
  try {
    console.log('Adding missing columns to attendance_records...');
    
    await sql`
      ALTER TABLE attendance_records 
      ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4,2) DEFAULT 0
    `;
    
    await sql`
      ALTER TABLE attendance_records 
      ADD COLUMN IF NOT EXISTS is_full_day BOOLEAN DEFAULT false
    `;
    
    console.log('✅ Database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

fixDatabase();