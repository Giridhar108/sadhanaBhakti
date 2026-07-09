import { readAuthUser } from '../../entities/user/model/auth';

export type CalendarEventType = 'japa' | 'reading' | 'verse' | 'meeting' | 'other';

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  type: CalendarEventType;
};

const STORAGE_KEY = 'hare-krishna-calendar-events';

const isCalendarEventType = (value: unknown): value is CalendarEventType =>
  value === 'japa' || value === 'reading' || value === 'verse' || value === 'meeting' || value === 'other';

const isCalendarEvent = (value: unknown): value is CalendarEvent => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === 'string' &&
    typeof event.date === 'string' &&
    typeof event.title === 'string' &&
    isCalendarEventType(event.type)
  );
};

export const calendarEventsChanged = 'calendar-events-changed';

export function readCalendarEvents(): CalendarEvent[] {
  const authEvents = readAuthUser()?.settings.calendarEvents;

  if (authEvents) {
    return authEvents.filter(isCalendarEvent);
  }

  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawEvents = window.localStorage.getItem(STORAGE_KEY);
    const parsedEvents: unknown = rawEvents ? JSON.parse(rawEvents) : [];

    return Array.isArray(parsedEvents) ? parsedEvents.filter(isCalendarEvent) : [];
  } catch {
    return [];
  }
}

export function writeCalendarEvents(events: CalendarEvent[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event(calendarEventsChanged));
}
