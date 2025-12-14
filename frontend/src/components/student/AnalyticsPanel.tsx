import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Brain
} from 'lucide-react';

interface AnalyticsPanelProps {
  studentData: any;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ studentData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('semester');

  const attendanceTrend = [
    { month: 'Aug', attendance: 85, target: 75 },
    { month: 'Sep', attendance: 82, target: 75 },
    { month: 'Oct', attendance: 78, target: 75 },
    { month: 'Nov', attendance: 75, target: 75 },
    { month: 'Dec', attendance: 73, target: 75 },
    { month: 'Jan', attendance: 78, target: 75 }
  ];

  const subjectPerformance = [
    { subject: 'ML', attendance: 85, grade: 'A' },
    { subject: 'DS', attendance: 78, grade: 'B+' },
    { subject: 'DBMS', attendance: 72, grade: 'B' },
    { subject: 'Web Dev', attendance: 88, grade: 'A' },
    { subject: 'SE', attendance: 80, grade: 'B+' },
    { subject: 'AI Ethics', attendance: 90, grade: 'A+' }
  ];

  const weeklyPattern = [
    { day: 'Mon', attendance: 90 },
    { day: 'Tue', attendance: 85 },
    { day: 'Wed', attendance: 75 },
    { day: 'Thu', attendance: 80 },
    { day: 'Fri', attendance: 70 },
    { day: 'Sat', attendance: 65 }
  ];

  const attendanceDistribution = [
    { name: 'Present', value: 78, color: '#10b981' },
    { name: 'Absent', value: 18, color: '#ef4444' },
    { name: 'Late', value: 4, color: '#f59e0b' }
  ];

  const predictions = {
    semesterEnd: 76,
    riskLevel: 'medium',
    classesToAttend: 8,
    improvement: '+3%'
  };

  const insights = [
    {
      type: 'positive',
      title: 'Strong Morning Attendance',
      description: 'You have 90% attendance in morning classes (9-11 AM)',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      type: 'warning',
      title: 'Friday Pattern',
      description: 'Attendance drops to 70% on Fridays. Consider planning better.',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      type: 'info',
      title: 'Subject Correlation',
      description: 'Higher attendance in practical subjects correlates with better grades.',
      icon: <Brain className="h-4 w-4" />
    }
  ];

  const goals = [
    { title: 'Semester Target', current: 78, target: 80, progress: 97.5 },
    { title: 'Weekly Goal', current: 4, target: 5, progress: 80 },
    { title: 'Monthly Improvement', current: 3, target: 5, progress: 60 }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personal Analytics</h2>
          <p className="text-gray-600">Insights into your attendance patterns and performance</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Current Average</p>
                <p className="text-2xl font-bold text-blue-700">{studentData.currentAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-600">
              {predictions.improvement} from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Predicted End</p>
                <p className="text-2xl font-bold text-green-700">{predictions.semesterEnd}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-green-600">
              Based on current trend
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Classes Needed</p>
                <p className="text-2xl font-bold text-yellow-700">{predictions.classesToAttend}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-yellow-600">
              To reach 80% target
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Risk Level</p>
                <p className="text-2xl font-bold text-purple-700 capitalize">{predictions.riskLevel}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-purple-600">
              Early warning system
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyPattern}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {attendanceDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Goals Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.title}</span>
                    <span>{goal.current}/{goal.target}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;