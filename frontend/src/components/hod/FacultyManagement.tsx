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
import { Plus, Search, UserCheck, UserX, RefreshCw, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FacultyService, FacultyData } from '@/lib/facultyService';

const FacultyManagement = () => {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<FacultyData | null>(null);
    const [showDirectory, setShowDirectory] = useState(false);
    const [newFaculty, setNewFaculty] = useState({
        name: '',
        email: '',
        biometricId: '',
        designation: '',
        department: 'AI & Data Science'
    });

    // Fetch faculty data
    const fetchFaculty = async () => {
        setLoading(true);
        const data = await FacultyService.getAllFaculty();
        setFaculty(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    // Handle Create Faculty
    const handleCreateFaculty = async () => {
        if (!newFaculty.name || !newFaculty.biometricId || !newFaculty.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        const result = await FacultyService.createFaculty(newFaculty);

        if (result.success) {
            toast.success('Faculty member created successfully');
            setIsAddDialogOpen(false);
            setNewFaculty({
                name: '',
                email: '',
                biometricId: '',
                designation: '',
                department: 'AI & Data Science'
            });
            fetchFaculty();
        } else {
            toast.error(result.error || 'Failed to create faculty');
        }
    };

    // Handle Status Toggle
    const handleToggleStatus = async (biometricId: string, currentStatus: boolean) => {
        const success = await FacultyService.toggleFacultyStatus(biometricId, !currentStatus);
        if (success) {
            toast.success(`Faculty status updated to ${!currentStatus ? 'Active' : 'Inactive'}`);
            fetchFaculty();
        } else {
            toast.error('Failed to update status');
        }
    };

    // Handle Edit Faculty
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

    // Handle Delete Faculty
    const handleDeleteFaculty = async (biometricId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        const result = await FacultyService.deleteFaculty(biometricId);
        if (result.success) {
            toast.success('Faculty deleted successfully');
            fetchFaculty();
        } else {
            toast.error(result.error || 'Failed to delete faculty');
        }
    };

    // Filter faculty based on search
    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.biometricId.includes(searchQuery) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Faculty Management</h2>
                    <p className="text-muted-foreground">Manage faculty credentials and access.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Faculty
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Faculty</DialogTitle>
                            <DialogDescription>
                                Create a new faculty account. The Faculty ID will be used for login.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={newFaculty.name}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newFaculty.email}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fid">Faculty ID (Login ID)</Label>
                                <Input
                                    id="fid"
                                    value={newFaculty.biometricId}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, biometricId: e.target.value })}
                                    placeholder="Faculty ID"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    value={newFaculty.designation}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                                    placeholder="Designation"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dept">Department</Label>
                                <Input
                                    id="dept"
                                    value={newFaculty.department}
                                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                                    disabled
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateFaculty}>Create Account</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Faculty Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Faculty</DialogTitle>
                            <DialogDescription>
                                Update faculty information.
                            </DialogDescription>
                        </DialogHeader>
                        {editingFaculty && (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingFaculty.name}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingFaculty.email}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-designation">Designation</Label>
                                    <Input
                                        id="edit-designation"
                                        value={editingFaculty.designation}
                                        onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dept">Department</Label>
                                    <Input
                                        id="edit-dept"
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

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Faculty Directory</h3>
                <Button 
                    variant="outline" 
                    onClick={() => navigate('/faculty-directory')}
                    className="gap-2"
                >
                    <Eye className="h-4 w-4" />
                    View Data
                </Button>
            </div>
        </div>
    );
};

export default FacultyManagement;
