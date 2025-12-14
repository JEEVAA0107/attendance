import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, BookOpen, AlertTriangle } from 'lucide-react';

interface DepartmentStatsProps {
    stats: {
        totalFaculty: number;
        activeFaculty: number;
        totalStudents: number;
        avgAttendance: number;
        todayClasses: number;
        completedClasses: number;
        alertsCount: number;
    };
}

const DepartmentStats: React.FC<DepartmentStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                        <Badge variant="secondary">{stats.activeFaculty} Active</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2">
                        <Progress value={stats.avgAttendance} className="w-full" />
                        <p className="text-xs text-gray-500 mt-1">{stats.avgAttendance}% Avg Attendance</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Today's Classes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completedClasses}/{stats.todayClasses}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-2">
                        <Progress value={(stats.completedClasses / stats.todayClasses) * 100} className="w-full" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Alerts</p>
                            <p className="text-2xl font-bold text-red-600">{stats.alertsCount}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="mt-2">
                        <Badge variant="destructive">Needs Attention</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentStats;
