import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calendar, AlertTriangle } from 'lucide-react';

interface AnalyticsProps {
  stats: {
    totalStudents: number;
    presentStudents: number;
    partialStudents: number;
    absentStudents: number;
    attendancePercentage: number;
  };
  weeklyData?: any[];
  inconsistencies?: any[];
}

export const AttendanceAnalytics = ({ stats, weeklyData = [], inconsistencies = [] }: AnalyticsProps) => {
  const chartData = [
    { name: 'Present', value: stats.presentStudents, fill: '#22c55e' },
    { name: 'Partial', value: stats.partialStudents, fill: '#3b82f6' },
    { name: 'Absent', value: stats.absentStudents, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-success">{stats.presentStudents}</p>
            </div>
            <Calendar className="h-8 w-8 text-success" />
          </CardContent>
        </Card>
        
        <Card className="bg-blue-100 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Partial</p>
              <p className="text-2xl font-bold text-blue-600">{stats.partialStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>
        
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-2xl font-bold text-warning">{stats.attendancePercentage}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-warning" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {inconsistencies.length > 0 && (
          <Card className="glass-card border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Issues Found ({inconsistencies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {inconsistencies.slice(0, 3).map((issue: any, index: number) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <div className="font-medium text-sm">{issue.studentName}</div>
                    <div className="text-xs text-orange-600">{issue.message}</div>
                  </div>
                ))}
                {inconsistencies.length > 3 && (
                  <div className="text-sm text-orange-600">
                    +{inconsistencies.length - 3} more issues
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};