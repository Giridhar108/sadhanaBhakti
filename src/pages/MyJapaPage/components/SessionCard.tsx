import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './SessionCard.module.css';

type SessionCardProps = {
  sessionTime: string;
  actionIcon: string;
  actionLabel: string;
  isSessionRunning: boolean;
  onSessionToggle: () => void;
  onSessionStop: () => void;
};

export function SessionCard({
  sessionTime,
  actionIcon,
  actionLabel,
  isSessionRunning,
  onSessionToggle,
  onSessionStop,
}: SessionCardProps) {
  return (
    <article className={`${styles.card} ${styles.sessionCard}`}>
      <div className={styles.cardHeader}>
        <h2>Текущая сессия</h2>
        <Icon className={styles.headerIcon} name="clock" />
      </div>
      <div className={styles.timer}>{sessionTime}</div>
      <p className={styles.timerCaption}>Время с начала сессии</p>
      <div className={styles.sessionActions}>
        <button className={styles.pauseButton} type="button" onClick={onSessionToggle} aria-pressed={!isSessionRunning}>
          <span>{actionIcon}</span>
          {actionLabel}
        </button>
        <button className={styles.stopButton} type="button" onClick={onSessionStop}>
          <span />
          Завершить
        </button>
      </div>
    </article>
  );
}
