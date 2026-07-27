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
};

export function VerseCard({ verse, onToggleFavorite }: VerseCardProps) {
  const lines = getVerseLines(verse.sanskritCyrillic);
  const progress = getVerseProgress(verse);

  return (
    <article className={styles.card}>
      <header>
        <VerseReference verse={verse} linked />
        <button
          className={`${styles.favorite} ${verse.isFavorite ? styles.favoriteActive : ''}`}
          type="button"
          aria-label={verse.isFavorite ? 'Убрать стих из избранного' : 'Добавить стих в избранное'}
          aria-pressed={verse.isFavorite}
          onClick={() => onToggleFavorite(verse.id)}
        >
          {verse.isFavorite ? '♥' : '♡'}
        </button>
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
