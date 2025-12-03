import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const FacultySurveillance: React.FC = () => {
  const facultyList = [
    { id: 1, name: 'Dr. Smith Johnson', status: 'active', location: 'Lab-101', lastSeen: '10:30 AM', subjects: ['ML', 'AI'] },
    { id: 2, name: 'Prof. Emily Davis', status: 'active', location: 'Room-205', lastSeen: '10:25 AM', subjects: ['DBMS', 'Web Dev'] },
    { id: 3, name: 'Dr. Michael Brown', status: 'inactive', location: 'Staff Room', lastSeen: '9:45 AM', subjects: ['OS', 'Networks'] },
    { id: 4, name: 'Prof. Sarah Wilson', status: 'active', location: 'Lab-102', lastSeen: '10:35 AM', subjects: ['Python', 'DSA'] }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Faculty Surveillance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Active Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">3</div>
            <p className="text-sm text-gray-600">Currently teaching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              On Break
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">1</div>
            <p className="text-sm text-gray-600">In staff room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Total Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">14</div>
            <p className="text-sm text-gray-600">Department strength</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facultyList.map((faculty) => (
              <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{faculty.name}</h3>
                    <p className="text-sm text-gray-600">{faculty.subjects.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {faculty.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {faculty.lastSeen}
                  </div>
                  <Badge variant={faculty.status === 'active' ? 'default' : 'secondary'}>
                    {faculty.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultySurveillance;