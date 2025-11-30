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
import { ArrowLeft, Search, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FacultyService, FacultyData } from '@/lib/facultyService';

const FacultyDirectory = () => {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<FacultyData | null>(null);

    const fetchFaculty = async () => {
        setLoading(true);
        const data = await FacultyService.getAllFaculty();
        setFaculty(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleEditFaculty = (faculty: FacultyData) => {
        setEditingFaculty(faculty);
        setIsEditDialogOpen(true);
    };

    const handleUpdateFaculty = async () => {
        if (!editingFaculty) return;
        
        const result = await FacultyService.updateFaculty(editingFaculty.biometricId, {
            name: editingFaculty.name,
            email: editingFaculty.email,
            designation: editingFaculty.designation,
            department: editingFaculty.department
        });

        if (result.success) {
            toast.success('Faculty updated successfully');
            setIsEditDialogOpen(false);
            setEditingFaculty(null);
            fetchFaculty();
        } else {
            toast.error(result.error || 'Failed to update faculty');
        }
    };

    const handleDeleteFaculty = async (biometricId: string, name: string) => {
        if (!confirm(`Delete ${name}?`)) return;

        const result = await FacultyService.deleteFaculty(biometricId);
        if (result.success) {
            toast.success('Faculty deleted successfully');
            fetchFaculty();
        } else {
            toast.error(result.error || 'Failed to delete faculty');
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.biometricId.includes(searchQuery) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1 className="text-3xl font-bold text-gray-900">Faculty Directory</h1>
                        <p className="text-gray-600">Complete list of faculty members</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Faculty Members</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search faculty..."
                                        className="pl-8 w-[250px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={fetchFaculty}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Loading faculty data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFaculty.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No faculty found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFaculty.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell className="font-medium">{f.biometricId}</TableCell>
                                            <TableCell>{f.name}</TableCell>
                                            <TableCell>{f.designation}</TableCell>
                                            <TableCell>{f.email}</TableCell>
                                            <TableCell>{f.department}</TableCell>
                                            <TableCell>
                                                <Badge variant={f.isActive ? 'default' : 'secondary'} className={f.isActive ? 'bg-green-600' : 'bg-gray-400'}>
                                                    {f.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditFaculty(f)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteFaculty(f.biometricId, f.name)}
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
                            <DialogTitle>Edit Faculty</DialogTitle>
                            <DialogDescription>Update faculty information.</DialogDescription>
                        </DialogHeader>
                        {editingFaculty && (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={editingFaculty.name}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={editingFaculty.email}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Designation</Label>
                                    <Input
                                        value={editingFaculty.designation}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Department</Label>
                                    <Input
                                        value={editingFaculty.department}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateFaculty}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default FacultyDirectory;