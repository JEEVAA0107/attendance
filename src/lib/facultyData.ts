interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  biometric_id: string;
  department: string;
  email: string;
}

let facultyData: FacultyMember[] = [
  { id: '1', name: "Dr. S. Ananth", designation: "HOD / Associate Professor", biometric_id: "10521", department: "AI&DS", email: "ananth@college.edu" },
  { id: '2', name: "Mrs. R. Mekala", designation: "Assistant Professor", biometric_id: "10528", department: "AI&DS", email: "mekala@college.edu" },
  { id: '3', name: "Mrs. M. Chitra", designation: "Assistant Professor", biometric_id: "10533", department: "AI&DS", email: "chitra@college.edu" },
  { id: '4', name: "Mrs. M. Nithiya", designation: "Assistant Professor", biometric_id: "10534", department: "AI&DS", email: "nithiya@college.edu" },
  { id: '5', name: "Mrs. P. Jayapriya", designation: "Assistant Professor", biometric_id: "10544", department: "AI&DS", email: "jayapriya@college.edu" },
  { id: '6', name: "Ms. P. Baby Priyadharshini", designation: "Assistant Professor", biometric_id: "13202", department: "AI&DS", email: "priyadharshini@college.edu" },
  { id: '7', name: "Mr. R. Sathishkumar", designation: "Assistant Professor", biometric_id: "10540", department: "AI&DS", email: "sathishkumar@college.edu" },
  { id: '8', name: "Mrs. L. S. Kavitha", designation: "Assistant Professor", biometric_id: "13201", department: "AI&DS", email: "kavitha@college.edu" },
  { id: '9', name: "Mr. K. Thangadurai", designation: "Assistant Professor", biometric_id: "13208", department: "AI&DS", email: "thangadurai@college.edu" },
  { id: '10', name: "Mrs. M. Gomathi", designation: "Assistant Professor", biometric_id: "13209", department: "AI&DS", email: "gomathi@college.edu" },
  { id: '11', name: "Mr. V. Aravindraj", designation: "Assistant Professor", biometric_id: "13207", department: "AI&DS", email: "aravindraj@college.edu" },
  { id: '12', name: "Mrs. K. Priyadharshini", designation: "Assistant Professor", biometric_id: "13204", department: "AI&DS", email: "priyadharshini.k@college.edu" },
  { id: '13', name: "Mrs. M. Suganthi", designation: "Assistant Professor", biometric_id: "13206", department: "AI&DS", email: "suganthi@college.edu" },
  { id: '14', name: "Mr. K. Rahmaan", designation: "Assistant Professor", biometric_id: "10546", department: "AI&DS", email: "rahmaan@college.edu" },
];

export const getFacultyData = (): FacultyMember[] => {
  return [...facultyData];
};

export const addFaculty = (faculty: Omit<FacultyMember, 'id'>): void => {
  const newFaculty: FacultyMember = {
    ...faculty,
    id: Date.now().toString()
  };
  facultyData.push(newFaculty);
};

export const removeFaculty = (id: string): void => {
  facultyData = facultyData.filter(f => f.id !== id);
};

export { type FacultyMember };