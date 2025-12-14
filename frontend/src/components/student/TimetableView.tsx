import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TimetableViewProps {
  studentData: any;
}

const TimetableView: React.FC<TimetableViewProps> = ({ studentData }) => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const weeklyTimetable = {
    Monday: [
      { time: '09:00-10:00', subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Lab-1', type: 'Lab' },
      { time: '10:00-11:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Room-201', type: 'Theory' },
      { time: '11:00-12:00', subject: 'Database Systems', faculty: 'Dr. Brown', room: 'Room-105', type: 'Theory' },
      { time: '14:00-15:00', subject: 'Web Development', faculty: 'Prof. Davis', room: 'Lab-2', type: 'Lab' },
      { time: '15:00-16:00', subject: 'Software Engineering', faculty: 'Dr. Wilson', room: 'Room-301', type: 'Theory' }
    ],
    Tuesday: [
      { time: '09:00-10:00', subject: 'AI Ethics', faculty: 'Prof. Taylor', room: 'Room-205', type: 'Theory' },
      { time: '10:00-11:00', subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Room-201', type: 'Theory' },
      { time: '11:00-12:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Lab-1', type: 'Lab' },
      { time: '14:00-15:00', subject: 'Database Systems', faculty: 'Dr. Brown', room: 'Lab-3', type: 'Lab' },
      { time: '15:00-16:00', subject: 'Web Development', faculty: 'Prof. Davis', room: 'Room-301', type: 'Theory' }
    ],
    Wednesday: [
      { time: '09:00-10:00', subject: 'Software Engineering', faculty: 'Dr. Wilson', room: 'Room-105', type: 'Theory' },
      { time: '10:00-11:00', subject: 'AI Ethics', faculty: 'Prof. Taylor', room: 'Room-205', type: 'Theory' },
      { time: '11:00-12:00', subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Lab-1', type: 'Lab' },
      { time: '14:00-15:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Room-201', type: 'Theory' },
      { time: '15:00-16:00', subject: 'Database Systems', faculty: 'Dr. Brown', room: 'Room-105', type: 'Theory' }
    ],
    Thursday: [
      { time: '09:00-10:00', subject: 'Web Development', faculty: 'Prof. Davis', room: 'Lab-2', type: 'Lab' },
      { time: '10:00-11:00', subject: 'Software Engineering', faculty: 'Dr. Wilson', room: 'Room-301', type: 'Theory' },
      { time: '11:00-12:00', subject: 'AI Ethics', faculty: 'Prof. Taylor', room: 'Room-205', type: 'Theory' },
      { time: '14:00-15:00', subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Room-201', type: 'Theory' },
      { time: '15:00-16:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Lab-1', type: 'Lab' }
    ],
    Friday: [
      { time: '09:00-10:00', subject: 'Database Systems', faculty: 'Dr. Brown', room: 'Lab-3', type: 'Lab' },
      { time: '10:00-11:00', subject: 'Web Development', faculty: 'Prof. Davis', room: 'Room-301', type: 'Theory' },
      { time: '11:00-12:00', subject: 'Software Engineering', faculty: 'Dr. Wilson', room: 'Room-105', type: 'Theory' },
      { time: '14:00-15:00', subject: 'AI Ethics', faculty: 'Prof. Taylor', room: 'Room-205', type: 'Theory' },
      { time: '15:00-16:00', subject: 'Machine Learning', faculty: 'Dr. Smith', room: 'Lab-1', type: 'Lab' }
    ]
  };

  const todayClasses = weeklyTimetable.Monday; // Assuming today is Monday for demo

  const upcomingEvents = [
    { date: '2024-01-20', event: 'Mid-term Exam - Machine Learning', time: '10:00 AM', room: 'Exam Hall-1' },
    { date: '2024-01-22', event: 'Assignment Submission - Web Development', time: '11:59 PM', room: 'Online' },
    { date: '2024-01-25', event: 'Project Presentation - Software Engineering', time: '02:00 PM', room: 'Seminar Hall' }
  ];

  const facultyInfo = [
    { name: 'Dr. Smith', subject: 'Machine Learning', email: 'smith@college.edu', office: 'Room-401' },
    { name: 'Prof. Johnson', subject: 'Data Structures', email: 'johnson@college.edu', office: 'Room-402' },
    { name: 'Dr. Brown', subject: 'Database Systems', email: 'brown@college.edu', office: 'Room-403' },
    { name: 'Prof. Davis', subject: 'Web Development', email: 'davis@college.edu', office: 'Room-404' },
    { name: 'Dr. Wilson', subject: 'Software Engineering', email: 'wilson@college.edu', office: 'Room-405' },
    { name: 'Prof. Taylor', subject: 'AI Ethics', email: 'taylor@college.edu', office: 'Room-406' }
  ];

  const getClassTypeColor = (type: string) => {
    return type === 'Lab' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Today's Schedule Highlight */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((class_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm text-gray-600">{class_.time}</div>
                  <Badge className={getClassTypeColor(class_.type)}>
                    {class_.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{class_.subject}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {class_.faculty}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {class_.room}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timetable */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Timetable
              </CardTitle>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">This Week</SelectItem>
                  <SelectItem value="next">Next Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(weeklyTimetable).map(([day, classes]) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classes.map((class_, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{class_.time}</div>
                          <div className="text-sm text-gray-600">{class_.subject}</div>
                          <div className="text-xs text-gray-500">{class_.room}</div>
                        </div>
                        <Badge className={getClassTypeColor(class_.type)} size="sm">
                          {class_.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{event.event}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {event.date} • {event.time}
                    </div>
                    <div className="text-xs text-gray-500">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {event.room}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Faculty Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facultyInfo.slice(0, 4).map((faculty, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{faculty.name}</div>
                    <div className="text-xs text-gray-600">{faculty.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Office: {faculty.office}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View All Faculty
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimetableView;