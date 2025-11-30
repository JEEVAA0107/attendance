import { db } from './db';
import { events } from './schema';
import { eq, desc } from 'drizzle-orm';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string | null;
  venue: string | null;
  image: string | null;
  status: string;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export const eventsService = {
  // Get all events
  async getAllEvents(): Promise<Event[]> {
    try {
      const result = await db
        .select()
        .from(events)
        .orderBy(desc(events.eventDate));
      
      return result.map(event => ({
        ...event,
        eventDate: event.eventDate || '',
        eventTime: event.eventTime || '',
        venue: event.venue || '',
        image: event.image || '/placeholder.svg'
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await db
        .select()
        .from(events)
        .where(eq(events.status, 'upcoming'))
        .orderBy(events.eventDate);
      
      return result
        .filter(event => event.eventDate >= today)
        .map(event => ({
          ...event,
          eventDate: event.eventDate || '',
          eventTime: event.eventTime || '',
          venue: event.venue || '',
          image: event.image || '/placeholder.svg'
        }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  },

  // Get completed events
  async getCompletedEvents(): Promise<Event[]> {
    try {
      const result = await db
        .select()
        .from(events)
        .where(eq(events.status, 'completed'))
        .orderBy(desc(events.eventDate));
      
      return result.map(event => ({
        ...event,
        eventDate: event.eventDate || '',
        eventTime: event.eventTime || '',
        venue: event.venue || '',
        image: event.image || '/placeholder.svg'
      }));
    } catch (error) {
      console.error('Error fetching completed events:', error);
      return [];
    }
  }
};