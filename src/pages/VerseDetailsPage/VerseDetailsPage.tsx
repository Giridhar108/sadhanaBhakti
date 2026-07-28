import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getReviewDateLabel,
  getVerseById,
  getVerseLines,
  getVerseProgress,
  useVerseStore,
  VerseReference,
  VerseStatusBadge,
} from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import { VerseLines } from '../../widgets/verses/VerseLines/VerseLines';
import styles from './VerseDetailsPage.module.css';

type ActionIconName = 'favorite' | 'edit' | 'delete';

function ActionIcon({ name, filled = false }: { name: ActionIconName; filled?: boolean }) {
  if (name === 'favorite') {
    return (
      <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    );
  }

  if (name === 'edit') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function VerseDetailsPage() {
  const { verseId } = useParams();
  const navigate = useNavigate();
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const startLearningSession = useVerseStore((state) => state.startLearningSession);
  const deleteVerse = useVerseStore((state) => state.deleteVerse);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const verse = getVerseById(verses, verseId);

  useDocumentTitle(verse ? `${verse.bookTitle} ${verse.verseNumber} — Садхана Бхакти` : 'Стих не найден');

  useEffect(() => {
    if (verses.length === 0) loadVerses();
  }, [loadVerses, verses.length]);

  if (!verse && isLoading) return <Card className={styles.notFound}>Загружаем стих…</Card>;
  if (!verse) {
    return (
      <Card className={styles.notFound}>
        <Icon name="scroll" />
        <h1>Стих не найден</h1>
        <p>Возможно, он был удалён или ссылка устарела.</p>
        <Link to="/verses">Вернуться к стихам</Link>
      </Card>
    );
  }

  const progress = getVerseProgress(verse);
  const backLink = verse.catalog === 'bhakti-shastri'
    ? { to: '/verses/bhakti-shastri', label: 'Каталог Бхакти-шастры' }
    : { to: '/verses', label: 'Все стихи' };
  const startLearning = () => {
    startLearningSession(verse.id);
    navigate(`/verses/${verse.id}/learn`);
  };
  const confirmDelete = () => {
    setIsDeleting(true);
    deleteVerse(verse.id)
      .then(() => navigate('/verses'))
      .finally(() => setIsDeleting(false));
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to={backLink.to}>
        <Icon name="back" />
        {backLink.label}
      </Link>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <VerseReference verse={verse} />
          <h1>{verse.bookTitle}</h1>
          <p>{verse.chapter ? `Глава ${verse.chapter} · ` : ''}Стих {verse.verseNumber}</p>
          <div className={styles.meta}>
            <VerseStatusBadge status={verse.status} />
            <span>{progress}% изучено</span>
            <span>Повторение: {getReviewDateLabel(verse.nextReviewAt)}</span>
          </div>
        </div>
        <div className={styles.heroActions}>
          <div className={styles.secondaryActions}>
            <button
              className={styles.favoriteButton}
              type="button"
              aria-pressed={verse.isFavorite}
              aria-label={verse.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              title={verse.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
              onClick={() => toggleVerseFavorite(verse.id)}
            >
              <ActionIcon name="favorite" filled={verse.isFavorite} />
            </button>
            {verse.isOwner ? (
              <>
                <Link
                  className={styles.editButton}
                  to={`/verses/${verse.id}/edit`}
                  aria-label="Редактировать стих"
                  title="Редактировать стих"
                >
                  <ActionIcon name="edit" />
                </Link>
                <button
                  className={styles.deleteButton}
                  type="button"
                  aria-label="Удалить стих"
                  title="Удалить стих"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <ActionIcon name="delete" />
                </button>
              </>
            ) : null}
          </div>
          <button className={styles.primaryButton} type="button" onClick={startLearning}>
            <Icon name="lotus" />Начать изучение
          </button>
        </div>
      </header>

      <Card className={styles.verseCard}>
        <VerseLines title="Санскрит русскими буквами" lines={getVerseLines(verse.sanskritCyrillic)} variant="sanskrit" />
        <VerseLines title="Перевод" lines={getVerseLines(verse.translation)} variant="translation" />
      </Card>

      <section className={styles.progressSection}>
        <div><span>Текущий прогресс</span><strong>{progress}%</strong></div>
        <div className={styles.progressTrack} role="progressbar" aria-label={`Прогресс изучения: ${progress}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      {showDeleteDialog ? (
        <div className={styles.dialogBackdrop}>
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Удалить стих?</h2>
            <p>Стих станет недоступен всем пользователям, а их прогресс изучения будет удалён. Это действие нельзя отменить.</p>
            <div>
              <button type="button" onClick={() => setShowDeleteDialog(false)}>Отмена</button>
              <button className={styles.confirmDelete} type="button" disabled={isDeleting} onClick={confirmDelete}>
                {isDeleting ? 'Удаляем…' : 'Удалить'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
