import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Eye, Upload, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  regNo: string;
  email: string;
  phone: string;
  parentPhone: string;
  department: string;
  batch: string;
  [key: string]: any;
}

const Students = () => {
  const { user } = useAuth();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', rollNo: '', regNo: '', email: '', phone: '', parentPhone: '', department: '', batch: '2022' });
  const [uploadedStudents, setUploadedStudents] = useState<Student[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState('2022');

  useEffect(() => {
    const loadStudents = async () => {
      if (!user) return;
      try {
        const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
        setStudentsList(loadedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })));
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [user]);

  const filteredStudents = studentsList
    .filter(student => student.batch === selectedBatch)
    .filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Custom sorting: LA comes before UA
      const aIsLA = a.rollNo.includes('LA');
      const bIsLA = b.rollNo.includes('LA');
      const aIsUA = a.rollNo.includes('UA');
      const bIsUA = b.rollNo.includes('UA');
      
      if (aIsUA && bIsLA) return -1; // UA before LA
      if (aIsLA && bIsUA) return 1;  // LA after UA
      
      // Normal sorting within same type
      if (sortOrder === 'asc') {
        return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
      } else {
        return b.rollNo.localeCompare(a.rollNo, undefined, { numeric: true });
      }
    });

  const handleAddStudent = async () => {
    if (!formData.name || !formData.rollNo || !formData.email || !user) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Check for duplicate roll number
      const existingStudent = await db.select().from(students)
        .where(and(
          eq(students.userId, user.uid),
          eq(students.rollNo, formData.rollNo)
        ));
      
      if (existingStudent.length > 0) {
        toast.error('Student with this roll number already exists');
        return;
      }
      
      await db.insert(students).values({
        userId: user.uid,
        ...formData
      });
      
      const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
      setStudentsList(loadedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })));
      
      setFormData({ name: '', rollNo: '', regNo: '', email: '', phone: '', parentPhone: '', department: '', batch: '2022' });
      setIsAddDialogOpen(false);
      toast.success('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    }
  };

  const detectDataType = (value: string): string => {
    if (!value || value.trim() === '') return 'empty';
    
    const trimmed = value.trim();
    
    if (/^[+]?[0-9]{10,15}$/.test(trimmed.replace(/[\s()-]/g, ''))) return 'phone';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
    if (/^[0-9]{2,4}[A-Z]{2,4}[0-9]{3,4}$/i.test(trimmed)) return 'rollNo';
    if (/^[0-9]{8,12}$/.test(trimmed)) return 'regNo';
    if (/^(CSE|ECE|EEE|MECH|CIVIL|IT|AI|DS|2021|2022|2023|2024)$/i.test(trimmed)) return 'department';
    if (/^[A-Za-z\s.]+$/.test(trimmed) && trimmed.length > 2) return 'name';
    
    return 'other';
  };

  const normalizeStudentData = (rowData: any[]): Student => {
    const student: Student = {
      id: `upload-${Date.now()}-${Math.random()}`,
      name: '',
      rollNo: '',
      regNo: '',
      email: '',
      phone: '',
      parentPhone: '',
      department: '',
      batch: '2022'
    };

    const phones: string[] = [];
    
    rowData.forEach((cell, index) => {
      if (!cell) return;
      
      const cellValue = String(cell).trim();
      const dataType = detectDataType(cellValue);
      
      switch (dataType) {
        case 'name':
          if (!student.name) student.name = cellValue.toUpperCase();
          break;
        case 'rollNo':
          if (!student.rollNo) student.rollNo = cellValue.toUpperCase();
          break;
        case 'regNo':
          if (!student.regNo) student.regNo = cellValue;
          break;
        case 'email':
          if (!student.email) student.email = cellValue.toLowerCase();
          break;
        case 'phone':
          phones.push(cellValue.replace(/[\s()-]/g, ''));
          break;
        case 'department':
          if (!student.department && /^(CSE|ECE|EEE|MECH|CIVIL|IT|AI|DS)$/i.test(cellValue)) {
            student.department = cellValue.toUpperCase();
          } else if (!student.batch && /^(2021|2022|2023|2024)$/.test(cellValue)) {
            student.batch = cellValue;
          }
          break;
      }
      
      student[`Column${index + 1}`] = cellValue;
    });

    if (phones.length > 0) {
      student.phone = phones[0];
      if (phones.length > 1) {
        student.parentPhone = phones[1];
      }
    }

    return student;
  };

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
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        }) as any[][];

        if (jsonData.length < 1) {
          toast.error('File is empty or has no data');
          return;
        }

        const parsedStudents: Student[] = [];
        
        jsonData.forEach((row, index) => {
          if (!row || row.length === 0) return;
          
          const hasData = row.some(cell => cell && String(cell).trim() !== '');
          if (!hasData) return;
          
          const student = normalizeStudentData(row);
          
          if (student.name || student.rollNo) {
            parsedStudents.push(student);
          }
        });

        if (parsedStudents.length === 0) {
          toast.error('No valid student data found in the file');
          return;
        }

        setUploadedStudents(parsedStudents);
        toast.success(`${parsedStudents.length} students extracted and normalized`);
      } catch (error) {
        console.error('File reading error:', error);
        toast.error('Error reading file. Please ensure it\'s a valid Excel file.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = async () => {
    if (uploadedStudents.length === 0 || !user) {
      toast.error('No students to upload');
      return;
    }
    
    try {
      // Check for existing students by roll number
      const existingStudents = await db.select().from(students).where(eq(students.userId, user.uid));
      const existingRollNos = new Set(existingStudents.map(s => s.rollNo.toLowerCase()));
      
      // Filter out duplicates
      const newStudents = uploadedStudents.filter(student => 
        !existingRollNos.has(student.rollNo.toLowerCase())
      );
      
      if (newStudents.length === 0) {
        toast.error('All students already exist in database');
        return;
      }
      
      const studentsToInsert = newStudents.map(student => ({
        userId: user.uid,
        name: student.name,
        rollNo: student.rollNo,
        regNo: student.regNo,
        email: student.email,
        phone: student.phone,
        parentPhone: student.parentPhone,
        department: student.department,
        batch: selectedBatch
      }));
      
      await db.insert(students).values(studentsToInsert);
      
      const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
      setStudentsList(loadedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })));
      
      setUploadedStudents([]);
      setIsUploadDialogOpen(false);
      
      const duplicateCount = uploadedStudents.length - newStudents.length;
      if (duplicateCount > 0) {
        toast.success(`${newStudents.length} new students added, ${duplicateCount} duplicates skipped`);
      } else {
        toast.success(`${newStudents.length} students added to database`);
      }
    } catch (error) {
      console.error('Error uploading students:', error);
      toast.error('Failed to upload students');
    }
  };

  const handleCancelUpload = () => {
    setUploadedStudents([]);
    setIsUploadDialogOpen(false);
  };

  const handleEditStudent = async () => {
    if (!editingStudent || !user) return;
    
    try {
      await db.update(students)
        .set(formData)
        .where(eq(students.id, editingStudent.id));
      
      const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
      setStudentsList(loadedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })));
      
      setEditingStudent(null);
      setFormData({ name: '', rollNo: '', regNo: '', email: '', phone: '', parentPhone: '', department: '', batch: '' });
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!user) return;
    
    try {
      await db.delete(students).where(eq(students.id, studentId));
      
      const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
      setStudentsList(loadedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })));
      
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      regNo: student.regNo || '',
      email: student.email || '',
      phone: student.phone || '',
      parentPhone: student.parentPhone || '',
      department: student.department || '',
      batch: student.batch || ''
    });
  };



  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Students</h1>
          <p className="text-muted-foreground mt-2">Manage student records and view attendance history</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredStudents.length > 0 && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                const worksheet = XLSX.utils.json_to_sheet(filteredStudents.map(student => ({
                  Name: student.name,
                  'Roll No': student.rollNo,
                  'Reg No': student.regNo,
                  Email: student.email,
                  Phone: student.phone,
                  'Parent Phone': student.parentPhone,
                  Department: student.department,
                  Batch: student.batch
                })));
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, `Batch ${selectedBatch}`);
                XLSX.writeFile(workbook, `Students_Batch_${selectedBatch}_${new Date().toISOString().split('T')[0]}.xlsx`);
                toast.success(`Exported ${filteredStudents.length} students to Excel`);
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Save Excel</span>
              <span className="sm:hidden">Save</span>
            </Button>
          )}
          {studentsList.length > 0 && (
            <Button 
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!user) return;
                try {
                  await db.delete(students).where(eq(students.userId, user.uid));
                  setStudentsList([]);
                  toast.success('All students deleted successfully');
                } catch (error) {
                  console.error('Error deleting students:', error);
                  toast.error('Failed to delete students');
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete All</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          )}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-primary/50 hover:bg-primary/10">
                <Upload className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Upload List</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Upload Student List</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Upload Excel file with student data in any format. The system intelligently detects and normalizes all information.
                </p>
              </DialogHeader>
              <div className="space-y-4 pt-4 flex-1 overflow-hidden flex flex-col">
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) or CSV files</p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {uploadedStudents.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Preview ({uploadedStudents.length} students)</h3>
                    </div>
                    <div className="border rounded-lg overflow-hidden flex-1">
                      <div className="overflow-auto max-h-[400px]">
                        <Table>
                          <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Roll No</TableHead>
                              <TableHead>Reg No</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Batch</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uploadedStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium text-primary">{student.name || '-'}</TableCell>
                                <TableCell className="font-mono">{student.rollNo || '-'}</TableCell>
                                <TableCell className="font-mono">{student.regNo || '-'}</TableCell>
                                <TableCell>{student.phone || '-'}</TableCell>
                                <TableCell className="text-sm">{student.email || '-'}</TableCell>
                                <TableCell>{student.department || '-'}</TableCell>
                                <TableCell>{student.batch || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleConfirmUpload} className="flex-1 btn-hero">
                        Confirm & Add All Students
                      </Button>
                      <Button onClick={handleCancelUpload} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-hero" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll Number *</Label>
                  <Input
                    id="rollNo"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="Enter roll number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regNo">Register Number</Label>
                  <Input
                    id="regNo"
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    placeholder="Enter register number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent Phone Number</Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="Enter parent phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddStudent} className="w-full btn-hero">
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2021">Batch 2021</SelectItem>
                <SelectItem value="2022">Batch 2022</SelectItem>
                <SelectItem value="2023">Batch 2023</SelectItem>
                <SelectItem value="2024">Batch 2024</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="whitespace-nowrap"
            >
              Sort {sortOrder === 'asc' ? '↑ 1-9' : '↓ 9-1'}
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredStudents.length} students from Batch {selectedBatch}
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No students found for Batch {selectedBatch}</p>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Student List
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Upload Student List</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Upload Excel file with student data in any format. The system intelligently detects and normalizes all information.
                    </p>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 flex-1 overflow-hidden flex flex-col">
                    <div>
                      <Label htmlFor="file-upload-empty" className="cursor-pointer">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">Excel (.xlsx, .xls) or CSV files</p>
                        </div>
                      </Label>
                      <Input
                        id="file-upload-empty"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                    
                    {uploadedStudents.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">Preview ({uploadedStudents.length} students)</h3>
                        </div>
                        <div className="border rounded-lg overflow-hidden flex-1">
                          <div className="overflow-auto max-h-[400px]">
                            <Table>
                              <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Roll No</TableHead>
                                  <TableHead>Reg No</TableHead>
                                  <TableHead>Phone</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Department</TableHead>
                                  <TableHead>Batch</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {uploadedStudents.map((student) => (
                                  <TableRow key={student.id}>
                                    <TableCell className="font-medium text-primary">{student.name || '-'}</TableCell>
                                    <TableCell className="font-mono">{student.rollNo || '-'}</TableCell>
                                    <TableCell className="font-mono">{student.regNo || '-'}</TableCell>
                                    <TableCell>{student.phone || '-'}</TableCell>
                                    <TableCell className="text-sm">{student.email || '-'}</TableCell>
                                    <TableCell>{student.department || '-'}</TableCell>
                                    <TableCell>{student.batch || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleConfirmUpload} className="flex-1 btn-hero">
                            Confirm & Add All Students
                          </Button>
                          <Button onClick={handleCancelUpload} variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
              <Card key={student.id} className="hover-lift">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-primary">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                      <p className="text-sm text-muted-foreground">Reg No: {student.regNo}</p>
                      <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>
                    </div>
                    <div className="flex gap-1 self-end sm:self-start sm:ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card">
                          <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Roll Number</Label>
                              <Input
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Register Number</Label>
                              <Input
                                value={formData.regNo}
                                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              />
                            </div>
                            <Button onClick={handleEditStudent} className="w-full">
                              Update Student
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;