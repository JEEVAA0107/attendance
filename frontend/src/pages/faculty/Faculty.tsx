import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Mail, Building, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, FacultyMember } from '@/lib/api';

const Faculty = () => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', designation: '', biometric_id: '', email: '' });
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);


  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const facultyData = await api.getFaculty();
        setFaculty(facultyData);
      } catch (error) {
        console.error('Failed to fetch faculty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading faculty...</div>
      </div>
    );
  }

  const handleAddFaculty = async () => {
    if (newFaculty.name && newFaculty.designation && newFaculty.biometric_id && newFaculty.email) {
      try {
        const createdFaculty = await api.createFaculty({ ...newFaculty, department: 'AI&DS' });
        setFaculty([...faculty, createdFaculty]);
        setNewFaculty({ name: '', designation: '', biometric_id: '', email: '' });
        setShowAddDialog(false);
      } catch (error) {
        console.error('Failed to add faculty:', error);
      }
    }
  };

  const handleEditFaculty = (member: FacultyMember) => {
    setEditingFaculty(member);
    setShowEditDialog(true);
  };

  const handleUpdateFaculty = async () => {
    if (editingFaculty) {
      try {
        const updatedFaculty = await api.updateFaculty(editingFaculty.id, {
          name: editingFaculty.name,
          designation: editingFaculty.designation,
          biometric_id: editingFaculty.biometric_id,
          email: editingFaculty.email,
          department: editingFaculty.department
        });
        setFaculty(faculty.map(f => f.id === editingFaculty.id ? updatedFaculty : f));
        setShowEditDialog(false);
        setEditingFaculty(null);
      } catch (error) {
        console.error('Failed to update faculty:', error);
      }
    }
  };

  const handleRemoveFaculty = async (id: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await api.deleteFaculty(id);
        setFaculty(faculty.filter(f => f.id !== id));
      } catch (error) {
        console.error('Failed to remove faculty:', error);
      }
    }
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Faculty Registry</h1>
          <p className="text-muted-foreground mt-2">AI&DS Department Faculty with Biometric Authentication</p>
        </div>
        {user?.role === 'hod' && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>Add a new faculty member to the AI&DS department</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newFaculty.name} onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})} placeholder="Enter faculty name" />
                </div>
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={newFaculty.designation} onChange={(e) => setNewFaculty({...newFaculty, designation: e.target.value})} placeholder="e.g., Assistant Professor" />
                </div>
                <div className="space-y-2">
                  <Label>Biometric ID</Label>
                  <Input value={newFaculty.biometric_id} onChange={(e) => setNewFaculty({...newFaculty, biometric_id: e.target.value})} placeholder="Enter biometric ID" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={newFaculty.email} onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})} placeholder="Enter email address" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddFaculty}>Add Faculty</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{faculty.length}</div>
              <div className="text-sm text-muted-foreground">Total Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">1</div>
              <div className="text-sm text-muted-foreground">HOD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{faculty.length - 1}</div>
              <div className="text-sm text-muted-foreground">Assistant Professors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">AI&DS</div>
              <div className="text-sm text-muted-foreground">Department</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((member, index) => (
          <Card key={index} className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge variant={member.designation.includes('HOD') ? 'default' : 'secondary'}>
                      {member.designation}
                    </Badge>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{member.department}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-blue-600">{member.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Biometric Authentication Enabled
                  </div>
                  {user?.role === 'hod' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFaculty(member)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFaculty(member.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Faculty Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>Update faculty member details</DialogDescription>
          </DialogHeader>
          {editingFaculty && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  value={editingFaculty.name} 
                  onChange={(e) => setEditingFaculty({...editingFaculty, name: e.target.value})} 
                  placeholder="Enter faculty name" 
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input 
                  value={editingFaculty.designation} 
                  onChange={(e) => setEditingFaculty({...editingFaculty, designation: e.target.value})} 
                  placeholder="e.g., Assistant Professor" 
                />
              </div>
              <div className="space-y-2">
                <Label>Biometric ID</Label>
                <Input 
                  value={editingFaculty.biometric_id} 
                  onChange={(e) => setEditingFaculty({...editingFaculty, biometric_id: e.target.value})} 
                  placeholder="Enter biometric ID" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={editingFaculty.email} 
                  onChange={(e) => setEditingFaculty({...editingFaculty, email: e.target.value})} 
                  placeholder="Enter email address" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateFaculty}>Update Faculty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Faculty;