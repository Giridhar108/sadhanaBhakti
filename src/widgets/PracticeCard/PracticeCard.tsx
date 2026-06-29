import { ProgressRing, type ProgressRingTone } from '../../shared/ui/ProgressRing/ProgressRing';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import styles from './PracticeCard.module.css';

export type PracticeCardData = {
  title: string;
  icon: IconName;
  tone: ProgressRingTone;
  current: string;
  ringLabel: string;
  goalLabel: string;
  goalValue: string;
  progress: number;
  stats: Array<{
    label: string;
    value: string;
    suffix?: string;
  }>;
  actionLabel: string;
};

type PracticeCardProps = {
  card: PracticeCardData;
};

export function PracticeCard({ card }: PracticeCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div className={`${styles.title} ${styles[card.tone]}`}>
          <Icon name={card.icon} />
          <span>{card.title}</span>
        </div>
        <button className={styles.more} type="button" aria-label="Больше действий">
          <Icon name="more" />
        </button>
      </div>

      <div className={styles.body}>
        <ProgressRing value={card.progress} current={card.current} label={card.ringLabel} tone={card.tone} />
        <div className={styles.progressInfo}>
          <div className={styles.metricTitle}>{card.goalLabel}<strong>{card.goalValue}</strong></div>
          <div className={styles.progressLine}>
            <div className={`${styles.miniBar} ${styles[card.tone]}`}><i style={{ width: `${card.progress}%` }} /></div>
            <div className={styles.percent}>{card.progress}%</div>
          </div>
        </div>
      </div>

      <div className={styles.statsRow}>
        {card.stats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}{stat.suffix ? <em>{stat.suffix}</em> : null}</strong>
          </div>
        ))}
      </div>

      <button className={`${styles.cta} ${styles[card.tone]}`} type="button">{card.actionLabel}</button>
    </article>
  );
}
