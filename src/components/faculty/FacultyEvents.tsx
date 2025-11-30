import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin } from 'lucide-react';
import { eventsService, Event } from '@/lib/eventsService';

const FacultyEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const allEvents = await eventsService.getAllEvents();
        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data
        setEvents([
          {
            id: 1,
            title: 'Annual Tech Fest',
            description: 'Department technical festival',
            eventDate: '2024-02-15',
            eventTime: '09:00',
            venue: 'Main Auditorium',
            image: '/placeholder.svg',
            status: 'upcoming',
            createdBy: null,
            createdAt: null,
            updatedAt: null
          },
          {
            id: 2,
            title: 'Faculty Meeting',
            description: 'Monthly department meeting',
            eventDate: '2024-01-20',
            eventTime: '14:00',
            venue: 'Conference Room',
            image: '/placeholder.svg',
            status: 'completed',
            createdBy: null,
            createdAt: null,
            updatedAt: null
          }
        ]);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Events</h2>
        <p className="text-muted-foreground">Department events and activities</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Events ({completedEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src={event.image || '/placeholder.svg'} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description || 'No description available'}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {event.eventDate} at {event.eventTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                  </div>
                  <Badge variant="outline">Upcoming</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden opacity-75">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src={event.image || '/placeholder.svg'} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{event.description || 'No description available'}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {event.eventDate} at {event.eventTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyEvents;