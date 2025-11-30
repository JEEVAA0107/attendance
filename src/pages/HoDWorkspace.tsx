import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Settings,
  Download,
  AlertTriangle,
  TrendingUp,
  Shield,
  UserX,
  Activity,
  Users,
  LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Components
import DepartmentStats from '@/components/hod/DepartmentStats';
import RealTimeMonitor from '@/components/hod/RealTimeMonitor';
import FacultySurveillance from '@/components/hod/FacultySurveillance';
import StudentMonitoring from '@/components/hod/StudentMonitoring';
import FacultyManagement from '@/components/hod/FacultyManagement';

const HoDWorkspace: React.FC = () => {
  const navigate = useNavigate();
  // Mock Data for Department Stats
  const [stats] = useState({
    totalFaculty: 14,
    activeFaculty: 12,
    totalStudents: 240,
    avgAttendance: 78.5,
    todayClasses: 8,
    completedClasses: 6,
    alertsCount: 3
  });

  // Mock Data for Charts
  const attendanceTrend = [
    { month: 'Aug', faculty: 92, students: 85 },
    { month: 'Sep', faculty: 89, students: 82 },
    { month: 'Oct', faculty: 94, students: 78 },
    { month: 'Nov', faculty: 91, students: 80 },
    { month: 'Dec', faculty: 88, students: 76 },
    { month: 'Jan', faculty: 93, students: 79 }
  ];

  const subjectPerformance = [
    { subject: 'AI/ML', attendance: 82 },
    { subject: 'DSA', attendance: 75 },
    { subject: 'DBMS', attendance: 88 },
    { subject: 'OS', attendance: 71 },
    { subject: 'CN', attendance: 79 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">HoD Workspace</h1>
              <Badge variant="secondary" className="text-sm">Role: HoD</Badge>
            </div>
            <p className="text-gray-600">AI & Data Science Department - SmartAttend Hub</p>
          </div>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => navigate('/login/hod')}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Executive Dashboard Stats */}
        <DepartmentStats stats={stats} />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white p-1 rounded-lg border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-Time</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Surveillance</TabsTrigger>
            <TabsTrigger value="students">Student Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Faculty vs Student attendance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="faculty" stroke="#8884d8" name="Faculty" strokeWidth={2} />
                      <Line type="monotone" dataKey="students" stroke="#82ca9d" name="Students" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                  <CardDescription>Average attendance rates by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions / Recent Alerts Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Recent System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Attendance in AI/ML class improved by 5% this week.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      3 Faculty members marked late today.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Database Connection</span>
                    <span className="text-green-600 font-medium">Stable</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Biometric Sync</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Backup</span>
                    <span className="text-gray-600">Today, 04:00 AM</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Real-Time Monitor Tab */}
          <TabsContent value="realtime">
            <RealTimeMonitor />
          </TabsContent>

          {/* Faculty Surveillance Tab */}
          <TabsContent value="faculty">
            <FacultySurveillance />
          </TabsContent>

          {/* Student Monitoring Tab */}
          <TabsContent value="students">
            <StudentMonitoring />
          </TabsContent>

          {/* Analytics Tab (Placeholder for Phase 2) */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed reports and predictive insights (Coming Soon)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
                <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
                <p>Advanced analytics module is under development.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Administration Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="space-y-6">
              <FacultyManagement />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">Attendance Policies</Button>
                    <Button className="w-full" variant="outline">Notification Settings</Button>
                    <Button className="w-full" variant="outline">User Permissions</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Data Export
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">Export Faculty Data</Button>
                    <Button className="w-full" variant="outline">Export Student Data</Button>
                    <Button className="w-full" variant="outline">Export System Logs</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default HoDWorkspace;