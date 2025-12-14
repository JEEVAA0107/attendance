import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function setupBiometricSystem() {
  try {
    console.log('🚀 Setting up SmartAttend Hub ID Authentication System...');
    
    // Read the SQL setup script
    const setupScript = fs.readFileSync(
      path.join(__dirname, 'database', 'setup-biometric-auth.sql'), 
      'utf8'
    );
    
    // Execute the setup script
    console.log('📊 Creating database schema...');
    await sql(setupScript);
    
    console.log('✅ Database schema created successfully!');
    
    // Verify the setup
    console.log('🔍 Verifying setup...');
    
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    const faculty = await sql`SELECT COUNT(*) as count FROM faculty`;
    const students = await sql`SELECT COUNT(*) as count FROM students`;
    
    console.log(`👥 Users created: ${users[0].count}`);
    console.log(`👨‍🏫 Faculty members: ${faculty[0].count}`);
    console.log(`🎓 Students: ${students[0].count}`);
    
    // Display sample user IDs for testing
    console.log('\n🔐 Sample User ID Codes for testing:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sampleUsers = await sql`
      SELECT u.biometric_id, u.role, 
             CASE 
               WHEN u.role = 'student' THEN s.name
               WHEN u.role IN ('faculty', 'hod') THEN f.name
               ELSE 'Unknown'
             END as name
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
      LEFT JOIN faculty f ON u.id = f.user_id AND u.role IN ('faculty', 'hod')
      WHERE u.biometric_id IS NOT NULL
      ORDER BY u.role, u.biometric_id
    `;
    
    sampleUsers.forEach(user => {
      const roleIcon = user.role === 'hod' ? '👑' : user.role === 'faculty' ? '👨‍🏫' : '🎓';
      console.log(`${roleIcon} ${user.biometric_id} - ${user.name} (${user.role.toUpperCase()})`);
    });
    
    console.log('\n🎯 System Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 You can now use ID authentication (enter ID codes manually)');
    console.log('🔄 Role-based authentication and redirection:');
    console.log('   • Students → Display name + roll number → /student-dashboard');
    console.log('   • Faculty → Display name + user ID → /faculty-dashboard');
    console.log('   • HoD → Display name + user ID → /hod-workspace');
    console.log('\n🚀 Start the development server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error setting up biometric system:', error);
    process.exit(1);
  }
}

// Run the setup
setupBiometricSystem();