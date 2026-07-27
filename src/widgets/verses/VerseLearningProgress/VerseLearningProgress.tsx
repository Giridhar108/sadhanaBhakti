import type { VerseLearningStep } from '../../../entities/verse';
import styles from './VerseLearningProgress.module.css';

type VerseLearningProgressProps = {
  step: VerseLearningStep;
  memorizationPercent: number;
};

export function VerseLearningProgress({
  step,
  memorizationPercent,
}: VerseLearningProgressProps) {
  const value = step === 'intro'
    ? 15
    : step === 'complete'
      ? 100
      : 20 + Math.round(memorizationPercent * 0.75);

  return (
    <div className={styles.progress}>
      <div>
        <span>{step === 'intro' ? 'Знакомство' : step === 'memorization' ? 'Запоминание' : 'Завершение'}</span>
        <strong>{value}%</strong>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={`Прогресс учебной сессии: ${value}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
