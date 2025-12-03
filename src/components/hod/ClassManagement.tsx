import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, UserCheck, Plus } from 'lucide-react';
import ClassStudents from './ClassStudents';
import ClassFaculty from './ClassFaculty';

interface Class {
  id: string;
  name: string;
  section: string;
  batchId: string;
}

interface ClassManagementProps {
  classItem: Class;
  onBack: () => void;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ classItem, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{classItem.name} - Section {classItem.section}</h2>
          <p className="text-gray-600">Manage students and faculty for this class</p>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Faculty
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <ClassStudents classId={classItem.id} />
        </TabsContent>

        <TabsContent value="faculty" className="mt-6">
          <ClassFaculty classId={classItem.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassManagement;