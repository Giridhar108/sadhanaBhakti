import { Link } from 'react-router-dom';
import {
  getReviewDateLabel,
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
          {verse.sanskritCyrillicLines.slice(0, 2).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <VerseStatusBadge status={verse.status} />
        <div className={styles.progressMeta}>
          <strong>{verse.progress}%</strong>
          <span>Следующее повторение: {getReviewDateLabel(verse.nextReviewAt)}</span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`Прогресс стиха ${verse.sourceTitle} ${verse.reference}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={verse.progress}
        >
          <span style={{ width: `${verse.progress}%` }} />
        </div>
      </Link>
    </article>
  );
}
