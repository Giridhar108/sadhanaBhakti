import {
  formatPrayerReviewDate,
  prayerCategoryLabels,
  type Prayer,
  type PrayerProgress,
} from '../../index';
import { Card } from '../../../../shared/ui/Card/Card';
import { Icon } from '../../../../shared/ui/Icon/Icon';
import { ProgressBar } from '../../../../shared/ui/ProgressBar/ProgressBar';
import styles from './PrayerCard.module.css';

type PrayerCardProps = {
  prayer: Prayer;
  progress?: PrayerProgress;
  onOpen: (prayerId: string) => void;
  onRead: (prayerId: string) => void;
};

const getStatus = (prayer: Prayer, progress: PrayerProgress | undefined) => {
  if (!prayer.isAvailable) return 'Скоро появится';
  if (progress?.learnedVerses === prayer.totalVerses) return 'Изучено';
  if (progress?.startedVerses) return 'Изучается';
  return 'Не начато';
};

const getActionLabel = (prayer: Prayer, progress: PrayerProgress | undefined) => {
  if (!prayer.isAvailable) return 'Скоро появится';
  if (progress?.learnedVerses === prayer.totalVerses) return 'Повторить молитву';
  if (progress?.startedVerses) return 'Продолжить изучение';
  return 'Начать изучение';
};

export function PrayerCard({ prayer, progress, onOpen, onRead }: PrayerCardProps) {
  const status = getStatus(prayer, progress);
  const learnedVerses = progress?.learnedVerses ?? 0;
  const progressPercent = progress?.progressPercent ?? 0;
  const reviewDate = formatPrayerReviewDate(progress?.lastReviewedAt);

  return (
    <Card className={`${styles.card} ${!prayer.isAvailable ? styles.unavailable : ''}`}>
      <div className={styles.ornament} aria-hidden="true">
        <Icon name={prayer.category === 'kirtan' ? 'music' : 'lotus'} />
      </div>
      <div className={styles.topline}>
        <span className={styles.category}>{prayerCategoryLabels[prayer.category]}</span>
        <span className={styles.status}>{status}</span>
      </div>
      <h2>{prayer.title}</h2>
      <button
        className={styles.opening}
        type="button"
        disabled={!prayer.isAvailable}
        aria-label={`Открыть полный текст молитвы «${prayer.title}»`}
        onClick={() => onRead(prayer.slug)}
      >
        «{prayer.openingWords}…»
      </button>
      <p className={styles.meta}>{prayer.totalVerses} строф</p>
      <div className={styles.progressCopy}>
        <span>{learnedVerses} из {prayer.totalVerses} строф</span>
        <strong>{progressPercent}%</strong>
      </div>
      <ProgressBar
        value={progressPercent}
        ariaLabel={`Прогресс молитвы «${prayer.title}»: ${progressPercent}%`}
      />
      {reviewDate ? <p className={styles.reviewDate}>Последнее повторение: {reviewDate}</p> : null}
      <div className={styles.actions}>
        <button
          className={styles.primaryAction}
          type="button"
          disabled={!prayer.isAvailable}
          onClick={() => onOpen(prayer.slug)}
        >
          {getActionLabel(prayer, progress)}
          {prayer.isAvailable ? <Icon name="chevron" /> : null}
        </button>
      </div>
    </Card>
  );
}
