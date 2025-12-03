import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  LogOut,
  Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Components
import DepartmentStats from '@/components/hod/DepartmentStats';
import RealTimeMonitor from '@/components/hod/RealTimeMonitor';
import FacultySurveillance from '@/components/hod/FacultySurveillance';
import StudentMonitoring from '@/components/hod/StudentMonitoring';
import FacultyManagement from '@/components/hod/FacultyManagement';
import StudentManagement from '@/components/hod/StudentManagement';
import EventsManagement from '@/components/hod/EventsManagement';
import BatchesManagement from '@/components/hod/BatchesManagement';
import HoDNavbar from '@/components/hod/HoDNavbar';
import Layout from '@/components/layout/Layout';

const HoDWorkspace: React.FC = memo(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCircularForm, setShowCircularForm] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  // Memoized mock data for better performance
  const stats = useMemo(() => ({
    totalFaculty: 14,
    activeFaculty: 12,
    totalStudents: 240,
    avgAttendance: 78.5,
    todayClasses: 8,
    completedClasses: 6,
    alertsCount: 3
  }), []);

  const attendanceTrend = useMemo(() => [
    { month: 'Aug', faculty: 92, students: 85 },
    { month: 'Sep', faculty: 89, students: 82 },
    { month: 'Oct', faculty: 94, students: 78 },
    { month: 'Nov', faculty: 91, students: 80 },
    { month: 'Dec', faculty: 88, students: 76 },
    { month: 'Jan', faculty: 93, students: 79 }
  ], []);

  const subjectPerformance = useMemo(() => [
    { subject: 'AI/ML', attendance: 82 },
    { subject: 'DSA', attendance: 75 },
    { subject: 'DBMS', attendance: 88 },
    { subject: 'OS', attendance: 71 },
    { subject: 'CN', attendance: 79 }
  ], []);

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HOD Workspace</h1>
              <Badge variant="secondary" className="text-sm">Head of the Department</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Executive Dashboard Stats - Only show on Overview */}
        {activeTab === 'overview' && <DepartmentStats stats={stats} />}

        {/* Main Dashboard Content */}
        <div className={activeTab === 'overview' ? 'mt-6' : ''}>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
            {/* Year-wise Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Year-wise Attendance Percentage</CardTitle>
                <CardDescription>Current academic year attendance by year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="#3b82f6" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="37.65" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">85%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">1st Year</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="55.22" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">78%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">2nd Year</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="#f97316" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="45.18" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-600">82%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">3rd Year</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="52.71" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-600">79%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">4th Year</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Circular Update */}
            <Card>
              <CardHeader>
                <CardTitle>Circular Update</CardTitle>
                <CardDescription>Send messages and files to faculty and students</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showCircularForm} onOpenChange={setShowCircularForm}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Create Circular
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Circular</DialogTitle>
                      <DialogDescription>Send messages and files to faculty and students</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Message Title</Label>
                          <Input placeholder="Enter message title" />
                        </div>
                        <div className="space-y-2">
                          <Label>Recipients</Label>
                          <select className="w-full p-2 border rounded-md">
                            <option>Faculty Only</option>
                            <option>Students Only</option>
                            <option>Faculty & Students</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Message Content</Label>
                        <textarea className="w-full p-2 border rounded-md h-24" placeholder="Enter your message here..."></textarea>
                      </div>
                      <div className="flex items-center gap-4">
                        <input type="file" className="hidden" id="circular-file" />
                        <Button variant="outline" onClick={() => document.getElementById('circular-file')?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Attach File
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCircularForm(false)}>Cancel</Button>
                      <Button className="bg-green-600 hover:bg-green-700">Send Circular</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

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
            </div>
          )}

          {/* Real-Time Monitor Tab */}
          {activeTab === 'realtime' && <RealTimeMonitor />}

          {/* Faculty Surveillance Tab */}
          {activeTab === 'faculty' && <FacultySurveillance />}

          {/* Student Monitoring Tab */}
          {activeTab === 'students' && <StudentMonitoring />}

          {/* Analytics Tab (Placeholder for Phase 2) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && <EventsManagement />}

          {/* Batches Tab */}
          {activeTab === 'batches' && <BatchesManagement />}

          {/* Administration Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Faculty Management</CardTitle>
                    <CardDescription>Manage faculty credentials and access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FacultyManagement />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Student Management</CardTitle>
                    <CardDescription>Manage student credentials and access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudentManagement />
                  </CardContent>
                </Card>
              </div>

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
          )}

        </div>
      </div>
    </div>
    </Layout>
  );
});

HoDWorkspace.displayName = 'HoDWorkspace';

export default HoDWorkspace;