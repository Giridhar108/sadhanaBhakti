import { CalendarCard } from '../../widgets/CalendarCard/CalendarCard';
import { RemindersCard } from '../../widgets/RemindersCard/RemindersCard';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

const days = [
  { label: '13 мая', detail: 'джапа, чтение, стихи', status: 'завершено' },
  { label: '14 мая', detail: 'джапа и чтение', status: 'мягкий день' },
  { label: '15 мая', detail: 'повторение стихов', status: 'в процессе' },
];

export default function CalendarPage() {
  useDocumentTitle('Календарь - Путь практики');

  return (
    <ModulePage
      eyebrow="Ритм"
      title="Календарь практики"
      description="Отдельный экран для дневного ритма, напоминаний и будущего API `/progress/calendar`."
      metrics={[
        { label: 'дней серии', value: '25', tone: 'gold' },
        { label: 'практик сегодня', value: '3', tone: 'green' },
        { label: 'напоминания', value: '2', tone: 'violet' },
      ]}
      aside={<RemindersCard />}
    >
      <CalendarCard />
      <article className={panelStyles.panel}>
        <h2>Ближайшие дни</h2>
        <div className={panelStyles.stack}>
          {days.map((day) => (
            <div className={panelStyles.row} key={day.label}>
              <div>
                <strong>{day.label}</strong>
                <small>{day.detail}</small>
              </div>
              <small>{day.status}</small>
            </div>
          ))}
        </div>
      </article>
    </ModulePage>
  );
}
