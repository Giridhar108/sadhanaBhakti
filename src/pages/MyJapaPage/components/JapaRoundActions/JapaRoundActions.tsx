import styles from './JapaRoundActions.module.css';

type JapaRoundActionsProps = {
  onAddRounds: (rounds: number) => void;
  onAddDailyGoal: () => void;
};

export function JapaRoundActions({ onAddRounds, onAddDailyGoal }: JapaRoundActionsProps) {
  return (
    <div className={styles.actions}>
      <div className={styles.quickActions}>
        <button className={styles.primaryButton} type="button" onClick={() => onAddRounds(1)}>
          +1 круг
        </button>
        <button className={styles.primaryButton} type="button" onClick={() => onAddRounds(4)}>
          +4 круга
        </button>
      </div>
      <button className={styles.secondaryButton} type="button" onClick={onAddDailyGoal}>
        Добавить 16 кругов
      </button>
    </div>
  );
}
