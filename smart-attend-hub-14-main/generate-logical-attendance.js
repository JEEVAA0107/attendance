// Generate sample logical attendance data for testing
import XLSX from 'xlsx';

const students = [
  'AABIYA AMRIN S',
  'JEEVAA K',
  'PRIYA DHARSHINI M',
  'SAKTHI PRIYA S',
  'SANTHIYA S',
  'ABIRAMI M',
  'ABISHA A',
  'AKSHAYA S',
  'ANUSUYA K',
  'ARAVINDH S'
];

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];

const getRandomStatus = () => Math.random() > 0.2 ? 'Present' : 'Absent';

// Generate data for the last 30 days
const data = [];
const today = new Date();

for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
  const date = new Date(today);
  date.setDate(date.getDate() - dayOffset);
  
  // Skip weekends
  if (date.getDay() === 0 || date.getDay() === 6) continue;
  
  const dateStr = date.toISOString().split('T')[0];
  
  // 7 periods per day
  for (let period = 1; period <= 7; period++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    
    students.forEach(student => {
      data.push({
        Date: dateStr,
        'Student Name': student,
        Subject: subject,
        Period: period,
        Status: getRandomStatus()
      });
    });
  }
}

// Create workbook
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

// Write file
XLSX.writeFile(workbook, 'logical-attendance-sample.xlsx');

console.log('✅ Sample logical attendance file generated: logical-attendance-sample.xlsx');
console.log(`📊 Contains ${data.length} attendance records`);
console.log(`👥 ${students.length} students`);
console.log(`📚 ${subjects.length} subjects`);
console.log(`📅 ~30 days of data`);
console.log('📁 Upload this file in the Logical Attendance Analytics section');
