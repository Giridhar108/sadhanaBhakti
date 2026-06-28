import { useProgressSummary } from '../../entities/progress/model/useProgressSummary';
import { formatPercent } from '../../shared/lib/formatPercent';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

export default function StatisticsPage() {
  useDocumentTitle('Прогресс - Путь практики');
  const { data } = useProgressSummary();
  const summary = data ?? { japaPercent: 75, booksPercent: 60, versesPercent: 50, streakDays: 25 };

  return (
    <ModulePage
      eyebrow="Аналитика"
      title="Прогресс практики"
      description="Будущий экран статистики: сначала данные берутся из API-слоя, при отсутствии backend используется мягкий fallback."
      metrics={[
        { label: 'джапа', value: formatPercent(summary.japaPercent), tone: 'green' },
        { label: 'чтение', value: formatPercent(summary.booksPercent), tone: 'violet' },
        { label: 'серия', value: `${summary.streakDays}`, tone: 'gold' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>Масштабирование</h3>
          <p>TanStack Query уже готов к кэшу, повторным запросам и инвалидации данных.</p>
        </article>
      }
    >
      <article className={panelStyles.panel}>
        <h2>Сводка</h2>
        <div className={panelStyles.stack}>
          <div className={panelStyles.row}>
            <strong>Джапа</strong>
            <small>{formatPercent(summary.japaPercent)}</small>
          </div>
          <div className={panelStyles.row}>
            <strong>Чтение книг</strong>
            <small>{formatPercent(summary.booksPercent)}</small>
          </div>
          <div className={panelStyles.row}>
            <strong>Изучение стихов</strong>
            <small>{formatPercent(summary.versesPercent)}</small>
          </div>
        </div>
      </article>
    </ModulePage>
  );
}
