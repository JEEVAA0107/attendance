import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Users, 
  AlertCircle, 
  Wifi,
  Database,
  Server
} from 'lucide-react';

interface LiveFacultyStatus {
  id: string;
  name: string;
  isOnline: boolean;
  currentClass?: string;
  loginTime?: string;
  location?: string;
  biometricStatus: 'active' | 'inactive' | 'error';
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  activeUsers: number;
  responseTime: number;
  uptime: string;
}

interface LiveAlert {
  id: string;
  type: 'security' | 'system' | 'attendance' | 'performance';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const RealTimeMonitor: React.FC = () => {
  const [facultyStatus, setFacultyStatus] = useState<LiveFacultyStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    dbConnections: 0,
    activeUsers: 0,
    responseTime: 0,
    uptime: '0h 0m'
  });
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFacultyStatus([
        {
          id: '1',
          name: 'Dr. Rajesh Kumar',
          isOnline: true,
          currentClass: 'Machine Learning - IV Year',
          loginTime: '09:30 AM',
          location: 'Lab 301',
          biometricStatus: 'active'
        },
        {
          id: '2',
          name: 'Prof. Priya Sharma',
          isOnline: true,
          currentClass: 'Data Structures - II Year',
          loginTime: '10:15 AM',
          location: 'Room 205',
          biometricStatus: 'active'
        },
        {
          id: '3',
          name: 'Dr. Amit Patel',
          isOnline: false,
          loginTime: '08:45 AM',
          location: 'Offline',
          biometricStatus: 'inactive'
        }
      ]);

      setSystemMetrics({
        cpuUsage: Math.random() * 30 + 40,
        memoryUsage: Math.random() * 20 + 60,
        dbConnections: Math.floor(Math.random() * 10) + 15,
        activeUsers: Math.floor(Math.random() * 5) + 8,
        responseTime: Math.random() * 50 + 100,
        uptime: '15h 42m'
      });

      const alerts: LiveAlert[] = [
        {
          id: '1',
          type: 'attendance',
          message: 'Student Rahul Verma (21AI001) marked absent for 3rd consecutive day',
          timestamp: new Date().toLocaleTimeString(),
          severity: 'high'
        },
        {
          id: '2',
          type: 'system',
          message: 'Database response time increased to 180ms',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
          severity: 'medium'
        }
      ];
      setLiveAlerts(alerts);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'system': return <Server className="h-4 w-4 text-orange-600" />;
      case 'attendance': return <Users className="h-4 w-4 text-blue-600" />;
      case 'performance': return <Activity className="h-4 w-4 text-purple-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Monitoring</h2>
        <div className="flex items-center gap-2">
          <Wifi className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Faculty Status
            </CardTitle>
            <CardDescription>Real-time faculty activity and location tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facultyStatus.map((faculty) => (
                <div key={faculty.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${faculty.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <h4 className="font-semibold">{faculty.name}</h4>
                      <p className="text-sm text-gray-600">
                        {faculty.currentClass || 'No active class'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{faculty.loginTime}</span>
                    </div>
                    <Badge variant={faculty.isOnline ? 'default' : 'secondary'}>
                      {faculty.location}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>{systemMetrics.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemMetrics.cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{systemMetrics.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${systemMetrics.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                  <p className="text-sm text-gray-600">DB Connections</p>
                  <p className="font-semibold">{systemMetrics.dbConnections}</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="font-semibold">{systemMetrics.activeUsers}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Live Alerts & Notifications
          </CardTitle>
          <CardDescription>Real-time system and attendance alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {liveAlerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.severity)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">{alert.timestamp}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMonitor;