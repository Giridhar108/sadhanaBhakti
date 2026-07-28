import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  value: number;
  ariaLabel: string;
  className?: string;
};

export function ProgressBar({ value, ariaLabel, className }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`${styles.track} ${className ?? ''}`}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <span style={{ width: `${normalizedValue}%` }} />
    </div>
  );
}
