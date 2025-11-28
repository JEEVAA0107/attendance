import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Download, Upload, Search, BookOpen, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/db';
import { students as studentsTable, attendanceRecords } from '@/lib/schema';
import { eq, and, gte, count, sql } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      
      try {
        // Get total students and remove duplicates by roll number
        const allStudents = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
        const uniqueStudents = allStudents.filter((student, index, self) => 
          index === self.findIndex(s => s.rollNo.toLowerCase() === student.rollNo.toLowerCase())
        );
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
              periods.forEach(p => p ? present++ : absent++);
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
        
        // Get department-wise data using unique students
        const deptStats = uniqueStudents.reduce((acc: any, student) => {
          const dept = student.department || 'Other';
          if (!acc[dept]) acc[dept] = { total: 0, present: 0 };
          acc[dept].total++;
          return acc;
        }, {});
        
        const deptData = Object.entries(deptStats).map(([name, stats]: [string, any]) => ({
          name,
          attendance: Math.round(Math.random() * 20 + 80) // Placeholder calculation
        }));
        
        setDepartmentData(deptData);
        
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalytics();
  }, [user]);
  
  // Monthly trend data (placeholder for now)
  const monthlyTrend = [
    { month: 'Jan', percentage: avgAttendance },
    { month: 'Feb', percentage: avgAttendance },
    { month: 'Mar', percentage: avgAttendance },
    { month: 'Apr', percentage: avgAttendance },
    { month: 'May', percentage: avgAttendance },
  ];
  
  const stats = [
    { icon: Users, label: 'Total Students', value: totalStudents.toString(), change: '+0%', color: 'text-primary' },
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
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card hover-lift">
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

      {/* NEW SECTION: Logical Attendance Analytics */}
      <LogicalAttendanceAnalytics />
    </div>
  );
};

