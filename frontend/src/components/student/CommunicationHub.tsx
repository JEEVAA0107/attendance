import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Calendar,
  Users,
  BookOpen,
  Clock,
  Search,
  Plus
} from 'lucide-react';

interface CommunicationHubProps {
  studentData: any;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({ studentData }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const facultyContacts = [
    {
      id: 1,
      name: 'Dr. Smith',
      subject: 'Machine Learning',
      email: 'smith@college.edu',
      phone: '+1-234-567-8901',
      office: 'Room-401',
      officeHours: 'Mon-Wed 2-4 PM',
      lastMessage: 'Assignment deadline extended to Friday',
      lastMessageTime: '2 hours ago',
      unread: 2,
      status: 'online'
    },
    {
      id: 2,
      name: 'Prof. Johnson',
      subject: 'Data Structures',
      email: 'johnson@college.edu',
      phone: '+1-234-567-8902',
      office: 'Room-402',
      officeHours: 'Tue-Thu 10-12 PM',
      lastMessage: 'Great work on the lab assignment!',
      lastMessageTime: '1 day ago',
      unread: 0,
      status: 'offline'
    },
    {
      id: 3,
      name: 'Dr. Brown',
      subject: 'Database Systems',
      email: 'brown@college.edu',
      phone: '+1-234-567-8903',
      office: 'Room-403',
      officeHours: 'Mon-Fri 1-3 PM',
      lastMessage: 'Please see me during office hours',
      lastMessageTime: '3 days ago',
      unread: 1,
      status: 'busy'
    }
  ];

  const classmates = [
    {
      id: 1,
      name: 'Alice Johnson',
      rollNo: 'AI22002',
      lastMessage: 'Did you complete the ML assignment?',
      lastMessageTime: '30 min ago',
      unread: 1,
      status: 'online'
    },
    {
      id: 2,
      name: 'Bob Smith',
      rollNo: 'AI22003',
      lastMessage: 'Study group meeting at 6 PM',
      lastMessageTime: '2 hours ago',
      unread: 0,
      status: 'offline'
    }
  ];

  const studyGroups = [
    {
      id: 1,
      name: 'ML Study Group',
      members: 8,
      subject: 'Machine Learning',
      lastActivity: 'Alice shared notes',
      lastActivityTime: '1 hour ago',
      unread: 3
    },
    {
      id: 2,
      name: 'Database Project Team',
      members: 4,
      subject: 'Database Systems',
      lastActivity: 'Meeting scheduled for tomorrow',
      lastActivityTime: '4 hours ago',
      unread: 0
    }
  ];

  const appointments = [
    {
      id: 1,
      faculty: 'Dr. Smith',
      subject: 'Machine Learning',
      date: '2024-01-20',
      time: '2:00 PM',
      purpose: 'Discuss project proposal',
      status: 'confirmed'
    },
    {
      id: 2,
      faculty: 'Dr. Brown',
      subject: 'Database Systems',
      date: '2024-01-22',
      time: '1:30 PM',
      purpose: 'Attendance discussion',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="classmates">Classmates</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        {/* Faculty Communication */}
        <TabsContent value="faculty">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Faculty List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Faculty Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facultyContacts.map((faculty) => (
                    <div 
                      key={faculty.id} 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedChat(faculty)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{faculty.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(faculty.status)}`}></div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{faculty.name}</div>
                            <div className="text-xs text-gray-600">{faculty.subject}</div>
                            <div className="text-xs text-gray-500 truncate">{faculty.lastMessage}</div>
                          </div>
                        </div>
                        {faculty.unread > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {faculty.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedChat ? `Chat with ${selectedChat.name}` : 'Select a faculty member'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChat ? (
                  <div className="space-y-4">
                    {/* Faculty Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Office: </span>
                          {selectedChat.office}
                        </div>
                        <div>
                          <span className="font-medium">Hours: </span>
                          {selectedChat.officeHours}
                        </div>
                        <div>
                          <span className="font-medium">Email: </span>
                          {selectedChat.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone: </span>
                          {selectedChat.phone}
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="bg-blue-600 text-white p-2 rounded-lg max-w-xs">
                            <p className="text-sm">Hello Dr. Smith, I have a question about the ML assignment.</p>
                            <p className="text-xs opacity-75 mt-1">2:30 PM</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-white p-2 rounded-lg max-w-xs border">
                            <p className="text-sm">Hi! Sure, what's your question?</p>
                            <p className="text-xs text-gray-500 mt-1">2:32 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a faculty member to start chatting</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classmates */}
        <TabsContent value="classmates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classmates.map((classmate) => (
                  <div key={classmate.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{classmate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(classmate.status)}`}></div>
                        </div>
                        <div>
                          <div className="font-medium">{classmate.name}</div>
                          <div className="text-sm text-gray-600">{classmate.rollNo}</div>
                        </div>
                      </div>
                      {classmate.unread > 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {classmate.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{classmate.lastMessage}</p>
                    <p className="text-xs text-gray-500">{classmate.lastMessageTime}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Groups */}
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Study Groups
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyGroups.map((group) => (
                  <div key={group.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{group.members} members</Badge>
                        {group.unread > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 ml-2">
                            {group.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{group.lastActivity}</p>
                    <p className="text-xs text-gray-500">{group.lastActivityTime}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Faculty Appointments
                </CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{appointment.faculty}</h3>
                          <Badge 
                            className={
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{appointment.subject}</p>
                        <p className="text-sm text-gray-600 mb-1">{appointment.purpose}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
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

export default CommunicationHub;