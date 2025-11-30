import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Search, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const StudentDirectory = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

    useEffect(() => {
        // Mock data - replace with actual API call
        setStudents([
            { id: 1, name: 'John Doe', rollNumber: '21AI001', email: 'john@student.edu', year: '4', section: 'A', isActive: true },
            { id: 2, name: 'Jane Smith', rollNumber: '21AI002', email: 'jane@student.edu', year: '4', section: 'A', isActive: true },
            { id: 3, name: 'Alice Johnson', rollNumber: '21AI003', email: 'alice@student.edu', year: '4', section: 'B', isActive: true },
            { id: 4, name: 'Bob Wilson', rollNumber: '21AI004', email: 'bob@student.edu', year: '4', section: 'B', isActive: true }
        ]);
    }, []);

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

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/hod-workspace?tab=admin')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Admin
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
                        <p className="text-gray-600">Complete list of students</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Students</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-8 w-[250px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Roll Number</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{student.year}</TableCell>
                                            <TableCell>{student.section}</TableCell>
                                            <TableCell>
                                                <Badge variant={student.isActive ? 'default' : 'secondary'}>
                                                    {student.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditStudent(student)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteStudent(student.id, student.name)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                            <DialogDescription>Update student information.</DialogDescription>
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
                                    <Label>Roll Number</Label>
                                    <Input
                                        value={editingStudent.rollNumber}
                                        onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
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
        </div>
    );
};

export default StudentDirectory;