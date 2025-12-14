import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Target,
  Award,
  Bell
} from 'lucide-react';

interface StudentDashboardProps {
  studentData: any;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentData }) => {
  const todaySchedule = [
    { time: '09:00 AM', subject: 'Machine Learning', faculty: 'Dr. Smith', status: 'present', room: 'Lab-1' },
    { time: '10:00 AM', subject: 'Data Structures', faculty: 'Prof. Johnson', status: 'present', room: 'Room-201' },
    { time: '11:00 AM', subject: 'Database Systems', faculty: 'Dr. Brown', status: 'absent', room: 'Room-105' },
    { time: '02:00 PM', subject: 'Web Development', faculty: 'Prof. Davis', status: 'upcoming', room: 'Lab-2' },
    { time: '03:00 PM', subject: 'Software Engineering', faculty: 'Dr. Wilson', status: 'upcoming', room: 'Room-301' },
    { time: '04:00 PM', subject: 'AI Ethics', faculty: 'Prof. Taylor', status: 'upcoming', room: 'Room-205' }
  ];

  const recentAlerts = [
    { type: 'warning', message: 'Attendance below 75% in Database Systems', time: '2 hours ago' },
    { type: 'info', message: 'Assignment due tomorrow for Web Development', time: '4 hours ago' },
    { type: 'success', message: 'Perfect attendance this week!', time: '1 day ago' }
  ];

  const subjectStats = [
    { name: 'Machine Learning', attendance: 85, status: 'good' },
    { name: 'Data Structures', attendance: 78, status: 'good' },
    { name: 'Database Systems', attendance: 72, status: 'warning' },
    { name: 'Web Development', attendance: 88, status: 'excellent' },
    { name: 'Software Engineering', attendance: 80, status: 'good' },
    { name: 'AI Ethics', attendance: 90, status: 'excellent' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Overall Attendance</p>
                <p className="text-2xl font-bold text-blue-700">{studentData.currentAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={studentData.currentAttendance} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Today's Classes</p>
                <p className="text-2xl font-bold text-green-700">{studentData.attendedToday}/{studentData.todayClasses}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-1">Attended/Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Subjects</p>
                <p className="text-2xl font-bold text-purple-700">{studentData.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-1">This Semester</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-700">{studentData.alerts}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mt-1">Needs Attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((class_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600">{class_.time}</div>
                    <div>
                      <p className="font-medium">{class_.subject}</p>
                      <p className="text-sm text-gray-600">{class_.faculty} • {class_.room}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      class_.status === 'present' ? 'bg-green-100 text-green-800' :
                      class_.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {class_.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{subject.name}</span>
                    <span className="text-sm font-bold">{subject.attendance}%</span>
                  </div>
                  <Progress 
                    value={subject.attendance} 
                    className={`h-2 ${
                      subject.status === 'excellent' ? 'bg-green-200' :
                      subject.status === 'good' ? 'bg-blue-200' :
                      'bg-red-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'warning' ? 'bg-yellow-500' :
                  alert.type === 'success' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;