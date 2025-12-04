import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Eye
} from 'lucide-react';

interface AttendanceViewProps {
  studentData: any;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ studentData }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('current');

  const attendanceRecords = [
    { date: '2024-01-15', subject: 'Machine Learning', faculty: 'Dr. Smith', status: 'present', time: '09:00 AM' },
    { date: '2024-01-15', subject: 'Data Structures', faculty: 'Prof. Johnson', status: 'present', time: '10:00 AM' },
    { date: '2024-01-15', subject: 'Database Systems', faculty: 'Dr. Brown', status: 'absent', time: '11:00 AM' },
    { date: '2024-01-14', subject: 'Web Development', faculty: 'Prof. Davis', status: 'present', time: '02:00 PM' },
    { date: '2024-01-14', subject: 'Software Engineering', faculty: 'Dr. Wilson', status: 'present', time: '03:00 PM' },
    { date: '2024-01-14', subject: 'AI Ethics', faculty: 'Prof. Taylor', status: 'late', time: '04:00 PM' },
  ];

  const monthlyStats = {
    totalClasses: 120,
    attended: 94,
    absent: 18,
    late: 8,
    percentage: 78.3
  };

  const subjectWiseStats = [
    { subject: 'Machine Learning', total: 20, attended: 17, percentage: 85 },
    { subject: 'Data Structures', total: 18, attended: 14, percentage: 78 },
    { subject: 'Database Systems', total: 22, attended: 16, percentage: 73 },
    { subject: 'Web Development', total: 20, attended: 18, percentage: 90 },
    { subject: 'Software Engineering', total: 20, attended: 16, percentage: 80 },
    { subject: 'AI Ethics', total: 20, attended: 18, percentage: 90 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalClasses}</div>
            <div className="text-sm text-blue-600">Total Classes</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{monthlyStats.attended}</div>
            <div className="text-sm text-green-600">Attended</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{monthlyStats.absent}</div>
            <div className="text-sm text-red-600">Absent</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{monthlyStats.late}</div>
            <div className="text-sm text-yellow-600">Late</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{monthlyStats.percentage}%</div>
            <div className="text-sm text-purple-600">Percentage</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Attendance Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Late</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectWiseStats.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{subject.subject}</div>
                    <div className="text-sm text-gray-600">
                      {subject.attended}/{subject.total} classes attended
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{subject.percentage}%</div>
                    <Badge 
                      className={
                        subject.percentage >= 85 ? 'bg-green-100 text-green-800' :
                        subject.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {subject.percentage >= 85 ? 'Excellent' :
                       subject.percentage >= 75 ? 'Good' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="ds">Data Structures</SelectItem>
                  <SelectItem value="db">Database Systems</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="se">Software Engineering</SelectItem>
                  <SelectItem value="ai">AI Ethics</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell className="font-medium">{record.subject}</TableCell>
                  <TableCell>{record.faculty}</TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      {getStatusBadge(record.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceView;