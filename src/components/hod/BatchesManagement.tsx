import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Plus, ArrowLeft } from 'lucide-react';
import ClassManagement from './ClassManagement';

interface Batch {
  id: string;
  name: string;
  year: number;
  totalStudents: number;
}

interface Class {
  id: string;
  name: string;
  section: string;
  batchId: string;
}

const BatchesManagement: React.FC = () => {
  const [batches] = useState<Batch[]>([
    { id: '1', name: 'Batch-2022', year: 2022, totalStudents: 60 },
    { id: '2', name: 'Batch-2023', year: 2023, totalStudents: 65 },
    { id: '3', name: 'Batch-2024', year: 2024, totalStudents: 58 },
    { id: '4', name: 'Batch-2025', year: 2025, totalStudents: 62 }
  ]);

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([
    { id: '1', name: 'AI & Data Science', section: 'A', batchId: '1' },
    { id: '2', name: 'AI & Data Science', section: 'B', batchId: '1' },
    { id: '3', name: 'AI & Data Science', section: 'A', batchId: '2' }
  ]);

  const [newClass, setNewClass] = useState({ name: '', section: '' });
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', year: new Date().getFullYear(), totalStudents: 0 });
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchList, setBatchList] = useState<Batch[]>(batches);

  const handleBatchClick = (batch: Batch) => {
    setSelectedBatch(batch);
    setSelectedClass(null);
  };

  const handleClassClick = (classItem: Class) => {
    setSelectedClass(classItem);
  };

  const handleCreateClass = () => {
    if (newClass.name && newClass.section && selectedBatch) {
      const newClassItem: Class = {
        id: Date.now().toString(),
        name: newClass.name,
        section: newClass.section,
        batchId: selectedBatch.id
      };
      setClasses([...classes, newClassItem]);
      setNewClass({ name: '', section: '' });
      setShowCreateClass(false);
    }
  };

  const handleCreateBatch = () => {
    if (newBatch.name && newBatch.year) {
      const newBatchItem: Batch = {
        id: Date.now().toString(),
        name: newBatch.name,
        year: newBatch.year,
        totalStudents: newBatch.totalStudents
      };
      setBatchList([...batchList, newBatchItem]);
      setNewBatch({ name: '', year: new Date().getFullYear(), totalStudents: 0 });
      setShowCreateBatch(false);
    }
  };

  const getBatchClasses = (batchId: string) => {
    return classes.filter(c => c.batchId === batchId);
  };

  if (selectedClass) {
    return (
      <ClassManagement 
        classItem={selectedClass}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  if (selectedBatch) {
    const batchClasses = getBatchClasses(selectedBatch.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedBatch(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
          <h2 className="text-2xl font-bold">{selectedBatch.name} - Classes</h2>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-600">Manage classes for {selectedBatch.name}</p>
          <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="className">Class Name</Label>
                  <Input
                    id="className"
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    placeholder="e.g., AI & Data Science"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                    placeholder="e.g., A, B, C"
                  />
                </div>
                <Button onClick={handleCreateClass} className="w-full">
                  Create Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batchClasses.map((classItem) => (
            <Card 
              key={classItem.id} 
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleClassClick(classItem)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  {classItem.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Section: {classItem.section}</p>
                <p className="text-sm text-gray-500 mt-2">Click to manage students and faculty</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Batches Management</h2>
        <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
                  placeholder="e.g., Batch-2025"
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newBatch.year}
                  onChange={(e) => setNewBatch({...newBatch, year: parseInt(e.target.value)})}
                  placeholder="2025"
                />
              </div>
              <div>
                <Label htmlFor="totalStudents">Total Students</Label>
                <Input
                  id="totalStudents"
                  type="number"
                  value={newBatch.totalStudents}
                  onChange={(e) => setNewBatch({...newBatch, totalStudents: parseInt(e.target.value)})}
                  placeholder="60"
                />
              </div>
              <Button onClick={handleCreateBatch} className="w-full">
                Create Batch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {batchList.map((batch) => (
          <Card 
            key={batch.id} 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => handleBatchClick(batch)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                {batch.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Year: {batch.year}</p>
              <p className="text-gray-600">Students: {batch.totalStudents}</p>
              <p className="text-sm text-gray-500 mt-2">Click to view classes</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BatchesManagement;