import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import {
  calendarEventsChanged,
  readCalendarEvents,
  type CalendarEvent,
} from '../../shared/lib/calendarEvents';
import styles from './CalendarCard.module.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

type CalendarDay = {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvent: boolean;
  eventCount: number;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMonthDays(viewDate: Date, selectedDate: Date, events: CalendarEvent[]): CalendarDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);
  const eventCounts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.date] = (acc[event.date] ?? 0) + 1;

    return acc;
  }, {});

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(date);
    const eventCount = eventCounts[dateKey] ?? 0;

    return {
      date,
      dateKey,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      isSelected: dateKey === selectedKey,
      hasEvent: eventCount > 0,
      eventCount,
    };
  });
}

function getMonthTitle(date: Date) {
  const title = monthFormatter.format(date);

  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function CalendarCard() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => readCalendarEvents());

  useEffect(() => {
    const syncEvents = () => setEvents(readCalendarEvents());

    window.addEventListener('storage', syncEvents);
    window.addEventListener(calendarEventsChanged, syncEvents);

    return () => {
      window.removeEventListener('storage', syncEvents);
      window.removeEventListener(calendarEventsChanged, syncEvents);
    };
  }, []);

  const calendarDays = useMemo(() => getMonthDays(viewDate, selectedDate, events), [events, selectedDate, viewDate]);
  const selectedDateKey = toDateKey(selectedDate);
  const selectedEvents = events.filter((event) => event.date === selectedDateKey);

  const changeMonth = (direction: -1 | 1) => {
    setViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <Card className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.monthControls}>
          <button className={styles.roundBtn} type="button" aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)}>
            <Icon name="chevron" />
          </button>
          <div className={styles.month}>{getMonthTitle(viewDate)}</div>
          <button className={styles.roundBtn} type="button" aria-label="Следующий месяц" onClick={() => changeMonth(1)}>
            <Icon name="chevron" />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {weekdays.map((day) => (
          <div className={styles.dayName} key={day}>
            {day}
          </div>
        ))}
        {calendarDays.map((date) => (
          <button
            className={[
              styles.date,
              !date.isCurrentMonth ? styles.muted : '',
              date.hasEvent ? styles.hasEvent : '',
              date.isToday ? styles.today : '',
              date.isSelected ? styles.active : '',
            ].join(' ')}
            key={date.dateKey}
            type="button"
            aria-label={`${dayFormatter.format(date.date)}${date.hasEvent ? ', есть событие' : ''}`}
            onClick={() => selectDay(date.date)}
          >
            {date.day}
            {date.eventCount > 0 ? <span className={styles.eventDot} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>

      <div className={styles.selectedDay}>
        <div>
          <span>{dayFormatter.format(selectedDate)}</span>
          <strong>{selectedEvents.length > 0 ? selectedEvents[0].title : 'День для спокойной практики'}</strong>
        </div>
        {selectedEvents.length > 1 ? <small>+{selectedEvents.length - 1}</small> : null}
      </div>
    </Card>
  );
}
