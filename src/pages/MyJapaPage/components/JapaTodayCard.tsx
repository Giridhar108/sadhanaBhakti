import { defaultGoals } from '../../../entities/user/model/auth';
import { JapaProgressRing } from './JapaProgressRing/JapaProgressRing';
import { JapaRoundActions } from './JapaRoundActions/JapaRoundActions';
import styles from './JapaTodayCard.module.css';

type JapaTodayCardProps = {
  completedRounds: number;
  dailyJapaGoal: number;
  dailyJapaGoalInput: string;
  onAddRounds: (rounds: number) => void;
  onAddDailyGoal: () => void;
  onCompletedRoundsChange: (rounds: number) => void;
  onDailyGoalChange: (value: string) => void;
  onDailyGoalBlur: () => void;
};

const milestoneGroups = Array.from({ length: 3 }, (_, groupIndex) =>
  Array.from({ length: 4 }, (_, barIndex) => groupIndex * 4 + barIndex + 1),
);

export function JapaTodayCard({
  completedRounds,
  dailyJapaGoal,
  dailyJapaGoalInput,
  onAddRounds,
  onAddDailyGoal,
  onCompletedRoundsChange,
  onDailyGoalChange,
  onDailyGoalBlur,
}: JapaTodayCardProps) {
  return (
    <article className={`${styles.card} ${styles.todayCard}`}>
      <div className={styles.cardHeader}>
        <h1>Джапа</h1>
        <div
          className={styles.roundMilestones}
          aria-label={`Завершено ${Math.floor(completedRounds / defaultGoals.japaRounds)} блоков по 16 кругов`}
        >
          {milestoneGroups.map((group, groupIndex) => (
            <div className={styles.milestoneGroup} key={groupIndex}>
              {group.map((milestone) => (
                <span
                  className={completedRounds >= milestone * defaultGoals.japaRounds ? styles.milestoneActive : undefined}
                  key={milestone}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <JapaProgressRing
        completedRounds={completedRounds}
        dailyJapaGoal={dailyJapaGoal}
        onCompletedRoundsChange={onCompletedRoundsChange}
      />

      <JapaRoundActions onAddRounds={onAddRounds} onAddDailyGoal={onAddDailyGoal} />

      <label className={styles.dailyGoalField}>
        <span>Цель на день</span>
        <input
          type="number"
          min="1"
          max="192"
          step="1"
          value={dailyJapaGoalInput}
          onChange={(event) => onDailyGoalChange(event.target.value)}
          onBlur={onDailyGoalBlur}
        />
      </label>
    </article>
  );
}
