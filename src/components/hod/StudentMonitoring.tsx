import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const StudentMonitoring: React.FC = () => {
  const studentStats = [
    { batch: 'Batch-2022', total: 60, present: 52, percentage: 87 },
    { batch: 'Batch-2023', total: 65, present: 48, percentage: 74 },
    { batch: 'Batch-2024', total: 58, present: 51, percentage: 88 },
    { batch: 'Batch-2025', total: 62, present: 55, percentage: 89 }
  ];

  const lowAttendanceStudents = [
    { name: 'John Doe', rollNo: 'AI22001', attendance: 65, batch: '2022' },
    { name: 'Jane Smith', rollNo: 'AI23015', attendance: 68, batch: '2023' },
    { name: 'Mike Johnson', rollNo: 'AI22045', attendance: 62, batch: '2022' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Student Monitoring</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {studentStats.map((stat) => (
          <Card key={stat.batch}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{stat.batch}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Present: {stat.present}/{stat.total}</span>
                <Badge variant={stat.percentage >= 85 ? 'default' : stat.percentage >= 75 ? 'secondary' : 'destructive'}>
                  {stat.percentage}%
                </Badge>
              </div>
              <Progress value={stat.percentage} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Excellent (85%+)</span>
              <span className="font-medium text-green-600">156 students</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Good (75-84%)</span>
              <span className="font-medium text-yellow-600">68 students</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Poor (&lt;75%)</span>
              <span className="font-medium text-red-600">21 students</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Low Attendance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowAttendanceStudents.map((student) => (
                <div key={student.rollNo} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.rollNo} - Batch {student.batch}</p>
                  </div>
                  <Badge variant="destructive">{student.attendance}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentMonitoring;