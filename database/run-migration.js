const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const migrationPath = path.join(__dirname, 'migrate-attendance.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('Running database migration...');
    await sql(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();