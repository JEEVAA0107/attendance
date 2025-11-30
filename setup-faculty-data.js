import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function setupFacultyData() {
  try {
    console.log('🚀 Setting up AI&DS Faculty Data...');

    // Clear existing data
    await sql`DELETE FROM faculty`;
    await sql`DELETE FROM users WHERE role IN ('faculty', 'hod')`;

    // AI&DS Faculty Data
    const facultyData = [
      { id: '10521', name: 'Dr. S. Ananth', designation: 'HOD / Associate Professor', role: 'hod' },
      { id: '10528', name: 'Mrs. R. Mekala', designation: 'Assistant Professor', role: 'faculty' },
      { id: '10533', name: 'Mrs. M. Chitra', designation: 'Assistant Professor', role: 'faculty' },
      { id: '10534', name: 'Mrs. M. Nithiya', designation: 'Assistant Professor', role: 'faculty' },
      { id: '10544', name: 'Mrs. P. Jayapriya', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13202', name: 'Ms. P. Baby Priyadharshini', designation: 'Assistant Professor', role: 'faculty' },
      { id: '10540', name: 'Mr. R. Sathishkumar', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13201', name: 'Mrs. L. S. Kavitha', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13208', name: 'Mr. K. Thangadurai', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13209', name: 'Mrs. M. Gomathi', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13207', name: 'Mr. V. Aravindraj', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13204', name: 'Mrs. K. Priyadharshini', designation: 'Assistant Professor', role: 'faculty' },
      { id: '13206', name: 'Mrs. M. Suganthi', designation: 'Assistant Professor', role: 'faculty' },
      { id: '10546', name: 'Mr. K. Rahmaan', designation: 'Assistant Professor', role: 'faculty' }
    ];

    // Insert users
    for (const faculty of facultyData) {
      await sql`
        INSERT INTO users (biometric_id, role, email) 
        VALUES (${faculty.id}, ${faculty.role}, ${faculty.id + '@aids.edu'})
      `;
    }

    // Insert faculty details
    for (const faculty of facultyData) {
      await sql`
        INSERT INTO faculty (user_id, name, designation, department) 
        SELECT id, ${faculty.name}, ${faculty.designation}, 'AI&DS'
        FROM users WHERE biometric_id = ${faculty.id}
      `;
    }

    // Add sample students
    const students = [
      { id: 'STU_001', name: 'Aarav Sharma', roll: '21AI001' },
      { id: 'STU_002', name: 'Diya Patel', roll: '21AI002' },
      { id: 'STU_003', name: 'Arjun Singh', roll: '21AI003' },
      { id: 'STU_004', name: 'Priya Gupta', roll: '21AI004' },
      { id: 'STU_005', name: 'Vikash Kumar', roll: '21AI005' }
    ];

    for (const student of students) {
      await sql`
        INSERT INTO users (biometric_id, role, email) 
        VALUES (${student.id}, 'student', ${student.id + '@student.edu'})
        ON CONFLICT (biometric_id) DO NOTHING
      `;

      await sql`
        INSERT INTO students (user_id, name, roll_number, year, section) 
        SELECT id, ${student.name}, ${student.roll}, 3, 'A'
        FROM users WHERE biometric_id = ${student.id}
        ON CONFLICT (roll_number) DO NOTHING
      `;
    }

    console.log('✅ AI&DS Faculty Data Setup Complete!');
    console.log('\n👑 HoD Login:');
    console.log('   ID: 10521 - Dr. S. Ananth');
    console.log('\n👨🏫 Faculty Login (sample):');
    console.log('   ID: 10528 - Mrs. R. Mekala');
    console.log('   ID: 10533 - Mrs. M. Chitra');
    console.log('   ID: 10534 - Mrs. M. Nithiya');
    console.log('\n🎓 Student Login (sample):');
    console.log('   ID: STU_001 - Aarav Sharma');
    console.log('   ID: STU_002 - Diya Patel');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupFacultyData();