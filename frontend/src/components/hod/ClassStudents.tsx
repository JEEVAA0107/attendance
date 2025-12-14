import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  status: 'active' | 'inactive';
}

interface ClassStudentsProps {
  classId: string;
}

const ClassStudents: React.FC<ClassStudentsProps> = ({ classId }) => {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      rollNumber: 'AI22001',
      email: 'john.doe@college.edu',
      attendancePercentage: 85,
      totalClasses: 40,
      attendedClasses: 34,
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      rollNumber: 'AI22002',
      email: 'jane.smith@college.edu',
      attendancePercentage: 92,
      totalClasses: 40,
      attendedClasses: 37,
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      rollNumber: 'AI22003',
      email: 'mike.johnson@college.edu',
      attendancePercentage: 78,
      totalClasses: 40,
      attendedClasses: 31,
      status: 'active'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      rollNumber: 'AI22004',
      email: 'sarah.wilson@college.edu',
      attendancePercentage: 88,
      totalClasses: 40,
      attendedClasses: 35,
      status: 'active'
    }
  ]);

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Class Students ({students.length})</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">Good: {students.filter(s => s.attendancePercentage >= 85).length}</span>
          <span className="text-yellow-600">Average: {students.filter(s => s.attendancePercentage >= 75 && s.attendancePercentage < 85).length}</span>
          <span className="text-red-600">Poor: {students.filter(s => s.attendancePercentage < 75).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{student.name}</CardTitle>
                    <p className="text-sm text-gray-600">{student.rollNumber}</p>
                  </div>
                </div>
                <Badge className={getAttendanceBadge(student.attendancePercentage)}>
                  {student.attendancePercentage}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Attendance Progress</span>
                  <span className={getAttendanceColor(student.attendancePercentage)}>
                    {student.attendedClasses}/{student.totalClasses}
                  </span>
                </div>
                <Progress 
                  value={student.attendancePercentage} 
                  className="h-2"
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{student.email}</span>
                <div className="flex items-center gap-1">
                  {student.attendancePercentage >= 85 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClassStudents;