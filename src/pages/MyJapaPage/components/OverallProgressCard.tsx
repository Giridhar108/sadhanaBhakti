import { type CSSProperties } from 'react';
import {
  JAPA_MANTRA_GOAL,
  formatJapaDate,
  formatJapaNumber,
  formatJapaProgressPercent,
  formatJapaRoundsPhrase,
} from '../../../shared/lib/japaProgress';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './OverallProgressCard.module.css';

type TotalJapaProgress = {
  startDate: string | null;
  targetDate: string | null;
  dailyRounds: number;
  completedMantras: number;
  percent: number;
};

type OverallProgressCardProps = {
  totalJapaProgress: TotalJapaProgress;
  totalCompletedRounds: number;
  onOpenKaliModal: () => void;
};

export function OverallProgressCard({
  totalJapaProgress,
  totalCompletedRounds,
  onOpenKaliModal,
}: OverallProgressCardProps) {
  const totalJapaProgressStyle = {
    width: `${totalJapaProgress.percent}%`,
  } as CSSProperties;
  const progressForecast = totalJapaProgress.startDate && totalJapaProgress.targetDate
    ? `При чтении ${formatJapaRoundsPhrase(totalJapaProgress.dailyRounds)} в день цель будет достигнута ${formatJapaDate(totalJapaProgress.targetDate)}.`
    : 'Укажи дату начала ежедневной практики в настройках, чтобы увидеть прогресс.';

  return (
    <article className={`${styles.card} ${styles.overallCard}`}>
      <div className={styles.overallHeader}>
        <h2>Общий прогресс</h2>
        <strong>{formatJapaProgressPercent(totalJapaProgress.percent)}</strong>
      </div>
      <div className={styles.overallTrack}>
        <span style={totalJapaProgressStyle} />
      </div>
      <div className={styles.overallInfoDesktop}>
        <div className={styles.overallMetrics}>
          <div>
            <strong>{formatJapaNumber(totalCompletedRounds)}</strong>
            <span>кругов всего</span>
          </div>
          <div>
            <strong>{formatJapaNumber(totalJapaProgress.completedMantras)}</strong>
            <span>повторено мантр</span>
          </div>
        </div>
        <small>{progressForecast}</small>
        <div className={styles.goalStatus}>
          Цель 35 млн мантр
          <Icon name="target" />
        </div>
        <button className={styles.linkButton} type="button" onClick={onOpenKaliModal}>
          Кали-Сантарана-упанишада
        </button>
      </div>
      <div className={styles.overallInfoMobile}>
        <div className={styles.overallStats}>
          <p>
            <span>Пройдено</span>
            <strong>{formatJapaNumber(totalJapaProgress.completedMantras)}</strong>
            <small>{formatJapaNumber(totalCompletedRounds)} кругов</small>
          </p>
          <p>
            <span>Цель</span>
            <strong>{formatJapaNumber(JAPA_MANTRA_GOAL)}</strong>
            <small>мантр</small>
          </p>
        </div>
        <small className={styles.progressForecast}>{progressForecast}</small>
        <button className={styles.linkButton} type="button" onClick={onOpenKaliModal}>
          Кали-Сантарана-упанишада
        </button>
      </div>
    </article>
  );
}
