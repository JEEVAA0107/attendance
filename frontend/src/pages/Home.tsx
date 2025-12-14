import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  FileSpreadsheet, 
  TrendingUp,
  Calendar,
  AlertCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { students as studentsTable, attendanceRecords } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

const Home = () => {
  const { user } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        // Get total students and remove duplicates by roll number
        const allStudents = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
        const uniqueStudents = allStudents.filter((student, index, self) => 
          index === self.findIndex(s => s.rollNo.toLowerCase() === student.rollNo.toLowerCase())
        );
        setTotalStudents(uniqueStudents.length);
        
        // Get today's attendance
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = await db.select().from(attendanceRecords)
          .where(and(
            eq(attendanceRecords.userId, user.uid),
            eq(attendanceRecords.attendanceDate, today)
          ));
        
        let todayPresent = 0;
        let todayTotal = 0;
        
        todayRecords.forEach(record => {
          const periods = [record.period1, record.period2, record.period3, record.period4, record.period5, record.period6, record.period7];
          periods.forEach(p => {
            todayTotal++;
            if (p) todayPresent++;
          });
        });
        
        const todayPercent = todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;
        setTodayAttendance(todayPercent);
        
        // Get weekly average
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        
        const weeklyRecords = await Promise.all(
          last7Days.map(date => 
            db.select().from(attendanceRecords)
              .where(and(
                eq(attendanceRecords.userId, user.uid),
                eq(attendanceRecords.attendanceDate, date)
              ))
          )
        );
        
        let weeklyPresent = 0;
        let weeklyTotal = 0;
        
        weeklyRecords.flat().forEach(record => {
          const periods = [record.period1, record.period2, record.period3, record.period4, record.period5, record.period6, record.period7];
          periods.forEach(p => {
            weeklyTotal++;
            if (p) weeklyPresent++;
          });
        });
        
        const weeklyPercent = weeklyTotal > 0 ? Math.round((weeklyPresent / weeklyTotal) * 100) : 0;
        setWeeklyAverage(weeklyPercent);
        
        // Set recent activity
        const activities = [
          { action: `${students.length} students in database`, time: 'Current', type: 'student' },
          { action: `${todayRecords.length} attendance records today`, time: 'Today', type: 'attendance' },
          { action: `${weeklyPercent}% weekly attendance rate`, time: 'This week', type: 'report' }
        ];
        
        setRecentActivity(activities);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);

  const stats = [
    { icon: Users, value: totalStudents.toString(), label: 'Total Students', color: 'text-blue-600' },
    { icon: ClipboardCheck, value: `${todayAttendance}%`, label: 'Today\'s Attendance', color: 'text-green-600' },
    { icon: Calendar, value: '7', label: 'Periods per Day', color: 'text-purple-600' },
    { icon: TrendingUp, value: `${weeklyAverage}%`, label: 'Weekly Average', color: 'text-orange-600' }
  ];

  const quickActions = [
    { icon: ClipboardCheck, title: 'Mark Attendance', description: 'Quick attendance marking', link: '/attendance' },
    { icon: Users, title: 'Manage Students', description: 'Add or edit student records', link: '/students' },
    { icon: BarChart3, title: 'View Analytics', description: 'Attendance insights & reports', link: '/analytics' },
    { icon: FileSpreadsheet, title: 'Export Data', description: 'Download attendance reports', link: '/export' }
  ];

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold">Loading Dashboard...</h1>
          <p className="text-muted-foreground">Fetching real-time data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your attendance system today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!user) return;
              try {
                const allStudents = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
                const duplicates = new Map();
                const toDelete = [];
                
                allStudents.forEach(student => {
                  const rollNo = student.rollNo.toLowerCase();
                  if (duplicates.has(rollNo)) {
                    toDelete.push(student.id);
                  } else {
                    duplicates.set(rollNo, student);
                  }
                });
                
                if (toDelete.length > 0) {
                  for (const id of toDelete) {
                    await db.delete(studentsTable).where(eq(studentsTable.id, id));
                  }
                  toast.success(`Removed ${toDelete.length} duplicate students`);
                  window.location.reload();
                } else {
                  toast.success('No duplicates found');
                }
              } catch (error) {
                toast.error('Failed to clean duplicates');
              }
            }}
          >
            <span className="hidden sm:inline">Clean Duplicates</span>
            <span className="sm:hidden">Clean</span>
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              const dashboardData = [
                { Metric: 'Total Students', Value: totalStudents },
                { Metric: 'Today\'s Attendance', Value: `${todayAttendance}%` },
                { Metric: 'Periods per Day', Value: 7 },
                { Metric: 'Weekly Average', Value: `${weeklyAverage}%` },
                ...recentActivity.map((activity, index) => ({ 
                  Activity: activity.action, 
                  Time: activity.time 
                }))
              ];
              
              const worksheet = XLSX.utils.json_to_sheet(dashboardData);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard Summary');
              XLSX.writeFile(workbook, `Dashboard_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
              toast.success('Dashboard summary exported to Excel');
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export Summary</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <action.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 rounded-full bg-primary/10 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
