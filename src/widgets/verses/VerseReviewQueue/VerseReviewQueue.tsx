import {
  getTodayDateKey,
  getVerseProgress,
  type Verse,
  VerseReference,
  VerseStatusBadge,
} from '../../../entities/verse';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './VerseReviewQueue.module.css';

type VerseReviewQueueProps = {
  verses: Verse[];
  onStart: () => void;
};

const getDueLabel = (nextReviewAt: string | null) =>
  nextReviewAt && nextReviewAt < getTodayDateKey() ? 'Просрочено' : 'Сегодня';

export function VerseReviewQueue({ verses, onStart }: VerseReviewQueueProps) {
  return (
    <section className={styles.queue} aria-labelledby="verse-review-queue-title">
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.icon} aria-hidden="true">
            <Icon name="clock" />
          </span>
          <div>
            <span className={styles.eyebrow}>Повторение</span>
            <h2 id="verse-review-queue-title">Очередь на сегодня</h2>
            <p>Сначала просроченные стихи, затем назначенные на сегодня.</p>
          </div>
        </div>
        <div className={styles.actions}>
          <strong className={styles.count} aria-label={`Стихов в очереди: ${verses.length}`}>
            {verses.length}
          </strong>
          {verses.length > 0 ? (
            <button className={styles.startButton} type="button" onClick={onStart}>
              Повторить
              <Icon name="chevron" />
            </button>
          ) : null}
        </div>
      </header>

      {verses.length === 0 ? (
        <div className={styles.completed}>
          <span aria-hidden="true"><Icon name="lotus" /></span>
          <div>
            <strong>Сейчас повторений нет</strong>
            <p>Следующий стих появится здесь, когда наступит дата повторения.</p>
          </div>
        </div>
      ) : (
        <ol className={styles.list}>
          {verses.map((verse, index) => {
            const progress = getVerseProgress(verse);
            const isOverdue = Boolean(verse.nextReviewAt && verse.nextReviewAt < getTodayDateKey());

            return (
              <li key={verse.id}>
                <span className={styles.position} aria-hidden="true">{index + 1}</span>
                <div className={styles.details}>
                  <div className={styles.referenceRow}>
                    <VerseReference verse={verse} />
                    <span className={isOverdue ? styles.overdue : styles.today}>
                      {getDueLabel(verse.nextReviewAt)}
                    </span>
                  </div>
                  <div className={styles.meta}>
                    <VerseStatusBadge status={verse.status} />
                    <span>{progress}% изучено</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
