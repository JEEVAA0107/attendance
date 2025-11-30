import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    UserX,
    Search,
    Filter,
    AlertTriangle,
    TrendingDown,
    Mail,
    Phone,
    FileText,
    Users
} from 'lucide-react';

interface StudentAlert {
    id: string;
    name: string;
    rollNumber: string;
    attendanceRate: number;
    subject: string;
    type: 'low_attendance' | 'consecutive_absence' | 'performance_drop';
    daysAbsent?: number;
    lastAttended?: string;
}

const StudentMonitoring: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const [alerts, setAlerts] = useState<StudentAlert[]>([
        {
            id: '1',
            name: 'Rahul Verma',
            rollNumber: '21AI001',
            attendanceRate: 68.5,
            subject: 'Machine Learning',
            type: 'low_attendance'
        },
        {
            id: '2',
            name: 'Sneha Gupta',
            rollNumber: '21AI045',
            attendanceRate: 71.2,
            subject: 'Data Structures',
            type: 'consecutive_absence',
            daysAbsent: 3,
            lastAttended: '2024-01-12'
        },
        {
            id: '3',
            name: 'Vikram Singh',
            rollNumber: '21AI022',
            attendanceRate: 65.0,
            subject: 'DBMS',
            type: 'low_attendance'
        },
        {
            id: '4',
            name: 'Anjali Desai',
            rollNumber: '21AI018',
            attendanceRate: 82.0,
            subject: 'Operating Systems',
            type: 'performance_drop'
        }
    ]);

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'low_attendance': return 'bg-red-100 text-red-800 border-red-200';
            case 'consecutive_absence': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'performance_drop': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'low_attendance': return <AlertTriangle className="h-4 w-4" />;
            case 'consecutive_absence': return <UserX className="h-4 w-4" />;
            case 'performance_drop': return <TrendingDown className="h-4 w-4" />;
            default: return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const filteredAlerts = alerts.filter(alert =>
        alert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <UserX className="h-6 w-6" />
                        Student Attendance Oversight
                    </h2>
                    <p className="text-gray-600">Monitor at-risk students and manage interventions</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search student..."
                            className="pl-9 w-[250px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                    <Button onClick={() => navigate('/students')}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Students
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="critical" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="critical">Critical Alerts ({alerts.filter(a => a.attendanceRate < 75).length})</TabsTrigger>
                    <TabsTrigger value="consecutive">Consecutive Absences</TabsTrigger>
                    <TabsTrigger value="all">All Students</TabsTrigger>
                </TabsList>

                <TabsContent value="critical" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAlerts
                            .filter(a => a.attendanceRate < 75)
                            .map((student) => (
                                <Card key={student.id} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">{student.name}</h3>
                                                <p className="text-sm text-gray-500">{student.rollNumber}</p>
                                            </div>
                                            <Badge variant="destructive" className="text-lg font-bold px-2 py-1">
                                                {student.attendanceRate}%
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium ${getAlertColor(student.type)}`}>
                                                {getAlertIcon(student.type)}
                                                {student.type.replace('_', ' ').toUpperCase()}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Subject:</span> {student.subject}
                                            </p>
                                            {student.daysAbsent && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Consecutive Days:</span> {student.daysAbsent}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Mail className="h-3 w-3 mr-2" />
                                                Email
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Phone className="h-3 w-3 mr-2" />
                                                Call
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </TabsContent>

                <TabsContent value="consecutive">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consecutive Absence Tracking</CardTitle>
                            <CardDescription>Students absent for 3 or more consecutive days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredAlerts
                                    .filter(a => a.type === 'consecutive_absence')
                                    .map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white p-2 rounded-full shadow-sm">
                                                    <UserX className="h-6 w-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{student.name}</h4>
                                                    <p className="text-sm text-gray-600">{student.rollNumber} • {student.subject}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-orange-800">
                                                    Absent since {student.lastAttended}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {student.daysAbsent} days total
                                                </p>
                                            </div>
                                            <Button size="sm" variant="destructive">
                                                Notify Parent
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentMonitoring;
