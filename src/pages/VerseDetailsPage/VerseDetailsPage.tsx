import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getReviewDateLabel,
  getVerseById,
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
  const userVerseIds = useVerseStore((state) => state.userVerseIds);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const startLearningSession = useVerseStore((state) => state.startLearningSession);
  const verse = getVerseById(verses, verseId);
  const isAdded = Boolean(verseId && userVerseIds.includes(verseId));

  useDocumentTitle(
    verse
      ? `${verse.sourceTitle} ${verse.reference} — Садхана Бхакти`
      : 'Стих не найден — Садхана Бхакти',
  );

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

  const startLearning = () => {
    startLearningSession(verse.id);
    navigate(`/verses/${verse.id}/learn`);
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/verses">
        <span aria-hidden="true">←</span>
        Все стихи
      </Link>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <VerseReference verse={verse} />
          <h1>{verse.sourceTitle} {verse.reference}</h1>
          {verse.chapterTitle ? <p>{verse.chapterTitle}</p> : null}
          <div className={styles.meta}>
            <VerseStatusBadge status={verse.status} />
            <span>{verse.progress}% изучено</span>
            <span>Повторение: {getReviewDateLabel(verse.nextReviewAt)}</span>
          </div>
        </div>
        <div className={styles.heroActions}>
          <button
            className={`${styles.favoriteButton} ${verse.isFavorite ? styles.favoriteActive : ''}`}
            type="button"
            aria-pressed={verse.isFavorite}
            onClick={() => toggleVerseFavorite(verse.id)}
          >
            <span aria-hidden="true">{verse.isFavorite ? '♥' : '♡'}</span>
            {verse.isFavorite ? 'В избранном' : 'В избранное'}
          </button>
          <button className={styles.primaryButton} type="button" onClick={startLearning}>
            <Icon name="lotus" />
            {isAdded ? 'Начать изучение' : 'Добавить и начать'}
          </button>
        </div>
      </header>

      <Card className={styles.verseCard}>
        <VerseLines
          title="Санскрит русскими буквами"
          lines={verse.sanskritCyrillicLines}
          variant="sanskrit"
        />
        <VerseLines
          title="Перевод"
          lines={verse.translationLines}
          fallback={verse.fullTranslation}
          variant="translation"
        />
      </Card>

      <section className={styles.progressSection}>
        <div>
          <span>Текущий прогресс</span>
          <strong>{verse.progress}%</strong>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label={`Прогресс изучения: ${verse.progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={verse.progress}
        >
          <span style={{ width: `${verse.progress}%` }} />
        </div>
      </section>
    </section>
  );
}
