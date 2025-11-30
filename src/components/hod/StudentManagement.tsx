import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, Search, Edit, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface StudentData {
    id: number;
    name: string;
    rollNumber: string;
    email: string;
    year: string;
    section: string;
    isActive: boolean;
}

const StudentManagement = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
    const [showDirectory, setShowDirectory] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        rollNumber: '',
        email: '',
        year: '4',
        section: 'A'
    });

    // Mock data
    useEffect(() => {
        setStudents([
            { id: 1, name: 'John Doe', rollNumber: '21AI001', email: 'john@student.edu', year: '4', section: 'A', isActive: true },
            { id: 2, name: 'Jane Smith', rollNumber: '21AI002', email: 'jane@student.edu', year: '4', section: 'A', isActive: true }
        ]);
    }, []);

    const handleCreateStudent = async () => {
        if (!newStudent.name || !newStudent.rollNumber) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newId = Math.max(...students.map(s => s.id), 0) + 1;
        const student: StudentData = {
            id: newId,
            ...newStudent,
            isActive: true
        };

        setStudents([...students, student]);
        toast.success('Student added successfully');
        setIsAddDialogOpen(false);
        setNewStudent({ name: '', rollNumber: '', email: '', year: '4', section: 'A' });
    };

    const handleEditStudent = (student: StudentData) => {
        setEditingStudent(student);
        setIsEditDialogOpen(true);
    };

    const handleUpdateStudent = () => {
        if (!editingStudent) return;
        
        setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
        toast.success('Student updated successfully');
        setIsEditDialogOpen(false);
        setEditingStudent(null);
    };

    const handleDeleteStudent = (id: number, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;
        setStudents(students.filter(s => s.id !== id));
        toast.success('Student deleted successfully');
    };

    const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Mock Excel processing
        toast.success('Excel file uploaded successfully (Mock)');
        const mockStudents: StudentData[] = [
            { id: Date.now(), name: 'Alice Johnson', rollNumber: '21AI003', email: 'alice@student.edu', year: '4', section: 'B', isActive: true },
            { id: Date.now() + 1, name: 'Bob Wilson', rollNumber: '21AI004', email: 'bob@student.edu', year: '4', section: 'B', isActive: true }
        ];
        setStudents([...students, ...mockStudents]);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
                    <p className="text-muted-foreground">Manage student credentials and access.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                        id="excel-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('excel-upload')?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>Create student login credentials.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        placeholder="Student Name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Roll Number</Label>
                                    <Input
                                        value={newStudent.rollNumber}
                                        onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                                        placeholder="21AI001"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        placeholder="student@college.edu"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Year</Label>
                                        <Input
                                            value={newStudent.year}
                                            onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Section</Label>
                                        <Input
                                            value={newStudent.section}
                                            onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateStudent}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Student Directory</h3>
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/student-directory')}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    View Data
                </Button>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={editingStudent.name}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input
                                    value={editingStudent.email}
                                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Year</Label>
                                    <Input
                                        value={editingStudent.year}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Section</Label>
                                    <Input
                                        value={editingStudent.section}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStudent}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentManagement;