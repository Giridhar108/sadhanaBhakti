import styles from './ProgressRing.module.css';

export type ProgressRingTone = 'green' | 'purple' | 'gold';

type ProgressRingProps = {
  value: number;
  current: string;
  label: string;
  tone: ProgressRingTone;
};

const CIRCUMFERENCE = 264;

export function ProgressRing({ value, current, label, tone }: ProgressRingProps) {
  const safeValue = Math.max(0, Math.min(value, 100));
  const dash = (safeValue / 100) * CIRCUMFERENCE;

  return (
    <div className={`${styles.ring} ${styles[tone]}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.bg} cx="50" cy="50" r="42" />
        <circle className={styles.value} cx="50" cy="50" r="42" style={{ strokeDasharray: `${dash} ${CIRCUMFERENCE}` }} />
      </svg>
      <div className={styles.text}>
        <span>
          <strong>{current}</strong>
          <small>{label}</small>
        </span>
      </div>
    </div>
  );
}
