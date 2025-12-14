import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  X,
  Eye,
  Archive
} from 'lucide-react';

interface NotificationsPanelProps {
  studentData: any;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ studentData }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      category: 'attendance',
      title: 'Low Attendance Alert',
      message: 'Your attendance in Database Systems has dropped to 72%. You need to attend the next 3 classes to meet the minimum requirement.',
      time: '2 hours ago',
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      category: 'academic',
      title: 'Assignment Reminder',
      message: 'Web Development assignment is due tomorrow at 11:59 PM. Make sure to submit your project files.',
      time: '4 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      category: 'achievement',
      title: 'Perfect Attendance Week!',
      message: 'Congratulations! You maintained 100% attendance this week. Keep up the excellent work!',
      time: '1 day ago',
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'info',
      category: 'schedule',
      title: 'Schedule Change',
      message: 'Machine Learning class on Friday has been moved from Lab-1 to Room-301 due to equipment maintenance.',
      time: '2 days ago',
      read: true,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'warning',
      category: 'exam',
      title: 'Exam Eligibility Warning',
      message: 'You are currently not eligible for Software Engineering exam due to low attendance. Contact your faculty immediately.',
      time: '3 days ago',
      read: false,
      priority: 'high'
    }
  ]);

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Attendance below 75% in 2 subjects',
      action: 'View Details',
      time: 'Now'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Assignment due in 24 hours',
      action: 'Submit Now',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'New study material uploaded',
      action: 'Download',
      time: '3 hours ago'
    }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Mid-term Examination Schedule Released',
      content: 'The mid-term examination schedule for all subjects has been published. Check your timetable for exam dates and venues.',
      author: 'Academic Office',
      time: '1 day ago',
      category: 'exam'
    },
    {
      id: 2,
      title: 'Library Hours Extended',
      content: 'Library will remain open until 10 PM during exam period. Additional study spaces have been arranged in the conference hall.',
      author: 'Library Administration',
      time: '2 days ago',
      category: 'facility'
    },
    {
      id: 3,
      title: 'Guest Lecture on AI Ethics',
      content: 'Dr. Sarah Johnson from MIT will deliver a guest lecture on "Ethics in Artificial Intelligence" on January 25th at 2 PM in the main auditorium.',
      author: 'AI & DS Department',
      time: '3 days ago',
      category: 'event'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Quick Alerts */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Urgent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">{alert.time}</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-3">
                    {alert.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Notifications */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({notifications.filter(n => !n.read).length})</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Notifications</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                            {!notification.read && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-3">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => ['attendance', 'academic', 'exam'].includes(n.category)).map((notification) => (
                  <div key={notification.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>College Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {announcement.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>By {announcement.author}</span>
                      <span>{announcement.time}</span>
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

export default NotificationsPanel;