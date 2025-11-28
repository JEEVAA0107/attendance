import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Calendar, Download, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { students as studentsTable, attendanceRecords } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  batch?: string;
}

interface PeriodAttendance {
  [key: number]: boolean; // period number -> present/absent
}

interface AttendanceRecord {
  studentId: string;
  periods: PeriodAttendance;
}

const Attendance = () => {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState('2022');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, PeriodAttendance>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAllStudents = async () => {
      if (!user) return;
      try {
        const loadedStudents = await db.select().from(studentsTable).where(eq(studentsTable.userId, user.uid));
        setAllStudents(loadedStudents);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      }
    };
    loadAllStudents();
  }, [user]);
  
  // Filter students by selected batch
  useEffect(() => {
    const batchStudents = allStudents.filter(student => student.batch === selectedBatch);
    const sortedStudents = batchStudents.sort((a, b) => {
      const aIsUA = a.rollNo.includes('UA');
      const bIsUA = b.rollNo.includes('UA');
      const aIsLA = a.rollNo.includes('LA');
      const bIsLA = b.rollNo.includes('LA');
      
      if (aIsUA && bIsLA) return -1;
      if (aIsLA && bIsUA) return 1;
      
      return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
    });
    
    setStudents(sortedStudents);
  }, [allStudents, selectedBatch]);

  // Load attendance data when students or date changes
  useEffect(() => {
    const loadAttendance = async () => {
      if (!user || students.length === 0) return;
      
      try {
        const attendanceData = await db.select().from(attendanceRecords)
          .where(and(
            eq(attendanceRecords.userId, user.uid),
            eq(attendanceRecords.attendanceDate, selectedDate)
          ));
        
        const newAttendance = new Map<string, PeriodAttendance>();
        
        students.forEach(student => {
          const studentRecord = attendanceData.find(record => record.studentId === student.id);
          const periodData: PeriodAttendance = {};
          
          periods.forEach(p => {
            periodData[p.number] = Boolean(studentRecord?.[`period${p.number}` as keyof typeof studentRecord]) || false;
          });
          
          newAttendance.set(student.id, periodData);
        });
        
        setAttendance(newAttendance);
      } catch (error) {
        console.error('Error loading attendance:', error);
      }
    };
    
    loadAttendance();
  }, [user, students, selectedDate]);

  const batches = ['2024', '2023', '2022', '2021'];
  const periods = [
    { number: 1, time: '9:00 - 9:50' },
    { number: 2, time: '9:50 - 10:40' },
    { number: 3, time: '10:40 - 11:30' },
    { number: 4, time: '11:30 - 12:20' },
    { number: 5, time: '2:00 - 2:50', isAfterLunch: true },
    { number: 6, time: '2:50 - 3:40', isAfterLunch: true },
    { number: 7, time: '3:40 - 4:30', isAfterLunch: true },
  ];

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
        
        // Convert to JSON with header row as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        }) as any[][];

        if (jsonData.length < 1) {
          toast.error('File is empty or has no data');
          return;
        }

        // Simple extraction like ChatGPT - read all data directly
        const importedStudents: Student[] = [];
        
        jsonData.forEach((row, index) => {
          if (!row || row.length === 0) return;
          
          // Skip empty rows
          const hasData = row.some(cell => cell && String(cell).trim() !== '');
          if (!hasData) return;
          
          const student: Student = {
            id: `student-${index + 1}`,
            name: String(row[0] || '').trim(),
            rollNo: String(row[1] || '').trim()
          };
          
          // Only add if first column has data
          if (student.name) {
            importedStudents.push(student);
          }
        });

        // Sort by roll number
        const sortedStudents = importedStudents.sort((a, b) => 
          a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })
        );

        setStudents(sortedStudents);
        
        // Save to localStorage
        localStorage.setItem('smartattend_students', JSON.stringify(sortedStudents));
        
        // Initialize attendance for all students
        const newAttendance = new Map<string, PeriodAttendance>();
        sortedStudents.forEach(student => {
          const periodData: PeriodAttendance = {};
          periods.forEach(p => {
            periodData[p.number] = false; // default to absent
          });
          newAttendance.set(student.id, periodData);
        });
        setAttendance(newAttendance);

        toast.success(`Imported ${sortedStudents.length} students successfully`);
      } catch (error) {
        toast.error('Failed to import Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const togglePeriodAttendance = async (studentId: string, periodNumber: number) => {
    if (!user) return;
    
    const currentStatus = attendance.get(studentId)?.[periodNumber] || false;
    const newStatus = !currentStatus;
    
    // Update local state immediately for fast UI response
    setAttendance(prev => {
      const newAttendance = new Map(prev);
      const studentPeriods = newAttendance.get(studentId) || {};
      newAttendance.set(studentId, {
        ...studentPeriods,
        [periodNumber]: newStatus
      });
      return newAttendance;
    });
    
    // Update database in background
    try {
      const periodField = `period${periodNumber}` as keyof typeof attendanceRecords;
      
      const existingRecord = await db.select().from(attendanceRecords)
        .where(and(
          eq(attendanceRecords.studentId, studentId),
          eq(attendanceRecords.attendanceDate, selectedDate),
          eq(attendanceRecords.userId, user.uid)
        ));
      
      if (existingRecord.length > 0) {
        await db.update(attendanceRecords)
          .set({ [periodField]: newStatus })
          .where(eq(attendanceRecords.id, existingRecord[0].id));
      } else {
        await db.insert(attendanceRecords).values({
          studentId,
          userId: user.uid,
          attendanceDate: selectedDate,
          [periodField]: newStatus
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert local state on error
      setAttendance(prev => {
        const newAttendance = new Map(prev);
        const studentPeriods = newAttendance.get(studentId) || {};
        newAttendance.set(studentId, {
          ...studentPeriods,
          [periodNumber]: currentStatus
        });
        return newAttendance;
      });
      toast.error('Failed to update attendance');
    }
  };

  const handleSaveAttendance = () => {
    if (students.length === 0) {
      toast.error('No students found');
      return;
    }
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const time = now.toLocaleTimeString();
    toast.success(`Attendance saved for ${day}, ${selectedDate} at ${time}`);
  };

  const calculateStats = () => {
    let fulldayPresent = 0;
    let partialPresent = 0;
    let totalAbsent = 0;
    
    students.forEach(student => {
      const studentPeriods = attendance.get(student.id) || {};
      const presentPeriods = periods.filter(period => studentPeriods[period.number]).length;
      
      if (presentPeriods === 7) {
        fulldayPresent++;
      } else if (presentPeriods > 0) {
        partialPresent++;
      } else {
        totalAbsent++;
      }
    });

    return { fulldayPresent, partialPresent, totalAbsent };
  };

  const stats = calculateStats();

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Daily Attendance</h1>
        <p className="text-muted-foreground mt-2">Mark daily attendance for 7 periods (4 before lunch, 3 after lunch)</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Configuration & Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2021">Batch 2021</SelectItem>
                  <SelectItem value="2022">Batch 2022</SelectItem>
                  <SelectItem value="2023">Batch 2023</SelectItem>
                  <SelectItem value="2024">Batch 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">Upload Student List</label>
              <div className="flex gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Upload Excel</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                {students.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setStudents([]);
                      setAttendance(new Map());
                      localStorage.removeItem('smartattend_students');
                      toast.success('All students deleted successfully');
                    }}
                    size="sm"
                    className="px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {students.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-primary">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fullday Present</p>
                    <p className="text-2xl font-bold text-success">{stats.fulldayPresent}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-success" />
                </CardContent>
              </Card>
              <Card className="bg-blue-100 border-blue-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Partial Present</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.partialPresent}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </CardContent>
              </Card>
              <Card className="bg-red-100 border-red-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-600" />
                </CardContent>
              </Card>
              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Date</p>
                    <p className="text-lg font-bold text-warning">{new Date(selectedDate).toLocaleDateString()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-warning" />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Period-wise Attendance Grid</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Periods 1-4 (Before Lunch: 9:00 AM - 12:20 PM) | Lunch Break: 12:45 PM - 2:00 PM | Periods 5-7 (After Lunch: 2:00 PM - 4:30 PM)
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">S.No</TableHead>
                  <TableHead className="min-w-[120px]">Roll No</TableHead>
                  <TableHead className="min-w-[200px]">Student Name</TableHead>
                  {periods.map((period, idx) => (
                    <TableHead key={period.number} className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">P{period.number}</span>
                        <span className="text-xs text-muted-foreground">{period.time}</span>
                      </div>
                      {idx === 3 && (
                        <div className="mt-1 text-xs text-warning font-medium">
                          → Lunch
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const studentPeriods = attendance.get(student.id) || {};
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.rollNo}</TableCell>
                      <TableCell className="font-bold text-primary">{student.name}</TableCell>
                      {periods.map((period) => (
                        <TableCell key={period.number} className="text-center">
                          <div className="flex justify-center">
                            {studentPeriods[period.number] ? (
                              <div 
                                className="w-6 h-6 bg-green-500 rounded flex items-center justify-center cursor-pointer"
                                onClick={() => togglePeriodAttendance(student.id, period.number)}
                              >
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div 
                                className="w-6 h-6 border-2 border-gray-300 rounded cursor-pointer hover:border-green-400"
                                onClick={() => togglePeriodAttendance(student.id, period.number)}
                              />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button onClick={handleSaveAttendance} className="flex-1 btn-hero">
                <Calendar className="h-4 w-4 mr-2" />
                Save Attendance
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const attendanceData = students.map((student, index) => {
                    const studentPeriods = attendance.get(student.id) || {};
                    const row: any = {
                      'S.No': index + 1,
                      'Roll No': student.rollNo,
                      'Student Name': student.name
                    };
                    periods.forEach(period => {
                      row[`P${period.number} (${period.time})`] = studentPeriods[period.number] ? 'Present' : 'Absent';
                    });
                    return row;
                  });
                  
                  const worksheet = XLSX.utils.json_to_sheet(attendanceData);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance`);
                  XLSX.writeFile(workbook, `Attendance_Batch_${selectedBatch}_${selectedDate}.xlsx`);
                  toast.success('Attendance exported to Excel');
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Students Found for Batch {selectedBatch}</h3>
            <p className="text-muted-foreground mb-4">
              Upload an Excel file with student details or add students from the Students page. Students will be automatically assigned to Batch {selectedBatch}.
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Student List
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
