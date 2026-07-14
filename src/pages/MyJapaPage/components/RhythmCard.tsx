import type { JapaDailyProgress } from '../../../entities/japa-session/model/types';
import styles from './RhythmCard.module.css';

type RhythmCardProps = {
  progressHistory: JapaDailyProgress[];
  todayDateKey: string;
  todayCompletedRounds: number;
  dailyGoal: number;
};

type RhythmDay = {
  date: string;
  label: string;
  rounds: number;
  isToday: boolean;
};

const chart = {
  left: 42,
  right: 512,
  top: 22,
  bottom: 104,
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDayLabel = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date).replace('.', '');

const getRecentDays = (
  progressHistory: JapaDailyProgress[],
  todayDateKey: string,
  todayCompletedRounds: number,
) => {
  const progressByDate = new Map(progressHistory.map((progress) => [progress.date, progress.rounds]));
  const today = parseDateKey(todayDateKey);

  return Array.from({ length: 5 }, (_, index): RhythmDay => {
    const date = new Date(today);
    const daysAgo = 4 - index;

    date.setDate(today.getDate() - daysAgo);

    const dateKey = toDateKey(date);
    const isToday = dateKey === todayDateKey;

    return {
      date: dateKey,
      label: formatDayLabel(date),
      rounds: isToday ? todayCompletedRounds : progressByDate.get(dateKey) ?? 0,
      isToday,
    };
  });
};

export function RhythmCard({
  progressHistory,
  todayDateKey,
  todayCompletedRounds,
  dailyGoal,
}: RhythmCardProps) {
  const days = getRecentDays(progressHistory, todayDateKey, todayCompletedRounds);
  const maxRounds = days.some((day) => day.rounds > 64) ? 128 : 64;
  const chartHeight = chart.bottom - chart.top;
  const getY = (rounds: number) => chart.bottom - (Math.min(rounds, maxRounds) / maxRounds) * chartHeight;
  const goalY = getY(dailyGoal);
  const stepX = (chart.right - chart.left) / (days.length - 1);

  return (
    <article className={`${styles.card} ${styles.rhythmCard}`}>
      <div className={styles.header}>
        <div>
          <h2>Круги за 5 дней</h2>
          <p>Ежедневный ритм практики</p>
        </div>
        <span className={styles.goalBadge}>
          <i />
          Цель {dailyGoal}
        </span>
      </div>

      <div className={styles.chartWrap}>
        <svg
          className={styles.chart}
          viewBox="0 0 540 142"
          role="img"
          aria-label={`Прочитанные круги за последние пять дней. Дневная цель — ${dailyGoal} кругов.`}
        >
          <line className={styles.scaleLine} x1={chart.left} y1={chart.top} x2={chart.right} y2={chart.top} />
          <line className={styles.baseLine} x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} />
          <line className={styles.goalLine} x1={chart.left} y1={goalY} x2={chart.right} y2={goalY} />
          <text className={styles.scaleLabel} x={chart.left - 8} y={chart.top + 4} textAnchor="end">
            {maxRounds}
          </text>
          <text className={styles.scaleLabel} x={chart.left - 8} y={chart.bottom + 4} textAnchor="end">
            0
          </text>

          {days.map((day, index) => {
            const x = chart.left + stepX * index;
            const y = getY(day.rounds);

            return (
              <g className={day.isToday ? styles.todayPoint : styles.dayPoint} key={day.date}>
                <title>{`${day.label}: ${day.rounds} кругов`}</title>
                <line className={styles.stem} x1={x} y1={chart.bottom} x2={x} y2={y} />
                <circle className={styles.pointHalo} cx={x} cy={y} r="8" />
                <circle className={styles.point} cx={x} cy={y} r="5" />
                <text className={styles.value} x={x} y={Math.max(y - 12, 11)} textAnchor="middle">
                  {day.rounds}
                </text>
                <text className={styles.dateLabel} x={x} y="126" textAnchor="middle">
                  {day.label}
                </text>
                {day.isToday ? (
                  <text className={styles.todayLabel} x={x} y="140" textAnchor="middle">
                    Сегодня
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
