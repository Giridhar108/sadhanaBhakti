import { type CSSProperties } from 'react';
import { defaultGoals } from '../../../entities/user/model/auth';
import smallCow from '../../../shared/assets/images/smallCow.png';
import styles from './JapaTodayCard.module.css';

type JapaTodayCardProps = {
  completedRounds: number;
  dailyJapaGoal: number;
  dailyJapaGoalInput: string;
  onAddRounds: (rounds: number) => void;
  onAddDailyGoal: () => void;
  onDailyGoalChange: (value: string) => void;
  onDailyGoalBlur: () => void;
};

const milestoneGroups = Array.from({ length: 3 }, (_, groupIndex) =>
  Array.from({ length: 4 }, (_, barIndex) => groupIndex * 4 + barIndex + 1),
);

const progressRadius = 132;
const progressCircumference = 2 * Math.PI * progressRadius;

export function JapaTodayCard({
  completedRounds,
  dailyJapaGoal,
  dailyJapaGoalInput,
  onAddRounds,
  onAddDailyGoal,
  onDailyGoalChange,
  onDailyGoalBlur,
}: JapaTodayCardProps) {
  const visibleRounds = Math.min(completedRounds, dailyJapaGoal);
  const remainingRounds = Math.max(dailyJapaGoal - completedRounds, 0);
  const japaProgress = visibleRounds / dailyJapaGoal;
  const progressDashOffset = progressCircumference * (1 - japaProgress);
  const progressMarkerStyle = {
    '--progress-angle': `${japaProgress * 360}deg`,
  } as CSSProperties;
  const progressCircleStyle = {
    strokeDasharray: progressCircumference,
    strokeDashoffset: progressDashOffset,
  } as CSSProperties;

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

      <div className={styles.progressCircle} aria-label={`${visibleRounds} из ${dailyJapaGoal} кругов сегодня`}>
        <div className={styles.progressRing}>
          <svg className={styles.progressSvg} viewBox="0 0 320 320" aria-hidden="true">
            <defs>
              <path id="japaGoalArc" d="M 34 48 Q 160 -44 286 48" />
              <path id="japaRemainingArc" d="M 72 234 Q 160 296 248 234" />
            </defs>
            <circle className={styles.progressTrack} cx="160" cy="160" r={progressRadius} />
            <circle className={styles.progressValue} cx="160" cy="160" r={progressRadius} style={progressCircleStyle} />
            <text className={styles.progressArcText}>
              <textPath href="#japaGoalArc" startOffset="50%" textAnchor="middle">
                Цель на сегодня: {dailyJapaGoal} кругов
              </textPath>
            </text>
            <text className={styles.progressArcText}>
              <textPath href="#japaRemainingArc" startOffset="50%" textAnchor="middle">
                Осталось {remainingRounds} кругов
              </textPath>
            </text>
          </svg>
          <span className={styles.progressMarker} style={progressMarkerStyle} />
          <div className={styles.progressCenter}>
            <strong>
              {visibleRounds}<span>/{dailyJapaGoal}</span>
            </strong>
            <small>кругов сегодня</small>
            <img src={smallCow} alt="" />
          </div>
        </div>
      </div>

      <div className={styles.todayActions}>
        <div className={styles.quickRoundActions}>
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
