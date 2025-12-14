const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_ysG18KPFbZQp@ep-ancient-frost-ah57i305-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

const subjects = [
  { code: '22ME15501', name: 'COMPUTER VISION', mnemonic: 'CV', teacher: 'Mr.K.Rahumaan, AP/AI&DS', periods: 5 },
  { code: '22AI14601', name: 'DATA SECURITY', mnemonic: 'DS', teacher: 'Mrs.M.Chitra,AP/AI&DS', periods: 5 },
  { code: '22AI14602', name: 'REINFORCEMENT LEARNING', mnemonic: 'RL', teacher: 'Mrs.R.Nithiya,AP/AI&DS', periods: 5 },
  { code: '22AI14603', name: 'TEXT AND SPEECH ANALYTICS', mnemonic: 'TSA', teacher: 'Mrs.R.Mekala,AP/AI&DS', periods: 5 },
  { code: '22AI15026', name: 'SOCIAL MEDIA ANALYSIS', mnemonic: 'SMA', teacher: 'Mrs.V.Aravindh Raj.,AP/AI&DS', periods: 5 },
  { code: '22IT10010', name: 'ROBOTICS AND AUTOMATION', mnemonic: 'RA', teacher: 'Dr.R.Suresh,AP/ECE', periods: 5 },
  { code: '22AI24601', name: 'COMPUTER VISION LABORATORY', mnemonic: 'CV LAB', teacher: 'Mr.K.Rahumaan, AP/AI&DS', periods: 3 },
  { code: '22AI15030', name: 'PATTERN RECOGNITION', mnemonic: 'PR', teacher: 'Mr.R.Sathishkumar,AP/AI&DS', periods: 2 },
  { code: '22AI15033', name: 'SOFT COMPUTING', mnemonic: 'SC', teacher: 'Dr.S.Ananth,HoD /AI&DS', periods: 2 }
];

async function populateSubjects() {
  try {
    console.log('Populating subjects table...');
    
    // Clear existing subjects
    await sql`DELETE FROM subjects`;
    
    // Insert subjects (using userId = 1 as default)
    for (const subject of subjects) {
      await sql`
        INSERT INTO subjects (user_id, name, code, department, batch, credits)
        VALUES (1, ${subject.name}, ${subject.code}, 'AI&DS', '2022', ${subject.periods})
      `;
    }
    
    console.log(`✅ Successfully populated ${subjects.length} subjects`);
    
    // Display the subjects
    const result = await sql`SELECT * FROM subjects ORDER BY id`;
    console.log('\nSubjects in database:');
    result.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.code} - ${subject.name} (${subject.credits} periods)`);
    });
    
  } catch (error) {
    console.error('❌ Error populating subjects:', error);
  }
}

populateSubjects();