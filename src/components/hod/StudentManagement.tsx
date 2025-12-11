import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Plus, Mail, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  batch: string;
  section: string;
  attendancePercentage: number;
  status: 'active' | 'inactive';
}

const StudentManagement: React.FC = () => {
  const [students] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      rollNumber: 'AI22001',
      email: 'john.doe@student.edu',
      batch: '2022',
      section: 'A',
      attendancePercentage: 85,
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      rollNumber: 'AI22002',
      email: 'jane.smith@student.edu',
      batch: '2022',
      section: 'A',
      attendancePercentage: 92,
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      rollNumber: 'AI23001',
      email: 'mike.johnson@student.edu',
      batch: '2023',
      section: 'B',
      attendancePercentage: 78,
      status: 'active'
    }
  ]);

  const [showAddStudent, setShowAddStudent] = useState(false);

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student Records ({students.length})</h3>
        <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Roll Number" />
              <Input placeholder="Email Address" type="email" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Batch Year" />
                <Input placeholder="Section" />
              </div>
              <Button className="w-full">Add Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <Card key={student.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{student.rollNumber}</span>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <GraduationCap className="h-3 w-3" />
                    Batch {student.batch} - Section {student.section}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getAttendanceBadge(student.attendancePercentage)}>
                  {student.attendancePercentage}%
                </Badge>
                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentManagement;