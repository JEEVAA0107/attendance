import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Mail, Building, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Faculty = () => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    designation: '',
    biometric_id: '',
    department: 'AI&DS',
    email: ''
  });

  const addFaculty = async () => {
    try {
      const response = await fetch('https://uvrcfbwzygpjpzthvqfc.supabase.co/rest/v1/faculty', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cmNmYnd6eWdwanB6dGh2cWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5MDQzNywiZXhwIjoyMDgxMjY2NDM3fQ.37KlG8THxuerdxoASiagRfqbh1iGQ_y73QzQkRj5gEI',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cmNmYnd6eWdwanB6dGh2cWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5MDQzNywiZXhwIjoyMDgxMjY2NDM3fQ.37KlG8THxuerdxoASiagRfqbh1iGQ_y73QzQkRj5gEI',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(newFaculty)
      });

      if (response.ok) {
        setShowAddDialog(false);
        setNewFaculty({ name: '', designation: '', biometric_id: '', department: 'AI&DS', email: '' });
        fetchFaculty();
      } else {
        const error = await response.text();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Failed to add faculty:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      
      // Direct fetch to Supabase REST API
      const response = await fetch('https://uvrcfbwzygpjpzthvqfc.supabase.co/rest/v1/faculty?select=*', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cmNmYnd6eWdwanB6dGh2cWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5MDQzNywiZXhwIjoyMDgxMjY2NDM3fQ.37KlG8THxuerdxoASiagRfqbh1iGQ_y73QzQkRj5gEI',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2cmNmYnd6eWdwanB6dGh2cWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5MDQzNywiZXhwIjoyMDgxMjY2NDM3fQ.37KlG8THxuerdxoASiagRfqbh1iGQ_y73QzQkRj5gEI'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setFacultyList(data || []);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading faculty...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Available Faculty</h1>
          <p className="text-gray-600 mt-2">AI&DS Department Faculty</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFaculty} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  <DialogDescription>Add a new faculty member to the department</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      value={newFaculty.name} 
                      onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})} 
                      placeholder="Enter faculty name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input 
                      value={newFaculty.designation} 
                      onChange={(e) => setNewFaculty({...newFaculty, designation: e.target.value})} 
                      placeholder="e.g., Assistant Professor" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Biometric ID</Label>
                    <Input 
                      value={newFaculty.biometric_id} 
                      onChange={(e) => setNewFaculty({...newFaculty, biometric_id: e.target.value})} 
                      placeholder="Enter biometric ID" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input 
                      value={newFaculty.department} 
                      onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})} 
                      placeholder="Department" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={newFaculty.email} 
                      onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})} 
                      placeholder="Enter email address" 
                      type="email"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={addFaculty}>Add Faculty</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{facultyList.length}</div>
              <div className="text-sm text-gray-600">Total Faculty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {facultyList.filter(f => f.designation?.includes('HOD')).length}
              </div>
              <div className="text-sm text-gray-600">HOD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {facultyList.filter(f => !f.designation?.includes('HOD')).length}
              </div>
              <div className="text-sm text-gray-600">Assistant Professors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facultyList.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge variant={member.designation?.includes('HOD') ? 'default' : 'secondary'}>
                      {member.designation}
                    </Badge>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{member.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-blue-600">
                      {member.name?.toLowerCase().replace(' ', '.')}@college.edu
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Biometric ID: {member.biometric_id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Faculty;