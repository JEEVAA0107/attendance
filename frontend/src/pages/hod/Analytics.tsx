import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { students as studentsTable, attendanceRecords } from '@/lib/schema';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStudentsList, setShowStudentsList] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadAnalytics = useCallback(async () => {
      if (!user) return;
      
      try {
        // Get total students and remove duplicates by roll number
        const studentsData = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
        const uniqueStudents = studentsData.filter((student, index, self) => 
          index === self.findIndex(s => (s.rollNumber || '').toLowerCase() === (student.rollNumber || '').toLowerCase())
        );
        setAllStudents(uniqueStudents);
        setTotalStudents(uniqueStudents.length);
        
        // Get recent attendance data for weekly chart
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        const weeklyAttendance = await Promise.all(
          last7Days.map(async (date) => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            const records = await db.select().from(attendanceRecords)
              .where(and(
                eq(attendanceRecords.userId, user.uid),
                eq(attendanceRecords.attendanceDate, date)
              ));
            
            let present = 0;
            let absent = 0;
            
            records.forEach(record => {
              const periods = [record.period1, record.period2, record.period3, record.period4, record.period5, record.period6, record.period7];
              const presentPeriods = periods.filter(p => p).length;
              // Student is present only if all 7 periods are attended
              if (presentPeriods === 7) {
                present++;
              } else {
                absent++;
              }
            });
            
            return { day: dayName, present, absent };
          })
        );
        
        setWeeklyData(weeklyAttendance);
        
        // Calculate average attendance
        const totalPresent = weeklyAttendance.reduce((sum, day) => sum + day.present, 0);
        const totalPossible = weeklyAttendance.reduce((sum, day) => sum + day.present + day.absent, 0);
        const avgPercent = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
        setAvgAttendance(avgPercent);
        
        // Get department-wise data with real attendance calculation
        const deptStats = uniqueStudents.reduce((acc: any, student) => {
          const dept = student.department || 'Other';
          if (!acc[dept]) acc[dept] = { total: 0, present: 0, students: [] };
          acc[dept].total++;
          acc[dept].students.push(student.id);
          return acc;
        }, {});
        
        // Calculate real attendance for each department
        const deptData = await Promise.all(
          Object.entries(deptStats).map(async ([name, stats]: [string, any]) => {
            const deptAttendance = await db.select().from(attendanceRecords)
              .where(and(
                eq(attendanceRecords.userId, user.uid),
                gte(attendanceRecords.attendanceDate, last7Days[0])
              ));
            
            const deptStudentRecords = deptAttendance.filter(record => 
              stats.students.includes(record.studentId)
            );
            
            let totalPresent = 0;
            let totalPossible = deptStudentRecords.length * 7; // 7 periods per day
            
            deptStudentRecords.forEach(record => {
              const periods = [record.period1, record.period2, record.period3, record.period4, record.period5, record.period6, record.period7];
              totalPresent += periods.filter(p => p).length;
            });
            
            const attendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
            
            return { name, attendance, total: stats.total };
          })
        );
        
        setDepartmentData(deptData);
        
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
  }, [user]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadAnalytics();
      setLastUpdated(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadAnalytics]);
  
  // Monthly trend data (placeholder for now)
  const monthlyTrend = [
    { month: 'Jan', percentage: avgAttendance },
    { month: 'Feb', percentage: avgAttendance },
    { month: 'Mar', percentage: avgAttendance },
    { month: 'Apr', percentage: avgAttendance },
    { month: 'May', percentage: avgAttendance },
  ];
  
  const openPersonAnalytics = (personId: string) => {
    navigate(`/student-analytics/${personId}`);
  };

  const stats = [
    { icon: Users, label: 'Total Students', value: totalStudents.toString(), change: '+0%', color: 'text-primary', clickable: true },
    { icon: TrendingUp, label: 'Avg Attendance', value: `${avgAttendance}%`, change: '+0%', color: 'text-success' },
    { icon: Calendar, label: 'Classes Today', value: '7', change: '0%', color: 'text-accent' },
    { icon: Award, label: 'Active Days', value: weeklyData.filter(d => d.present > 0).length.toString(), change: '+0%', color: 'text-warning' },
  ];
  
  if (isLoading) {
    return (
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Analytics</h1>
          <p className="text-muted-foreground mt-2">Loading real-time insights...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Analytics</h1>
          <p className="text-muted-foreground mt-2">Real-time insights and attendance trends</p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-muted-foreground">
              {autoRefresh ? 'Live' : 'Paused'} • Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-xs text-primary hover:underline ml-2"
            >
              {autoRefresh ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              loadAnalytics();
              setLastUpdated(new Date());
              toast.success('Analytics refreshed');
            }}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              const analyticsData = [
                { Metric: 'Total Students', Value: totalStudents },
                { Metric: 'Average Attendance', Value: `${avgAttendance}%` },
                { Metric: 'Classes Today', Value: 7 },
                { Metric: 'Active Days', Value: weeklyData.filter(d => d.present > 0).length },
                ...weeklyData.map(day => ({ Metric: `${day.day} Present`, Value: day.present })),
                ...weeklyData.map(day => ({ Metric: `${day.day} Absent`, Value: day.absent })),
                ...departmentData.map(dept => ({ Metric: `${dept.name} Attendance`, Value: `${dept.attendance}%` }))
              ];
              
              const worksheet = XLSX.utils.json_to_sheet(analyticsData);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
              XLSX.writeFile(workbook, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
              toast.success('Analytics report exported to Excel');
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`glass-card hover-lift ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={stat.clickable ? () => setShowStudentsList(!showStudentsList) : undefined}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-heading">{stat.value}</p>
                  <p className={`text-sm ${stat.color} font-medium`}>{stat.change} from last month</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Students List */}
      {showStudentsList && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors"
                  onClick={() => openPersonAnalytics(student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary hover:text-primary/80">
                        {student.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.rollNumber} • {student.department || 'N/A'}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      View analytics →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="present" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Department-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-sm font-semibold text-primary">{dept.attendance}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${dept.attendance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
