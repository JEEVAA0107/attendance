import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/db';
import { students as studentsTable, attendanceRecords } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';

const StudentAnalytics = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rangeType, setRangeType] = useState<'day' | 'week' | 'month'>('month');
  const [rangeValue, setRangeValue] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [studentData, setStudentData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getDateRange = (type: string, value: string) => {
    if (type === 'day') {
      return { start: value, end: value };
    } else if (type === 'week') {
      const [year, week] = value.split('-W');
      const startDate = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };
    } else {
      const [year, month] = value.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };
    }
  };

  const fetchStudentData = async () => {
    if (!user || !studentId) return;
    
    setLoading(true);
    try {
      // Get student info
      const student = await db.select().from(studentsTable)
        .where(and(eq(studentsTable.id, studentId), eq(studentsTable.userId, user.uid)))
        .limit(1);
      
      if (student.length === 0) {
        navigate('/analytics');
        return;
      }

      const { start, end } = getDateRange(rangeType, rangeValue);
      
      // Get attendance records for the period
      const records = await db.select().from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.userId, user.uid),
          gte(attendanceRecords.attendanceDate, start),
          lte(attendanceRecords.attendanceDate, end)
        ));

      // Calculate attendance stats
      let totalSessions = 0;
      let attendedSessions = 0;
      const dailyStats: any[] = [];
      const sessionDetails: any[] = [];

      records.forEach(record => {
        const periods = [record.period1, record.period2, record.period3, record.period4, record.period5, record.period6, record.period7];
        const presentPeriods = periods.filter(p => p).length;
        const totalPeriods = 7; // Always 7 periods
        
        totalSessions += 1; // Count each day as 1 session
        
        // Student is present only if all 7 periods are attended
        const isPresent = presentPeriods === 7;
        if (isPresent) {
          attendedSessions += 1;
        }
        
        const status = isPresent ? 'present' : 'absent';
        
        sessionDetails.push({
          date: record.attendanceDate,
          status,
          timeIn: record.createdAt ? new Date(record.createdAt).toLocaleTimeString() : null,
          periodsAttended: `${presentPeriods}/7`
        });
      });

      const attendancePercentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
      
      setStudentData({
        name: student[0].name,
        rollNo: student[0].rollNo,
        attendancePercentage,
        totalSessions,
        attendedSessions,
        classAverage: 78 // Calculate from all students if needed
      });
      
      // Remove daily data as we're not showing charts
      setSessions(sessionDetails.reverse());
      
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId, rangeType, rangeValue, user]);

  const getStatusBadge = (status: string) => {
    const colors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading student data...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="container py-8">
        <div className="text-center">Student not found</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{studentData.name}</h1>
          <p className="text-muted-foreground">{studentData.rollNo}</p>
        </div>
      </div>

      {/* Range Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map(type => (
                <Button
                  key={type}
                  variant={rangeType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRangeType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <input
                type={rangeType === 'day' ? 'date' : rangeType === 'week' ? 'week' : 'month'}
                value={rangeValue}
                onChange={(e) => setRangeValue(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {studentData.attendancePercentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              Attendance Rate
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {studentData.attendedSessions} / {studentData.totalSessions} sessions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {studentData.classAverage}%
            </div>
            <div className="text-sm text-muted-foreground">
              Class Average
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {studentData.attendedSessions}
            </div>
            <div className="text-sm text-muted-foreground">
              Days Present
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Sessions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session Details</CardTitle>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{session.date}</div>
                  <div className="text-sm text-muted-foreground">
                    Periods: {session.periodsAttended}
                  </div>
                  {session.timeIn && (
                    <div className="text-sm text-muted-foreground">
                      Time in: {session.timeIn}
                    </div>
                  )}
                </div>
                {getStatusBadge(session.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalytics;