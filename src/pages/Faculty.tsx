import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Building } from 'lucide-react';

interface FacultyMember {
  name: string;
  designation: string;
  biometric_id: string;
  department: string;
  email: string;
}

const Faculty = () => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Static faculty data
    const facultyData: FacultyMember[] = [
      { name: "Dr. S. Ananth", designation: "HOD / Associate Professor", biometric_id: "10521", department: "AI&DS", email: "ananth@college.edu" },
      { name: "Mrs. R. Mekala", designation: "Assistant Professor", biometric_id: "10528", department: "AI&DS", email: "mekala@college.edu" },
      { name: "Mrs. M. Chitra", designation: "Assistant Professor", biometric_id: "10533", department: "AI&DS", email: "chitra@college.edu" },
      { name: "Mrs. M. Nithiya", designation: "Assistant Professor", biometric_id: "10534", department: "AI&DS", email: "nithiya@college.edu" },
      { name: "Mrs. P. Jayapriya", designation: "Assistant Professor", biometric_id: "10544", department: "AI&DS", email: "jayapriya@college.edu" },
      { name: "Ms. P. Baby Priyadharshini", designation: "Assistant Professor", biometric_id: "13202", department: "AI&DS", email: "priyadharshini@college.edu" },
      { name: "Mr. R. Sathishkumar", designation: "Assistant Professor", biometric_id: "10540", department: "AI&DS", email: "sathishkumar@college.edu" },
      { name: "Mrs. L. S. Kavitha", designation: "Assistant Professor", biometric_id: "13201", department: "AI&DS", email: "kavitha@college.edu" },
      { name: "Mr. K. Thangadurai", designation: "Assistant Professor", biometric_id: "13208", department: "AI&DS", email: "thangadurai@college.edu" },
      { name: "Mrs. M. Gomathi", designation: "Assistant Professor", biometric_id: "13209", department: "AI&DS", email: "gomathi@college.edu" },
      { name: "Mr. V. Aravindraj", designation: "Assistant Professor", biometric_id: "13207", department: "AI&DS", email: "aravindraj@college.edu" },
      { name: "Mrs. K. Priyadharshini", designation: "Assistant Professor", biometric_id: "13204", department: "AI&DS", email: "priyadharshini.k@college.edu" },
      { name: "Mrs. M. Suganthi", designation: "Assistant Professor", biometric_id: "13206", department: "AI&DS", email: "suganthi@college.edu" },
      { name: "Mr. K. Rahmaan", designation: "Assistant Professor", biometric_id: "10546", department: "AI&DS", email: "rahmaan@college.edu" },
    ];

    setFaculty(facultyData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading faculty...</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Faculty Registry</h1>
        <p className="text-muted-foreground mt-2">AI&DS Department Faculty with Biometric Authentication</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{faculty.length}</div>
              <div className="text-sm text-muted-foreground">Total Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">HOD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{faculty.length - 1}</div>
              <div className="text-sm text-muted-foreground">Assistant Professors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">AI&DS</div>
              <div className="text-sm text-muted-foreground">Department</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((member, index) => (
          <Card key={index} className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge variant={member.designation.includes('HOD') ? 'default' : 'secondary'}>
                      {member.designation}
                    </Badge>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{member.department}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-blue-600">{member.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Biometric Authentication Enabled
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Faculty;