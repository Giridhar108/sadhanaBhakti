import styles from '../../../pages/ModulePage/modulePanels.module.css';

type DailyGoalFieldProps = {
  defaultValue?: number;
};

export function DailyGoalField({ defaultValue = 16 }: DailyGoalFieldProps) {
  return (
    <label className={styles.field}>
      <span>Цель кругов на день</span>
      <input min={1} max={64} type="number" defaultValue={defaultValue} />
    </label>
  );
}
