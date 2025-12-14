import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Plus, X, Shield } from 'lucide-react';
import { getFacultyData } from '@/lib/facultyData';

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

interface ClassFacultyAssignment {
  id: string;
  facultyId: string;
  faculty: Faculty;
  roles: string[];
}

interface ClassFacultyProps {
  classId: string;
}

const ClassFaculty: React.FC<ClassFacultyProps> = ({ classId }) => {
  const [availableFaculty, setAvailableFaculty] = useState<Faculty[]>([]);
  const [assignedFaculty, setAssignedFaculty] = useState<ClassFacultyAssignment[]>([]);

  useEffect(() => {
    const facultyData = getFacultyData();
    const formattedFaculty: Faculty[] = facultyData.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      department: f.department,
      designation: f.designation
    }));
    setAvailableFaculty(formattedFaculty);
  }, []);

  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const availableRoles = [
    'Class Advisor',
    'Co-Advisor',
    'DSA Staff',
    'Subject Teacher',
    'Lab Instructor',
    'Mentor',
    'Coordinator'
  ];

  const handleAddFaculty = () => {
    if (selectedFaculty && selectedRoles.length > 0) {
      const faculty = availableFaculty.find(f => f.id === selectedFaculty);
      if (faculty) {
        const newAssignment: ClassFacultyAssignment = {
          id: Date.now().toString(),
          facultyId: selectedFaculty,
          faculty,
          roles: selectedRoles
        };
        setAssignedFaculty([...assignedFaculty, newAssignment]);
        setSelectedFaculty('');
        setSelectedRoles([]);
        setShowAddDialog(false);
      }
    }
  };

  const handleRemoveFaculty = (assignmentId: string) => {
    setAssignedFaculty(assignedFaculty.filter(a => a.id !== assignmentId));
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Class Advisor': return 'bg-purple-100 text-purple-800';
      case 'Co-Advisor': return 'bg-blue-100 text-blue-800';
      case 'DSA Staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnassignedFaculty = () => {
    const assignedIds = assignedFaculty.map(a => a.facultyId);
    return availableFaculty.filter(f => !assignedIds.includes(f.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Class Faculty ({assignedFaculty.length})</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Faculty to Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Faculty</label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose faculty member" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnassignedFaculty().map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Assign Roles</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableRoles.map((role) => (
                    <Button
                      key={role}
                      variant={selectedRoles.includes(role) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleRoleToggle(role)}
                      className="text-xs"
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAddFaculty} 
                className="w-full"
                disabled={!selectedFaculty || selectedRoles.length === 0}
              >
                Add Faculty
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignedFaculty.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{assignment.faculty.name}</CardTitle>
                    <p className="text-sm text-gray-600">{assignment.faculty.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFaculty(assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Assigned Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {assignment.roles.map((role) => (
                    <Badge key={role} className={getRoleBadgeColor(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Designation:</p>
                <p className="text-sm text-gray-600">
                  {assignment.faculty.designation}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignedFaculty.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No faculty assigned to this class yet.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Faculty" to assign faculty members.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassFaculty;