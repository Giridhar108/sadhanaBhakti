import { useEffect, useState } from 'react';
import { CalendarCard } from '../../widgets/CalendarCard/CalendarCard';
import { RemindersCard } from '../../widgets/RemindersCard/RemindersCard';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import {
  calendarEventsChanged,
  readCalendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from '../../shared/lib/calendarEvents';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

const eventTypeLabels: Record<CalendarEventType, string> = {
  japa: 'Джапа',
  reading: 'Чтение',
  verse: 'Стихи',
  meeting: 'Встреча',
  other: 'Другое',
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

function formatEventDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return dateFormatter.format(new Date(year, month - 1, day));
}

export default function CalendarPage() {
  useDocumentTitle('Календарь - Садхана Бхакти');
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

  return (
    <ModulePage
      eyebrow="Ритм"
      title="Календарь практики"
      description="Отдельный экран для дневного ритма, напоминаний и событий практики."
      metrics={[
        { label: 'дней серии', value: '25', tone: 'gold' },
        { label: 'практик сегодня', value: '3', tone: 'green' },
        { label: 'события', value: String(events.length), tone: 'violet' },
      ]}
      aside={<RemindersCard />}
    >
      <CalendarCard />
      <article className={panelStyles.panel}>
        <h2>События</h2>
        <div className={panelStyles.stack}>
          {events.length > 0 ? (
            events.map((event) => (
              <div className={panelStyles.row} key={event.id}>
                <div>
                  <strong>{formatEventDate(event.date)}</strong>
                  <small>{event.title}</small>
                </div>
                <small>{eventTypeLabels[event.type]}</small>
              </div>
            ))
          ) : (
            <p className={panelStyles.hint}>Событий пока нет. Их можно добавить в настройках.</p>
          )}
        </div>
      </article>
    </ModulePage>
  );
}
