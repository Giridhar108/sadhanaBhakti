import type { Verse } from '../../../entities/verse';
import { Card } from '../../../shared/ui/Card/Card';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './TodayVersesCard.module.css';

type TodayVersesCardProps = {
  verses: Verse[];
  onStart: () => void;
  onAdd: () => void;
  onReviewLearned: () => void;
};

export function TodayVersesCard({
  verses,
  onStart,
  onAdd,
  onReviewLearned,
}: TodayVersesCardProps) {
  if (verses.length === 0) {
    return (
      <Card className={styles.emptyCard}>
        <div className={styles.lotus} aria-hidden="true">
          <Icon name="lotus" />
        </div>
        <span>Всё повторено</span>
        <h2>На сегодня больше нет обязательных повторений</h2>
        <p>Можно добавить новый стих или спокойно вернуться к уже изученным.</p>
        <div className={styles.actions}>
          <button className={styles.primaryButton} type="button" onClick={onAdd}>
            Добавить стих
          </button>
          <button className={styles.secondaryButton} type="button" onClick={onReviewLearned}>
            Повторить изученные
          </button>
        </div>
      </Card>
    );
  }

  const newCount = verses.filter((verse) => verse.progress === 0).length;
  const reviewCount = verses.filter((verse) => verse.progress > 0).length;
  const almostLearnedCount = verses.filter((verse) => verse.progress >= 70).length;
  const estimatedMinutes = Math.max(2, Math.ceil(verses.length * 1.5));

  return (
    <Card className={styles.card}>
      <div className={styles.copy}>
        <span>Повторение на сегодня</span>
        <h2>{verses.length} {verses.length === 1 ? 'стих' : verses.length < 5 ? 'стиха' : 'стихов'}</h2>
        <p>Около {estimatedMinutes} минут в спокойном темпе</p>
        <button className={styles.primaryButton} type="button" onClick={onStart}>
          <Icon name="lotus" />
          Начать повторение
        </button>
      </div>

      <div className={styles.summary} aria-label="Состав повторения">
        <div>
          <strong>{newCount}</strong>
          <span>новых</span>
        </div>
        <div>
          <strong>{reviewCount}</strong>
          <span>повторения</span>
        </div>
        <div>
          <strong>{almostLearnedCount}</strong>
          <span>почти выучен</span>
        </div>
      </div>
    </Card>
  );
}
