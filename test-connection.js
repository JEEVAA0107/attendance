import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://smartattend_owner:pw_test123@ep-aged-mode-a5q9er2l.us-east-2.aws.neon.tech/smartattend?sslmode=require';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const sql = neon(DATABASE_URL);
    
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!', result[0]);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('Please check your Neon DB credentials in the dashboard');
  }
}

testConnection();