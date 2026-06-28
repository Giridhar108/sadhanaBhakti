import { DailyGoalField } from '../../features/change-daily-goal/ui/DailyGoalField';
import { StartJapaSessionButton } from '../../features/start-japa-session/ui/StartJapaSessionButton';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

export default function MyJapaPage() {
  useDocumentTitle('Джапа - Путь практики');

  return (
    <ModulePage
      eyebrow="Практика"
      title="Моя джапа"
      description="Спокойный экран для начала сессии, изменения дневной цели и просмотра последних кругов."
      metrics={[
        { label: 'кругов сегодня', value: '12', tone: 'green' },
        { label: 'цель на день', value: '16', tone: 'violet' },
        { label: 'серия дней', value: '25', tone: 'gold' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>Текущая сессия</h3>
          <p>Состояние сессии хранится локально через Zustand. Позже сюда подключится API `/japa/sessions`.</p>
        </article>
      }
    >
      <article className={panelStyles.panel}>
        <h2>Быстрый старт</h2>
        <div className={panelStyles.stack}>
          <DailyGoalField />
          <StartJapaSessionButton />
        </div>
      </article>
      <article className={panelStyles.panel}>
        <h2>Последние записи</h2>
        <div className={panelStyles.stack}>
          {['Утро - 8 кругов', 'День - 4 круга', 'Вчера - 16 кругов'].map((item) => (
            <div className={panelStyles.row} key={item}>
              <div>
                <strong>{item}</strong>
                <small>мягкий ритм без перегруза</small>
              </div>
              <small>сохранено</small>
            </div>
          ))}
        </div>
      </article>
    </ModulePage>
  );
}
