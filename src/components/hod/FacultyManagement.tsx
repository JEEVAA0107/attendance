import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserCheck, Plus, Mail, Phone } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  status: 'active' | 'inactive';
}

const FacultyManagement: React.FC = () => {
  const [faculty] = useState<Faculty[]>([
    {
      id: '1',
      name: 'Dr. Smith Johnson',
      email: 'smith.johnson@college.edu',
      phone: '+1-234-567-8901',
      department: 'AI & Data Science',
      subjects: ['Machine Learning', 'Data Structures'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Prof. Emily Davis',
      email: 'emily.davis@college.edu',
      phone: '+1-234-567-8902',
      department: 'AI & Data Science',
      subjects: ['Database Systems', 'Web Development'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@college.edu',
      phone: '+1-234-567-8903',
      department: 'AI & Data Science',
      subjects: ['Operating Systems', 'Computer Networks'],
      status: 'inactive'
    }
  ]);

  const [showAddFaculty, setShowAddFaculty] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Faculty Members ({faculty.length})</h3>
        <Dialog open={showAddFaculty} onOpenChange={setShowAddFaculty}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Faculty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email Address" type="email" />
              <Input placeholder="Phone Number" />
              <Input placeholder="Subjects (comma separated)" />
              <Button className="w-full">Add Faculty</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {faculty.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {member.phone}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Subjects: {member.subjects.join(', ')}
                  </p>
                </div>
              </div>
              <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                {member.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacultyManagement;