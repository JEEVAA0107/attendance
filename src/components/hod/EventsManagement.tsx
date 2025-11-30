import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Edit, Trash2, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    image?: string;
    status: 'upcoming' | 'completed';
}

const EventsManagement = () => {
    const [events, setEvents] = useState<Event[]>([
        { id: 1, title: 'Annual Tech Fest', description: 'Department technical festival', date: '2024-02-15', time: '09:00', venue: 'Main Auditorium', image: '/placeholder.svg', status: 'upcoming' },
        { id: 2, title: 'Faculty Meeting', description: 'Monthly department meeting', date: '2024-01-20', time: '14:00', venue: 'Conference Room', image: '/placeholder.svg', status: 'completed' }
    ]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        image: ''
    });

    const handleCreateEvent = () => {
        if (!newEvent.title || !newEvent.date) {
            toast.error('Please fill in required fields');
            return;
        }

        const event: Event = {
            id: Date.now(),
            ...newEvent,
            status: 'upcoming'
        };

        setEvents([...events, event]);
        toast.success('Event created successfully');
        setIsAddDialogOpen(false);
        setNewEvent({ title: '', description: '', date: '', time: '', venue: '', image: '' });
    };

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setIsEditDialogOpen(true);
    };

    const handleUpdateEvent = () => {
        if (!editingEvent) return;
        
        setEvents(events.map(e => e.id === editingEvent.id ? editingEvent : e));
        toast.success('Event updated successfully');
        setIsEditDialogOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (id: number, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        setEvents(events.filter(e => e.id !== id));
        toast.success('Event deleted successfully');
    };

    const handleMarkCompleted = (id: number) => {
        setEvents(events.map(e => e.id === id ? { ...e, status: 'completed' } : e));
        toast.success('Event marked as completed');
    };

    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    const completedEvents = events.filter(e => e.status === 'completed');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Events Management</h2>
                    <p className="text-muted-foreground">Manage department events and activities</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>Add a new event to the calendar</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Event Title</Label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Event title"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Event Description</Label>
                                <textarea
                                    className="w-full p-2 border rounded-md h-20 resize-none"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Event description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Venue</Label>
                                <Input
                                    value={newEvent.venue}
                                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                                    placeholder="Event venue"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Event Image</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="event-image"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = URL.createObjectURL(file);
                                                setNewEvent({ ...newEvent, image: url });
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('event-image')?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Image
                                    </Button>
                                </div>
                                {newEvent.image && (
                                    <div className="mt-2">
                                        <img src={newEvent.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateEvent}>Create Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            {event.date} at {event.time}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            📍 {event.venue}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline">Upcoming</Badge>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkCompleted(event.id)}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditEvent(event)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteEvent(event.id, event.title)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
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
                                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4" />
                                            {event.date} at {event.time}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            📍 {event.venue}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            Completed
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteEvent(event.id, event.title)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                    </DialogHeader>
                    {editingEvent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Event Title</Label>
                                <Input
                                    value={editingEvent.title}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input
                                    value={editingEvent.description}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={editingEvent.date}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Time</Label>
                                    <Input
                                        type="time"
                                        value={editingEvent.time}
                                        onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Venue</Label>
                                <Input
                                    value={editingEvent.venue}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateEvent}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventsManagement;