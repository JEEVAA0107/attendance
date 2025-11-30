import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserCheck,
  Calendar,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';


interface ClassSchedule {
  id: string;
  time: string;
  subject: string;
  batch: string;
  room: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'missed';
}

interface SubjectStats {
  subject: string;
  totalStudents: number;
  avgAttendance: number;
  classesHeld: number;
  totalClasses: number;
}

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todaySchedule, setTodaySchedule] = useState<ClassSchedule[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalClasses: 0,
    completedClasses: 0,
    totalStudents: 0,
    avgAttendance: 0
  });

  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setTodaySchedule([
      {
        id: '1',
        time: '09:00 - 10:00',
        subject: 'Machine Learning',
        batch: 'IV Year AI&DS',
        room: 'Lab 301',
        status: 'completed'
      },
      {
        id: '2',
        time: '10:00 - 11:00',
        subject: 'Data Mining',
        batch: 'III Year AI&DS',
        room: 'Room 205',
        status: 'ongoing'
      },
      {
        id: '3',
        time: '11:30 - 12:30',
        subject: 'Deep Learning',
        batch: 'IV Year AI&DS',
        room: 'Lab 402',
        status: 'upcoming'
      },
      {
        id: '4',
        time: '14:00 - 15:00',
        subject: 'Neural Networks',
        batch: 'III Year AI&DS',
        room: 'Lab 301',
        status: 'upcoming'
      }
    ]);

    setSubjectStats([
      {
        subject: 'Machine Learning',
        totalStudents: 60,
        avgAttendance: 84.5,
        classesHeld: 18,
        totalClasses: 20
      },
      {
        subject: 'Data Mining',
        totalStudents: 55,
        avgAttendance: 78.2,
        classesHeld: 15,
        totalClasses: 18
      },
      {
        subject: 'Deep Learning',
        totalStudents: 45,
        avgAttendance: 91.3,
        classesHeld: 12,
        totalClasses: 15
      },
      {
        subject: 'Neural Networks',
        totalStudents: 50,
        avgAttendance: 76.8,
        classesHeld: 14,
        totalClasses: 16
      }
    ]);

    setDashboardStats({
      totalClasses: 69,
      completedClasses: 59,
      totalStudents: 210,
      avgAttendance: 82.7
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'ongoing': return <Clock className="h-4 w-4" />;
      case 'upcoming': return <Calendar className="h-4 w-4" />;
      case 'missed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleMarkAttendance = (classId: string) => {
    // Navigate to attendance marking page
    console.log('Mark attendance for class:', classId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          </div>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{user?.role?.toUpperCase()}</Badge>
            <Badge variant="outline">ID: {user?.biometricId}</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedClasses}/{dashboardStats.totalClasses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={(dashboardStats.completedClasses / dashboardStats.totalClasses) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.avgAttendance}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <Progress value={dashboardStats.avgAttendance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{todaySchedule.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{schedule.subject}</h3>
                        <Badge className={getStatusColor(schedule.status)}>
                          {getStatusIcon(schedule.status)}
                          {schedule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{schedule.batch} • {schedule.room}</p>
                      <p className="text-sm font-medium">{schedule.time}</p>
                    </div>
                    <div className="flex gap-2">
                      {schedule.status === 'ongoing' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(schedule.id)}
                        >
                          Mark Attendance
                        </Button>
                      )}
                      {schedule.status === 'upcoming' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(schedule.id)}
                        >
                          Start Class
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Attendance statistics for your subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{subject.subject}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={subject.avgAttendance >= 80 ? 'default' : subject.avgAttendance >= 70 ? 'secondary' : 'destructive'}>
                          {subject.avgAttendance.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{subject.totalStudents} students</span>
                      <span>{subject.classesHeld}/{subject.totalClasses} classes</span>
                    </div>
                    <Progress value={subject.avgAttendance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used faculty tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                Mark Attendance
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/students')}>
                <Users className="h-6 w-6" />
                View Students
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                Manage Subjects
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="h-6 w-6" />
                View Timetable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;