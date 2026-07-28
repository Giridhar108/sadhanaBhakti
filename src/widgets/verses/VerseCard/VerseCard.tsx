import { Link } from 'react-router-dom';
import {
  getReviewDateLabel,
  getVerseLines,
  getVerseProgress,
  type Verse,
  VerseReference,
  VerseStatusBadge,
} from '../../../entities/verse';
import styles from './VerseCard.module.css';

type VerseCardProps = {
  verse: Verse;
  onToggleFavorite: (verseId: string) => void;
  onRemoveFromLearning?: (verse: Verse) => void;
};

export function VerseCard({ verse, onToggleFavorite, onRemoveFromLearning }: VerseCardProps) {
  const lines = getVerseLines(verse.sanskritCyrillic);
  const progress = getVerseProgress(verse);
  const canRemoveFromLearning = verse.catalog === 'bhakti-shastri'
    && verse.status !== 'new'
    && onRemoveFromLearning;

  return (
    <article className={styles.card}>
      <header>
        <div className={styles.reference}>
          <VerseReference verse={verse} linked />
          {verse.catalog === 'bhakti-shastri' ? <span>Каталог Бхакти-шастры</span> : null}
        </div>
        <div className={styles.actions}>
          {canRemoveFromLearning ? (
            <button
              className={styles.remove}
              type="button"
              aria-label="Убрать стих из изучаемых"
              title="Убрать из изучаемых"
              onClick={() => onRemoveFromLearning(verse)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 15H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          ) : null}
          <button
            className={`${styles.favorite} ${verse.isFavorite ? styles.favoriteActive : ''}`}
            type="button"
            aria-label={verse.isFavorite ? 'Убрать стих из избранного' : 'Добавить стих в избранное'}
            aria-pressed={verse.isFavorite}
            onClick={() => onToggleFavorite(verse.id)}
          >
            {verse.isFavorite ? '♥' : '♡'}
          </button>
        </div>
      </header>

      <Link className={styles.bodyLink} to={`/verses/${verse.id}`}>
        <p className={styles.sanskrit}>
          {lines.slice(0, 2).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <VerseStatusBadge status={verse.status} />
        <div className={styles.progressMeta}>
          <strong>{progress}%</strong>
          <span>Следующее повторение: {getReviewDateLabel(verse.nextReviewAt)}</span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`Прогресс стиха ${verse.bookTitle} ${verse.verseNumber}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </Link>
    </article>
  );
}
