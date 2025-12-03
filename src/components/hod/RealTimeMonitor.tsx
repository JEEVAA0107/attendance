import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Users, CheckCircle } from 'lucide-react';

const RealTimeMonitor: React.FC = () => {
  const liveClasses = [
    { id: 1, subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Lab-101', students: 45, status: 'ongoing' },
    { id: 2, subject: 'Database Systems', faculty: 'Prof. Davis', room: 'Room-205', students: 38, status: 'ongoing' },
    { id: 3, subject: 'Web Development', faculty: 'Dr. Wilson', room: 'Lab-102', students: 42, status: 'completed' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Real-Time Monitor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Live Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">2</div>
            <p className="text-sm text-gray-600">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">83</div>
            <p className="text-sm text-gray-600">In attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">1</div>
            <p className="text-sm text-gray-600">Classes finished</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Class Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{cls.subject}</span>
                  </div>
                  <span className="text-gray-600">{cls.faculty}</span>
                  <span className="text-gray-500">{cls.room}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{cls.students} students</span>
                  <Badge variant={cls.status === 'ongoing' ? 'default' : 'secondary'}>
                    {cls.status}
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

export default RealTimeMonitor;