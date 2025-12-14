import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  GraduationCap,
  Grid3X3,
  LogOut
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
  const { user, logout } = useAuth();
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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'leave', label: 'Leave', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
    { id: 'communication', label: 'Messages', icon: MessageSquare },
    { id: 'resources', label: 'Resources', icon: BookOpen }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboard studentData={studentData} />;
      case 'profile':
        return <ProfileManagement studentData={studentData} />;
      case 'attendance':
        return <AttendanceView studentData={studentData} />;
      case 'timetable':
        return <TimetableView studentData={studentData} />;
      case 'leave':
        return <LeaveManagement studentData={studentData} />;
      case 'documents':
        return <DocumentCenter studentData={studentData} />;
      case 'analytics':
        return <AnalyticsPanel studentData={studentData} />;
      case 'notifications':
        return <NotificationsPanel studentData={studentData} />;
      case 'requests':
        return <RequestsPanel studentData={studentData} />;
      case 'communication':
        return <CommunicationHub studentData={studentData} />;
      case 'resources':
        return <ResourceCenter studentData={studentData} />;
      default:
        return <StudentDashboard studentData={studentData} />;
    }
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
                {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {studentData.name} • {studentData.rollNo} • {studentData.department}
              </p>
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

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspace;