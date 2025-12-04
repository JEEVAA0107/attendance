import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Calendar,
  BookOpen,
  TrendingUp,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Users,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Components
import StudentDashboard from '@/components/student/StudentDashboard';
import AttendanceView from '@/components/student/AttendanceView';
import TimetableView from '@/components/student/TimetableView';
import NotificationsPanel from '@/components/student/NotificationsPanel';
import RequestsPanel from '@/components/student/RequestsPanel';
import AnalyticsPanel from '@/components/student/AnalyticsPanel';
import CommunicationHub from '@/components/student/CommunicationHub';
import ResourceCenter from '@/components/student/ResourceCenter';
import ProfileManagement from '@/components/student/ProfileManagement';
import LeaveManagement from '@/components/student/LeaveManagement';
import DocumentCenter from '@/components/student/DocumentCenter';

const StudentWorkspace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentData, setStudentData] = useState({
    name: 'John Doe',
    rollNo: 'AI22001',
    batch: '2022',
    semester: '5th',
    department: 'AI & Data Science',
    currentAttendance: 78.5,
    todayClasses: 6,
    attendedToday: 4,
    totalSubjects: 8,
    alerts: 2
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">
                  {studentData.name} • {studentData.rollNo} • {studentData.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {studentData.semester} Semester
              </Badge>
              <Badge 
                className={`text-sm ${
                  studentData.currentAttendance >= 75 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {studentData.currentAttendance}% Attendance
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1 text-xs">
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-1 text-xs">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="timetable" className="flex items-center gap-1 text-xs">
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Timetable</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-1 text-xs">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1 text-xs">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden lg:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs">
              <Bell className="h-4 w-4" />
              <span className="hidden lg:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1 text-xs">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden lg:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1 text-xs">
              <BookOpen className="h-4 w-4" />
              <span className="hidden lg:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <StudentDashboard studentData={studentData} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileManagement studentData={studentData} />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <AttendanceView studentData={studentData} />
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable">
            <TimetableView studentData={studentData} />
          </TabsContent>

          {/* Leave Management Tab */}
          <TabsContent value="leave">
            <LeaveManagement studentData={studentData} />
          </TabsContent>

          {/* Document Center Tab */}
          <TabsContent value="documents">
            <DocumentCenter studentData={studentData} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsPanel studentData={studentData} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsPanel studentData={studentData} />
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <RequestsPanel studentData={studentData} />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <CommunicationHub studentData={studentData} />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <ResourceCenter studentData={studentData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentWorkspace;