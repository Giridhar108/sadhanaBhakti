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
      <Link className={styles.backLink} to="/verses">← Все стихи</Link>
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
          <button
            className={styles.favoriteButton}
            type="button"
            aria-pressed={verse.isFavorite}
            onClick={() => toggleVerseFavorite(verse.id)}
          >
            {verse.isFavorite ? '♥ В избранном' : '♡ В избранное'}
          </button>
          <button className={styles.primaryButton} type="button" onClick={startLearning}>
            <Icon name="lotus" />Начать изучение
          </button>
          <Link className={styles.editButton} to={`/verses/${verse.id}/edit`}>Редактировать</Link>
          <button className={styles.deleteButton} type="button" onClick={() => setShowDeleteDialog(true)}>
            Удалить стих
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
            <p>Стих и весь прогресс его изучения будут удалены. Это действие нельзя отменить.</p>
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
