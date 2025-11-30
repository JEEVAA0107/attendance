import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, BookOpen, Users, TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

interface SubjectEntry {
  subjectId: string;
  subjectName: string;
  staffId: string;
  staffName: string;
  period: number;
  isPresent: boolean;
  hours: number;
}

interface StudentRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalHours: number;
  status: 'present' | 'partial' | 'absent';
  isFullDay: boolean;
  subjects: SubjectEntry[];
}

interface PrecisionReport {
  date: string;
  totalStudents: number;
  presentCount: number;
  partialCount: number;
  absentCount: number;
  attendanceRate: number;
  studentRecords: StudentRecord[];
  subjectWiseStats: Record<string, { present: number; total: number; rate: number }>;
}

export const PrecisionAttendancePanel = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('2022');
  const [report, setReport] = useState<PrecisionReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/precision/daily-report?user_id=${user.uid}&date=${selectedDate}&batch=${selectedBatch}`);
      const data = await response.json();
      
      if (response.ok) {
        setReport(data);
        toast.success('Precision report generated successfully');
      } else {
        toast.error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (!report) return;

    try {
      const response = await fetch('/api/precision/export-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_data: report }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const worksheet = XLSX.utils.aoa_to_sheet(data.excel_data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Precision Report');
        XLSX.writeFile(workbook, data.filename);
        toast.success('Report exported successfully');
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      absent: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Precision Attendance Engine
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            7-hour master rule with subject-wise tracking and automated consolidation
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2021">Batch 2021</SelectItem>
                  <SelectItem value="2022">Batch 2022</SelectItem>
                  <SelectItem value="2023">Batch 2023</SelectItem>
                  <SelectItem value="2024">Batch 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button onClick={generateReport} disabled={loading} className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Generate'}
                </Button>
                {report && (
                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-primary">{report.totalStudents}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">{report.presentCount}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-100 border-yellow-200">
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{report.partialCount}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </CardContent>
            </Card>
            <Card className="bg-red-100 border-red-200">
              <CardContent className="p-4 text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-600">{report.absentCount}</div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">{report.attendanceRate}%</div>
                <div className="text-sm text-muted-foreground">Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Subject-wise Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.subjectWiseStats).map(([subject, stats]) => (
                  <div key={subject} className="p-4 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{subject}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {stats.present}/{stats.total}
                      </span>
                      <Badge variant={stats.rate >= 80 ? 'default' : stats.rate >= 60 ? 'secondary' : 'destructive'}>
                        {stats.rate}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Records */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subjects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.studentRecords.map((record, index) => (
                      <TableRow key={record.studentId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{record.rollNo}</TableCell>
                        <TableCell>{record.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.totalHours}/7
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(record.totalHours / 7) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.subjects.map((subject, idx) => (
                              <Badge 
                                key={idx}
                                variant={subject.isPresent ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {subject.subjectName.substring(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};