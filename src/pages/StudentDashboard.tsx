import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface StudentAttendance {
  subject: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setAttendanceData([
      {
        subject: 'Machine Learning',
        totalClasses: 45,
        attendedClasses: 38,
        percentage: 84.4,
        status: 'good'
      },
      {
        subject: 'Data Structures',
        totalClasses: 40,
        attendedClasses: 28,
        percentage: 70.0,
        status: 'warning'
      },
      {
        subject: 'Database Systems',
        totalClasses: 35,
        attendedClasses: 32,
        percentage: 91.4,
        status: 'good'
      },
      {
        subject: 'Operating Systems',
        totalClasses: 38,
        attendedClasses: 25,
        percentage: 65.8,
        status: 'critical'
      },
      {
        subject: 'Computer Networks',
        totalClasses: 42,
        attendedClasses: 35,
        percentage: 83.3,
        status: 'good'
      }
    ]);

    setTodaySchedule([
      { time: '09:00 - 10:00', subject: 'Machine Learning', faculty: 'Dr. Rajesh Kumar', room: 'Lab 301' },
      { time: '10:00 - 11:00', subject: 'Data Structures', faculty: 'Prof. Priya Sharma', room: 'Room 205' },
      { time: '11:30 - 12:30', subject: 'Database Systems', faculty: 'Prof. Sneha Gupta', room: 'Lab 402' },
      { time: '14:00 - 15:00', subject: 'Operating Systems', faculty: 'Dr. Amit Patel', room: 'Room 301' }
    ]);

    // Calculate overall attendance
    const total = attendanceData.reduce((sum, item) => sum + item.totalClasses, 0);
    const attended = attendanceData.reduce((sum, item) => sum + item.attendedClasses, 0);
    setOverallAttendance(total > 0 ? (attended / total) * 100 : 0);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const attendanceTrend = [
    { month: 'Aug', attendance: 85 },
    { month: 'Sep', attendance: 82 },
    { month: 'Oct', attendance: 78 },
    { month: 'Nov', attendance: 80 },
    { month: 'Dec', attendance: 76 },
    { month: 'Jan', attendance: 79 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          </div>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{user?.role?.toUpperCase()}</Badge>
            <Badge variant="outline">Roll: {user?.rollNumber || 'N/A'}</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{overallAttendance.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={overallAttendance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{todaySchedule.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Attendance</p>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceData.filter(item => item.percentage < 75).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subject-wise Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Attendance</CardTitle>
              <CardDescription>Your attendance record for each subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{subject.subject}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(subject.status)}>
                          {getStatusIcon(subject.status)}
                          {subject.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{subject.attendedClasses}/{subject.totalClasses} classes</span>
                      <span>{subject.status === 'critical' ? 'Below 75%' : subject.status === 'warning' ? 'Near 75%' : 'Good'}</span>
                    </div>
                    <Progress value={subject.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{schedule.subject}</h3>
                      <p className="text-sm text-gray-600">{schedule.faculty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{schedule.time}</p>
                      <p className="text-sm text-gray-600">{schedule.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>Your attendance percentage over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;