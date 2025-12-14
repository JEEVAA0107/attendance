import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  BookOpen
} from 'lucide-react';

interface ProfileManagementProps {
  studentData: any;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ studentData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    email: 'john.doe@college.edu',
    secondaryEmail: 'john.personal@gmail.com',
    phone: '+91-9876543210',
    parentPhone: '+91-9876543211',
    currentAddress: '123 Student Hostel, College Campus',
    permanentAddress: '456 Home Street, City, State - 123456'
  });

  const studentProfile = {
    // Read-only personal information
    name: 'John Doe',
    rollNumber: 'AI22001',
    registrationNumber: 'REG2022AI001',
    department: 'AI & Data Science',
    batch: '2022',
    section: 'A',
    admissionDate: '2022-08-15',
    
    // Academic details
    currentSemester: 5,
    cgpa: 8.45,
    creditsCompleted: 120,
    totalCredits: 160,
    academicAdvisor: 'Dr. Smith',
    mentorFaculty: 'Prof. Johnson',
    
    // Status information
    status: 'Active',
    lastLogin: '2024-01-15 10:30 AM',
    accountCreated: '2022-08-15'
  };

  const handleSave = () => {
    // Save editable data
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-2xl">
                {studentProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{studentProfile.name}</h1>
              <p className="text-lg text-gray-600">{studentProfile.rollNumber}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {studentProfile.department}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Semester {studentProfile.currentSemester}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  CGPA: {studentProfile.cgpa}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Status</div>
              <Badge className="bg-green-100 text-green-800">
                {studentProfile.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <p className="text-sm text-gray-600">This information cannot be modified</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                <p className="font-medium">{studentProfile.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Roll Number</Label>
                <p className="font-medium">{studentProfile.rollNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                <p className="font-medium">{studentProfile.registrationNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Department</Label>
                <p className="font-medium">{studentProfile.department}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Batch</Label>
                <p className="font-medium">{studentProfile.batch}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Section</Label>
                <p className="font-medium">{studentProfile.section}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Admission Date</Label>
                <p className="font-medium">{studentProfile.admissionDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Account Created</Label>
                <p className="font-medium">{studentProfile.accountCreated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information (Editable) */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <p className="text-sm text-gray-600">You can update your contact details</p>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Primary Email</Label>
                {isEditing ? (
                  <Input
                    value={editableData.email}
                    onChange={(e) => setEditableData({...editableData, email: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.email}</p>
                )}
              </div>
              <div>
                <Label>Secondary Email</Label>
                {isEditing ? (
                  <Input
                    value={editableData.secondaryEmail}
                    onChange={(e) => setEditableData({...editableData, secondaryEmail: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.secondaryEmail}</p>
                )}
              </div>
              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={editableData.phone}
                    onChange={(e) => setEditableData({...editableData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.phone}</p>
                )}
              </div>
              <div>
                <Label>Parent/Guardian Phone</Label>
                {isEditing ? (
                  <Input
                    value={editableData.parentPhone}
                    onChange={(e) => setEditableData({...editableData, parentPhone: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.parentPhone}</p>
                )}
              </div>
              <div>
                <Label>Current Address</Label>
                {isEditing ? (
                  <Input
                    value={editableData.currentAddress}
                    onChange={(e) => setEditableData({...editableData, currentAddress: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.currentAddress}</p>
                )}
              </div>
              <div>
                <Label>Permanent Address</Label>
                {isEditing ? (
                  <Input
                    value={editableData.permanentAddress}
                    onChange={(e) => setEditableData({...editableData, permanentAddress: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{editableData.permanentAddress}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Current Semester</Label>
                <p className="text-2xl font-bold text-blue-600">{studentProfile.currentSemester}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">CGPA</Label>
                <p className="text-2xl font-bold text-green-600">{studentProfile.cgpa}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Credits Completed</Label>
                <p className="text-2xl font-bold text-purple-600">{studentProfile.creditsCompleted}</p>
                <p className="text-sm text-gray-500">out of {studentProfile.totalCredits}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(studentProfile.creditsCompleted / studentProfile.totalCredits) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Academic Advisor</Label>
                <p className="font-medium">{studentProfile.academicAdvisor}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Mentor Faculty</Label>
                <p className="font-medium">{studentProfile.mentorFaculty}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                <p className="font-medium">{studentProfile.lastLogin}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Password</Label>
                <div className="flex gap-2">
                  <p className="font-medium">••••••••</p>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Two-Factor Authentication</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">Disabled</Badge>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Login Notifications</Label>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;