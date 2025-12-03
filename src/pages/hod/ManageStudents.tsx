import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Eye, UserCheck } from 'lucide-react';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
}

const ManageStudents = () => {
  const { user } = useAuth();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('2022');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      if (!user) return;
      try {
        const loadedStudents = await db.select().from(students).where(eq(students.userId, user.uid));
        setStudentsList(loadedStudents);
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
      (student.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-heading font-bold gradient-text">Loading Students...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-heading font-bold gradient-text">Manage Students</h1>
        <p className="text-muted-foreground mt-2">View and manage student records (Faculty Access)</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select 
              value={selectedBatch} 
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="2021">Batch 2021</option>
              <option value="2022">Batch 2022</option>
              <option value="2023">Batch 2023</option>
              <option value="2024">Batch 2024</option>
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} students from Batch {selectedBatch}
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
            <p className="text-muted-foreground">No students found for Batch {selectedBatch}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                  </div>
                  <UserCheck className="h-5 w-5 text-success" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{student.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{student.department || 'N/A'}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => toast.info('Student details viewed')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;