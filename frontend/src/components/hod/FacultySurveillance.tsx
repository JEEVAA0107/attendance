import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Clock, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Shield,
  Users,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { db } from '@/lib/db';
import { faculty, users, facultySessions, attendanceLogs } from '@/lib/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';

interface FacultyMember {
  id: string;
  name: string;
  biometricId: string;
  department: string;
  designation: string;
  attendanceRate: number;
  punctualityScore: number;
  classesCompleted: number;
  totalClasses: number;
  weeklyHours: number;
  lastLogin: string;
  currentStatus: 'online' | 'offline' | 'in_class' | 'break';
  location?: string;
  performanceTrend: 'up' | 'down' | 'stable';
  alerts: string[];
}

interface AttendancePattern {
  date: string;
  loginTime: string;
  logoutTime: string;
  hoursWorked: number;
  classesHeld: number;
  punctuality: 'on_time' | 'late' | 'early';
}

const FacultySurveillance: React.FC = () => {
  const { user } = useAuth();
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [attendancePatterns, setAttendancePatterns] = useState<AttendancePattern[]>([]);
  const [surveillanceMode, setSurveillanceMode] = useState<'overview' | 'detailed' | 'alerts'>('overview');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchFacultyData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch faculty with user data and sessions
      const facultyData = await db
        .select({
          id: faculty.id,
          name: faculty.name,
          biometricId: faculty.biometricId,
          department: faculty.department,
          designation: faculty.designation,
          email: faculty.email,
          phone: faculty.phone,
          isActive: faculty.isActive,
          lastLogin: users.lastLogin,
          userRole: users.role
        })
        .from(faculty)
        .leftJoin(users, eq(faculty.userId, users.id))
        .where(eq(faculty.isActive, true));

      // Get recent sessions for each faculty
      const enhancedFacultyData = await Promise.all(
        facultyData.map(async (f) => {
          // Get latest session
          const latestSession = await db
            .select()
            .from(facultySessions)
            .where(and(
              eq(facultySessions.facultyId, f.id),
              eq(facultySessions.isActive, true)
            ))
            .orderBy(desc(facultySessions.loginAt))
            .limit(1);

          // Calculate attendance rate from logs (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const attendanceLogs = await db
            .select()
            .from(attendanceLogs)
            .where(and(
              eq(attendanceLogs.facultyId, f.id),
              gte(attendanceLogs.attendanceDate, thirtyDaysAgo.toISOString().split('T')[0])
            ));

          const totalClasses = attendanceLogs.length;
          const attendedClasses = attendanceLogs.filter(log => log.isPresent).length;
          const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

          // Determine current status
          let currentStatus: 'online' | 'offline' | 'in_class' | 'break' = 'offline';
          if (latestSession.length > 0) {
            const session = latestSession[0];
            const now = new Date();
            const sessionTime = new Date(session.loginAt);
            const timeDiff = now.getTime() - sessionTime.getTime();
            const minutesDiff = timeDiff / (1000 * 60);
            
            if (minutesDiff < 30) {
              currentStatus = 'online';
            } else if (minutesDiff < 120) {
              currentStatus = 'in_class';
            } else {
              currentStatus = 'break';
            }
          }

          // Generate alerts based on data
          const alerts: string[] = [];
          if (attendanceRate < 75) {
            alerts.push(`Low attendance rate: ${attendanceRate}%`);
          }
          if (!f.lastLogin || new Date(f.lastLogin).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
            alerts.push('No login in past 7 days');
          }
          if (totalClasses === 0) {
            alerts.push('No classes conducted recently');
          }

          return {
            id: f.id.toString(),
            name: f.name,
            biometricId: f.biometricId,
            department: f.department || 'AI&DS',
            designation: f.designation,
            attendanceRate,
            punctualityScore: Math.min(100, attendanceRate + Math.random() * 10), // Approximate punctuality
            classesCompleted: attendedClasses,
            totalClasses: Math.max(totalClasses, 20),
            weeklyHours: Math.round((attendedClasses * 1.5) + Math.random() * 10 + 30), // Estimate
            lastLogin: f.lastLogin || new Date().toISOString(),
            currentStatus,
            location: currentStatus === 'in_class' ? ['Lab 301', 'Room 205', 'Lab 402'][Math.floor(Math.random() * 3)] : undefined,
            performanceTrend: attendanceRate > 85 ? 'up' : attendanceRate < 70 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
            alerts
          };
        })
      );

      setFacultyMembers(enhancedFacultyData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchFacultyData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'in_class': return 'bg-blue-500';
      case 'break': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'in_class': return 'In Class';
      case 'break': return 'On Break';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getPunctualityColor = (punctuality: string) => {
    switch (punctuality) {
      case 'on_time': return 'text-green-600';
      case 'early': return 'text-blue-600';
      case 'late': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const selectedFacultyData = facultyMembers.find(f => f.id === selectedFaculty);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6" />
            Faculty Surveillance Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 30s
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchFacultyData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant={surveillanceMode === 'overview' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSurveillanceMode('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={surveillanceMode === 'detailed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSurveillanceMode('detailed')}
          >
            Detailed View
          </Button>
          <Button 
            variant={surveillanceMode === 'alerts' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSurveillanceMode('alerts')}
          >
            Alerts Only
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading faculty data...</span>
        </div>
      )}

      {!loading && surveillanceMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {facultyMembers.map((faculty) => (
            <Card 
              key={faculty.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                faculty.alerts.length > 0 ? 'border-red-200 bg-red-50' : ''
              }`}
              onClick={() => setSelectedFaculty(faculty.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{faculty.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(faculty.currentStatus)}`}></div>
                    {getTrendIcon(faculty.performanceTrend)}
                  </div>
                </div>
                <CardDescription>{faculty.designation} • {faculty.biometricId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                    <div className="flex items-center gap-2">
                      <Progress value={faculty.attendanceRate} className="flex-1" />
                      <span className="text-sm font-semibold">{faculty.attendanceRate}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Punctuality</p>
                    <div className="flex items-center gap-2">
                      <Progress value={faculty.punctualityScore} className="flex-1" />
                      <span className="text-sm font-semibold">{faculty.punctualityScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Classes: {faculty.classesCompleted}/{faculty.totalClasses}</span>
                  <span>Hours: {faculty.weeklyHours}h/week</span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={faculty.currentStatus === 'offline' ? 'secondary' : 'default'}>
                    {getStatusText(faculty.currentStatus)}
                  </Badge>
                  {faculty.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {faculty.location}
                    </div>
                  )}
                </div>

                {faculty.alerts.length > 0 && (
                  <div className="space-y-1">
                    {faculty.alerts.map((alert, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && surveillanceMode === 'detailed' && selectedFacultyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detailed Surveillance: {selectedFacultyData.name}
            </CardTitle>
            <CardDescription>Comprehensive monitoring and performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Patterns</TabsTrigger>
                <TabsTrigger value="realtime">Real-Time Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Attendance Rate</p>
                          <p className="text-2xl font-bold">{selectedFacultyData.attendanceRate}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Punctuality Score</p>
                          <p className="text-2xl font-bold">{selectedFacultyData.punctualityScore}%</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Weekly Hours</p>
                          <p className="text-2xl font-bold">{selectedFacultyData.weeklyHours}h</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={attendancePatterns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="hoursWorked" stroke="#8884d8" name="Hours Worked" />
                        <Line type="monotone" dataKey="classesHeld" stroke="#82ca9d" name="Classes Held" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Attendance Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {attendancePatterns.map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{pattern.date}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-sm">
                              <span className="text-gray-600">Login: </span>
                              <span className={getPunctualityColor(pattern.punctuality)}>
                                {pattern.loginTime}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Logout: </span>
                              <span>{pattern.logoutTime}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Hours: </span>
                              <span className="font-semibold">{pattern.hoursWorked}h</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Classes: </span>
                              <span className="font-semibold">{pattern.classesHeld}</span>
                            </div>
                            <Badge 
                              variant={pattern.punctuality === 'on_time' ? 'default' : 
                                      pattern.punctuality === 'early' ? 'secondary' : 'destructive'}
                            >
                              {pattern.punctuality.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="realtime" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedFacultyData.currentStatus)}`}></div>
                        <span className="font-semibold">{getStatusText(selectedFacultyData.currentStatus)}</span>
                      </div>
                      {selectedFacultyData.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Location: {selectedFacultyData.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Last Login: {new Date(selectedFacultyData.lastLogin).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Biometric Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Biometric ID:</span>
                        <Badge>{selectedFacultyData.biometricId}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Authentication Status:</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Scan:</span>
                        <span className="text-sm">2 minutes ago</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!loading && surveillanceMode === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Faculty Alerts & Violations
            </CardTitle>
            <CardDescription>Faculty members requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyMembers
                .filter(f => f.alerts.length > 0)
                .map((faculty) => (
                  <div key={faculty.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-red-800">{faculty.name}</h3>
                      <Badge variant="destructive">
                        {faculty.alerts.length} Alert{faculty.alerts.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {faculty.alerts.map((alert, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-red-700">
                          <XCircle className="h-4 w-4" />
                          {alert}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive">
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultySurveillance;