import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

const verses = [
  { source: 'Бхагавад-гита 2.47', progress: '60%', note: 'повторить перевод и смысл' },
  { source: 'Шримад-Бхагаватам 1.2.6', progress: '40%', note: 'закрепить санскрит' },
  { source: 'Шримад-Бхагаватам 11.29.34', progress: '75%', note: 'почти готово к проверке' },
];

export default function VersesPage() {
  useDocumentTitle('Стихи - Садхана Бхакти');

  return (
    <ModulePage
      eyebrow="Запоминание"
      title="Стихи"
      description="Отдельный экран для повторения, прогресса запоминания и будущей проверки стихов."
      metrics={[
        { label: 'в работе', value: '3', tone: 'violet' },
        { label: 'средний прогресс', value: '58%', tone: 'green' },
        { label: 'готово', value: '1', tone: 'gold' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>Entity: verse</h3>
          <p>Тип `Verse` уже вынесен отдельно, чтобы позже подключить API и интервальные повторения.</p>
        </article>
      }
    >
      <article className={panelStyles.panel}>
        <h2>Повторение</h2>
        <div className={panelStyles.stack}>
          {verses.map((verse) => (
            <div className={panelStyles.row} key={verse.source}>
              <div>
                <strong>{verse.source}</strong>
                <small>{verse.note}</small>
              </div>
              <small>{verse.progress}</small>
            </div>
          ))}
        </div>
      </article>
    </ModulePage>
  );
}