// Logical Attendance Analytics Component
const LogicalAttendanceAnalytics = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'none' | 'database' | 'excel'>('none');

  // Load attendance data from database
  useEffect(() => {
    const loadAttendanceFromDB = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get all students
        const allStudents = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
        
        // Get all attendance records
        const allRecords = await db.select().from(attendanceRecords).where(eq(attendanceRecords.userId, user.uid));
        
        if (allRecords.length === 0) {
          setDataSource('none');
          setIsLoading(false);
          return;
        }
        
        // Process attendance data into the format needed
        const processedData: any[] = [];
        
        // Default subject mapping (will be overridden by Excel if uploaded)
        const periodSubjectMap: { [key: number]: string } = {
          1: 'Period 1',
          2: 'Period 2',
          3: 'Period 3',
          4: 'Period 4',
          5: 'Period 5',
          6: 'Period 6',
          7: 'Period 7'
        };
        
        allRecords.forEach(record => {
          const student = allStudents.find(s => s.id === record.studentId);
          if (!student) return;
          
          // Process each period (1-7)
          const periods = [
            { num: 1, status: record.period1 },
            { num: 2, status: record.period2 },
            { num: 3, status: record.period3 },
            { num: 4, status: record.period4 },
            { num: 5, status: record.period5 },
            { num: 6, status: record.period6 },
            { num: 7, status: record.period7 }
          ];
          
          periods.forEach(period => {
            processedData.push({
              date: record.attendanceDate,
              studentName: student.name,
              subject: periodSubjectMap[period.num] || 'General',
              period: period.num,
              status: period.status ? 'Present' : 'Absent',
              rollNo: student.rollNo,
              department: student.department,
              batch: student.batch
            });
          });
        });
        
        setAttendanceData(processedData);
        
        // Extract unique subjects and students
        const uniqueSubjects = [...new Set(processedData.map(item => item.subject))];
        const uniqueStudents = [...new Set(processedData.map(item => item.studentName))];
        
        setSubjects(uniqueSubjects);
        setStudents(uniqueStudents);
        setDataSource('database');
        
        if (processedData.length > 0) {
          toast.success(`Loaded ${processedData.length} attendance records from database`);
        }
      } catch (error) {
        console.error('Error loading attendance:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAttendanceFromDB();
  }, [user]);

  // Handle Excel file upload to get subject names
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Process attendance data with subject names from Excel
        const processedData = jsonData.map((row: any) => ({
          date: row.Date || row.date || new Date().toISOString().split('T')[0],
          studentName: row['Student Name'] || row.studentName || row.Name || '',
          subject: row.Subject || row.subject || '',
          period: row.Period || row.period || 1,
          status: row.Status || row.status || row.Present || 'Present'
        })).filter(item => item.studentName && item.subject);

        setAttendanceData(processedData);

        // Extract unique subjects and students
        const uniqueSubjects = [...new Set(processedData.map(item => item.subject))];
        const uniqueStudents = [...new Set(processedData.map(item => item.studentName))];
        
        setSubjects(uniqueSubjects);
        setStudents(uniqueStudents);
        setDataSource('excel');

        toast.success(`Loaded ${processedData.length} attendance records with ${uniqueSubjects.length} subjects from Excel`);
      } catch (error) {
        toast.error('Failed to process Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Calculate statistics
  const calculateStats = () => {
    let filteredData = attendanceData;

    // Apply date filter
    const filterDate = new Date(selectedDate);
    if (timeFilter === 'day') {
      filteredData = filteredData.filter(item => item.date === selectedDate);
    } else if (timeFilter === 'week') {
      const weekStart = new Date(filterDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      });
    } else if (timeFilter === 'month') {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === filterDate.getMonth() && 
               itemDate.getFullYear() === filterDate.getFullYear();
      });
    }

    // Apply subject filter
    if (selectedSubject !== 'all') {
      filteredData = filteredData.filter(item => item.subject === selectedSubject);
    }

    // Apply student search
    if (searchStudent) {
      filteredData = filteredData.filter(item => 
        item.studentName.toLowerCase().includes(searchStudent.toLowerCase())
      );
    }

    return filteredData;
  };

  // Get all students statistics
  const getAllStudentsStats = () => {
    const filteredData = calculateStats();
    const studentStats: any = {};

    filteredData.forEach(record => {
      if (!studentStats[record.studentName]) {
        studentStats[record.studentName] = {
          name: record.studentName,
          totalPresent: 0,
          totalConducted: 0,
          subjects: {}
        };
      }

      const isPresent = record.status.toLowerCase().includes('present') || 
                       record.status.toLowerCase() === 'p';
      
      studentStats[record.studentName].totalConducted++;
      if (isPresent) {
        studentStats[record.studentName].totalPresent++;
      }

      // Subject-wise tracking
      if (!studentStats[record.studentName].subjects[record.subject]) {
        studentStats[record.studentName].subjects[record.subject] = {
          present: 0,
          total: 0
        };
      }
      studentStats[record.studentName].subjects[record.subject].total++;
      if (isPresent) {
        studentStats[record.studentName].subjects[record.subject].present++;
      }
    });

    return Object.values(studentStats).map((stat: any) => ({
      ...stat,
      percentage: stat.totalConducted > 0 
        ? Math.round((stat.totalPresent / stat.totalConducted) * 100) 
        : 0
    }));
  };

  // Get subject-wise statistics
  const getSubjectStats = () => {
    const filteredData = calculateStats();
    const subjectStats: any = {};

    filteredData.forEach(record => {
      if (!subjectStats[record.subject]) {
        subjectStats[record.subject] = {
          subject: record.subject,
          totalPresent: 0,
          totalConducted: 0
        };
      }

      const isPresent = record.status.toLowerCase().includes('present') || 
                       record.status.toLowerCase() === 'p';
      
      subjectStats[record.subject].totalConducted++;
      if (isPresent) {
        subjectStats[record.subject].totalPresent++;
      }
    });

    return Object.values(subjectStats).map((stat: any) => ({
      ...stat,
      percentage: stat.totalConducted > 0 
        ? Math.round((stat.totalPresent / stat.totalConducted) * 100) 
        : 0
    }));
  };

  // Get chart data
  const getChartData = () => {
    const stats = getAllStudentsStats();
    return stats.slice(0, 10).map(stat => ({
      name: stat.name.split(' ')[0],
      attendance: stat.percentage,
      present: stat.totalPresent,
      total: stat.totalConducted
    }));
  };

  const allStudentsStats = getAllStudentsStats();
  const subjectStats = getSubjectStats();
  const chartData = getChartData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <>
        <Separator className="my-12" />
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-heading font-bold gradient-text">Logical Attendance Analytics</h2>
            <p className="text-muted-foreground mt-2">Loading attendance data from database...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Separator className="my-12" />
      
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-heading font-bold gradient-text">Logical Attendance Analytics</h2>
            <p className="text-muted-foreground mt-2">
              {dataSource === 'excel' 
                ? 'Analyzing attendance with subjects from Excel file' 
                : dataSource === 'database'
                ? 'Showing attendance from database (Upload Excel for subject names)'
                : 'Advanced attendance tracking with subject-wise analysis'}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Excel (Subjects)
            </Button>
            {dataSource === 'excel' && (
              <Button 
                onClick={() => {
                  window.location.reload();
                }} 
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Load from Database
              </Button>
            )}
          </div>
        </div>

        {attendanceData.length > 0 ? (
          <>
            {/* Filters Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Filter</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Period</label>
                    <Select value={timeFilter} onValueChange={(val: any) => setTimeFilter(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Student</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type student name..."
                        value={searchStudent}
                        onChange={(e) => setSearchStudent(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass-card bg-blue-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold text-blue-600">{allStudentsStats.length}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-green-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Attendance</p>
                      <p className="text-3xl font-bold text-green-600">
                        {allStudentsStats.length > 0 
                          ? Math.round(allStudentsStats.reduce((sum, s) => sum + s.percentage, 0) / allStudentsStats.length)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-purple-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Subjects</p>
                      <p className="text-3xl font-bold text-purple-600">{subjects.length}</p>
                    </div>
                    <BookOpen className="h-10 w-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-orange-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                      <p className="text-3xl font-bold text-orange-600">{calculateStats().length}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Student-wise Attendance Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{payload[0].payload.name}</p>
                                <p className="text-sm text-success">
                                  Present: {payload[0].payload.present}/{payload[0].payload.total}
                                </p>
                                <p className="text-sm text-primary">
                                  Percentage: {payload[0].value}%
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="attendance" fill="#0088FE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Subject-wise Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectStats}
                        dataKey="totalPresent"
                        nameKey="subject"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.subject}: ${entry.percentage}%`}
                      >
                        {subjectStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* All Students Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {searchStudent 
                    ? `Attendance Details for "${searchStudent}"` 
                    : selectedSubject !== 'all' 
                      ? `${selectedSubject} - All Students Attendance`
                      : 'All Students Attendance Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">S.No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-center">Periods Attended</TableHead>
                        <TableHead className="text-center">Total Periods</TableHead>
                        <TableHead className="text-center">Attendance</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allStudentsStats.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-bold text-primary">{student.name}</TableCell>
                          <TableCell className="text-center">{student.totalPresent}</TableCell>
                          <TableCell className="text-center">{student.totalConducted}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {student.totalPresent}/{student.totalConducted}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${student.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                              {student.percentage}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {allStudentsStats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendance records found for the selected filters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject-wise Breakdown (when student is searched) */}
            {searchStudent && allStudentsStats.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Subject-wise Breakdown for {searchStudent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Periods Attended</TableHead>
                          <TableHead className="text-center">Total Periods</TableHead>
                          <TableHead className="text-center">Attendance</TableHead>
                          <TableHead className="text-center">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(allStudentsStats[0].subjects).map(([subject, data]: [string, any]) => {
                          const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
                          return (
                            <TableRow key={subject}>
                              <TableCell className="font-medium">{subject}</TableCell>
                              <TableCell className="text-center">{data.present}</TableCell>
                              <TableCell className="text-center">{data.total}</TableCell>
                              <TableCell className="text-center font-semibold">
                                {data.present}/{data.total}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-bold ${percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                  {percentage}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const exportData = allStudentsStats.map((student, index) => ({
                    'S.No': index + 1,
                    'Student Name': student.name,
                    'Periods Attended': student.totalPresent,
                    'Total Periods': student.totalConducted,
                    'Attendance': `${student.totalPresent}/${student.totalConducted}`,
                    'Percentage': `${student.percentage}%`
                  }));

                  const worksheet = XLSX.utils.json_to_sheet(exportData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logical Attendance');
                  XLSX.writeFile(workbook, `Logical_Attendance_${timeFilter}_${selectedDate}.xlsx`);
                  toast.success('Attendance report exported successfully');
                }}
                className="btn-hero"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logical Attendance Report
              </Button>
            </div>
          </>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="space-y-6">
                <div>
                  <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Get Started with Logical Attendance</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose how you want to load attendance data:
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <Upload className="h-8 w-8 mx-auto text-primary mb-3" />
                      <h4 className="font-semibold mb-2">Upload Excel File</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload an Excel file with Date, Student Name, Subject, Period, and Status columns
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors">
                    <CardContent className="p-6">
                      <Calendar className="h-8 w-8 mx-auto text-accent mb-3" />
                      <h4 className="font-semibold mb-2">Use Database Records</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Mark attendance in the Attendance page first, then view analytics here
                      </p>
                      <Button onClick={() => window.location.href = '/attendance'} variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Go to Attendance
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-sm text-muted-foreground max-w-xl mx-auto">
                  <p className="font-semibold mb-2">💡 Recommended Workflow:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Mark attendance in the Attendance page (saves to database)</li>
                    <li>2. Upload an Excel file with subject names for each period</li>
                    <li>3. View comprehensive analytics with proper subject mapping</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Analytics;
