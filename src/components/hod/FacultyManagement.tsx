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
import { Plus, Search, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { FacultyService, FacultyData } from '@/lib/facultyService';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState<FacultyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Faculty Directory</CardTitle>
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
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Faculty ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Loading faculty data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredFaculty.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                                            <TableCell>
                                                <Badge variant={f.isActive ? 'default' : 'secondary'} className={f.isActive ? 'bg-green-600' : 'bg-gray-400'}>
                                                    {f.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(f.biometricId, f.isActive)}
                                                    className={f.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                                >
                                                    {f.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    <span className="sr-only">Toggle Status</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FacultyManagement;
