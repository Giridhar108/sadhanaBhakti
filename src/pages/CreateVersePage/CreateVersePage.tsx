import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { VerseEditorValues } from '../../entities/verse';
import { useVerseStore } from '../../entities/verse';
import { VerseEditorForm } from '../../features/verse-editor/ui/VerseEditorForm/VerseEditorForm';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './CreateVersePage.module.css';

export default function CreateVersePage() {
  useDocumentTitle('Добавить стих — Садхана Бхакти');
  const navigate = useNavigate();
  const createVerse = useVerseStore((state) => state.createVerse);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const saveVerse = (values: VerseEditorValues) => {
    setIsSubmitting(true);
    setMessage('');
    createVerse(values)
      .then((verse) => {
        setMessage('Стих добавлен');
        window.setTimeout(() => navigate(`/verses/${verse.id}/learn`), 450);
      })
      .catch(() => setMessage('Не удалось сохранить стих. Попробуй ещё раз.'))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/verses">
        <Icon name="back" />
        Назад к стихам
      </Link>
      <header>
        <span>Общая коллекция</span>
        <h1>Добавить стих</h1>
        <p>Вставь текст стиха и перевод. После сохранения стих станет доступен всем пользователям.</p>
        <p className={styles.sourceHint}>
          Санскрит лучше копировать с{' '}
          <a href="https://vedabase.io/ru/" target="_blank" rel="noreferrer">
            Vedabase.io
          </a>
          .
        </p>
      </header>
      {message ? (
        <div className={styles.announcement} role="status" aria-live="polite">{message}</div>
      ) : null}
      <VerseEditorForm
        mode="create"
        onSubmit={saveVerse}
        onCancel={() => navigate('/verses')}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
