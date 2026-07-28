import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getVerseById, type VerseEditorValues, useVerseStore } from '../../entities/verse';
import { VerseEditorForm } from '../../features/verse-editor/ui/VerseEditorForm/VerseEditorForm';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './EditVersePage.module.css';

export default function EditVersePage() {
  const { verseId } = useParams();
  const navigate = useNavigate();
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const updateVerse = useVerseStore((state) => state.updateVerse);
  const verse = getVerseById(verses, verseId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const initialValues = useMemo<VerseEditorValues | undefined>(() => verse ? ({
    bookTitle: verse.bookTitle,
    chapter: verse.chapter ?? '',
    verseNumber: verse.verseNumber,
    sanskritCyrillic: verse.sanskritCyrillic,
    translation: verse.translation,
  }) : undefined, [verse]);

  useDocumentTitle(verse ? `Редактировать ${verse.bookTitle} — Садхана Бхакти` : 'Редактировать стих');

  useEffect(() => {
    if (verses.length === 0) loadVerses();
  }, [loadVerses, verses.length]);

  if (!verse && isLoading) return <Card className={styles.state}>Загружаем стих…</Card>;
  if (!verse) {
    return (
      <Card className={styles.state}>
        <h1>Стих не найден</h1>
        <Link to="/verses">Вернуться к стихам</Link>
      </Card>
    );
  }

  if (!verse.isOwner) {
    return (
      <Card className={styles.state}>
        <h1>Редактирование недоступно</h1>
        <p>Изменять общий стих может только пользователь, который его добавил.</p>
        <Link to={`/verses/${verse.id}`}>Вернуться к стиху</Link>
      </Card>
    );
  }

  const saveVerse = (values: VerseEditorValues) => {
    setIsSubmitting(true);
    setMessage('');
    updateVerse(verse.id, values)
      .then(() => {
        setMessage('Изменения сохранены');
        window.setTimeout(() => navigate(`/verses/${verse.id}`), 450);
      })
      .catch(() => setMessage('Не удалось сохранить изменения.'))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to={`/verses/${verse.id}`}>
        <Icon name="back" />
        Назад к стиху
      </Link>
      <header>
        <span>Общая коллекция</span>
        <h1>Редактировать стих</h1>
        <p>Учебный прогресс сохранится после изменения текста.</p>
      </header>
      {message ? (
        <div className={styles.announcement} role="status" aria-live="polite">{message}</div>
      ) : null}
      <VerseEditorForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={saveVerse}
        onCancel={() => navigate(`/verses/${verse.id}`)}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
