import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

const books = [
  { title: 'Бхагавад-гита', detail: '94 страницы на этой неделе', progress: '60%' },
  { title: 'Шримад-Бхагаватам', detail: '12 стихов в повторении', progress: '40%' },
  { title: 'Нектар наставлений', detail: 'следующая цель чтения', progress: '25%' },
];

export default function BooksPage() {
  useDocumentTitle('Книги и стихи - Садхана Бхакти');

  return (
    <ModulePage
      eyebrow="Изучение"
      title="Книги и стихи"
      description="Модуль для чтения, повторения стихов и будущей синхронизации прогресса с сервером."
      metrics={[
        { label: 'страниц сегодня', value: '18', tone: 'violet' },
        { label: 'стихов учишь', value: '3', tone: 'gold' },
        { label: 'готовность', value: '60%', tone: 'green' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>API-модуль</h3>
          <p>Для чтения будут отдельные сущности `book-reading` и `verse`, как описано в архитектуре.</p>
        </article>
      }
    >
      <article className={panelStyles.panel}>
        <h2>План изучения</h2>
        <div className={panelStyles.stack}>
          {books.map((book) => (
            <div className={panelStyles.row} key={book.title}>
              <div>
                <strong>{book.title}</strong>
                <small>{book.detail}</small>
              </div>
              <small>{book.progress}</small>
            </div>
          ))}
        </div>
      </article>
    </ModulePage>
  );
}
