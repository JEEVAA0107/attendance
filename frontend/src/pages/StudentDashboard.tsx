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
  CheckCircle,
  Grid3X3,
  Activity,
  User,
  Shield,
  UserCheck,
  BarChart3,
  Users,
  LogOut
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
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'realtime', label: 'Real-Time', icon: Activity },
    { id: 'faculty', label: 'Faculty', icon: User },
    { id: 'surveillance', label: 'Faculty Surveillance', icon: Shield },
    { id: 'monitoring', label: 'Student Monitoring', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'batches', label: 'Batches', icon: Users }
  ];

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

  const renderContent = () => {
    if (activeSection !== 'overview') {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Content for {navigationItems.find(item => item.id === activeSection)?.label} coming soon...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <Card>
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Grid3X3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">SmartAttend</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Overview'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.name}! • Roll: {user?.rollNumber || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{user?.role?.toUpperCase()}</Badge>
              <Badge 
                className={`text-sm ${
                  overallAttendance >= 75 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {overallAttendance.toFixed(1)}% Attendance
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;