import { type CSSProperties, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { UserGender } from '../../../../entities/user/model/types';
import styles from './LifeWeeksCard.module.css';

const lifeYears = 90;
const weeksPerYear = 52;
const totalLifeWeeks = lifeYears * weeksPerYear;
const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
const weekMarkers = Array.from({ length: 13 }, (_, index) => (index + 1) * 4);
const lifeWeekCells = Array.from({ length: totalLifeWeeks }, (_, index) => index);
const ageRows = Array.from({ length: lifeYears }, (_, age) => age);
const estimatedDeathAgeByGender: Record<UserGender, number> = {
  male: 68,
  female: 78,
};

type LifeWeeksCardProps = {
  birthDate: string | null;
  goalDate: string | null;
  gender: UserGender | null;
};

type LifeProgress = {
  age: number;
  completedWeeks: number;
  percent: number;
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    !year
    || !month
    || !day
    || date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getCalendarTimestamp(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function getLifeProgress(birthDateKey: string | null): LifeProgress | null {
  if (!birthDateKey) {
    return null;
  }

  const birthDate = parseDateKey(birthDateKey);

  if (!birthDate) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsedMilliseconds = getCalendarTimestamp(today) - getCalendarTimestamp(birthDate);

  if (elapsedMilliseconds < 0) {
    return null;
  }

  const rawCompletedWeeks = Math.floor(elapsedMilliseconds / millisecondsPerWeek);
  const completedWeeks = Math.min(rawCompletedWeeks, totalLifeWeeks);
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasNotHadBirthdayThisYear = today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

  if (hasNotHadBirthdayThisYear) {
    age -= 1;
  }

  return {
    age: Math.max(0, age),
    completedWeeks,
    percent: completedWeeks / totalLifeWeeks * 100,
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function getGoalWeekIndex(birthDateKey: string | null, goalDateKey: string | null) {
  if (!birthDateKey || !goalDateKey) {
    return null;
  }

  const birthDate = parseDateKey(birthDateKey);
  const goalDate = parseDateKey(goalDateKey);

  if (!birthDate || !goalDate) {
    return null;
  }

  const weekIndex = Math.floor(
    (getCalendarTimestamp(goalDate) - getCalendarTimestamp(birthDate)) / millisecondsPerWeek,
  );

  return weekIndex >= 0 && weekIndex < totalLifeWeeks ? weekIndex : null;
}

function formatDate(dateKey: string) {
  const date = parseDateKey(dateKey);

  return date ? new Intl.DateTimeFormat('ru-RU').format(date) : dateKey;
}

function getWeeksUntilDate(dateKey: string | null) {
  if (!dateKey) {
    return null;
  }

  const targetDate = parseDateKey(dateKey);

  if (!targetDate) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const remainingMilliseconds = getCalendarTimestamp(targetDate) - getCalendarTimestamp(today);

  return Math.max(0, Math.ceil(remainingMilliseconds / millisecondsPerWeek));
}

function getFullYearsAtDate(birthDateKey: string | null, targetDateKey: string | null) {
  if (!birthDateKey || !targetDateKey) {
    return null;
  }

  const birthDate = parseDateKey(birthDateKey);
  const targetDate = parseDateKey(targetDateKey);

  if (!birthDate || !targetDate || targetDate < birthDate) {
    return null;
  }

  let fullYears = targetDate.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotOccurred = targetDate.getMonth() < birthDate.getMonth()
    || (targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() < birthDate.getDate());

  if (birthdayHasNotOccurred) {
    fullYears -= 1;
  }

  return fullYears;
}

export function LifeWeeksCard({ birthDate, goalDate, gender }: LifeWeeksCardProps) {
  const progress = useMemo(() => getLifeProgress(birthDate), [birthDate]);
  const goalWeekIndex = useMemo(() => getGoalWeekIndex(birthDate, goalDate), [birthDate, goalDate]);
  const weeksUntilGoal = useMemo(() => getWeeksUntilDate(goalDate), [goalDate]);
  const ageAtGoal = useMemo(() => getFullYearsAtDate(birthDate, goalDate), [birthDate, goalDate]);
  const estimatedDeathAge = gender ? estimatedDeathAgeByGender[gender] : null;
  const currentWeekIndex = progress && progress.completedWeeks < totalLifeWeeks
    ? progress.completedWeeks
    : -1;

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2>Недели моей жизни</h2>
          <p>Каждый квадрат — одна неделя на пути от рождения до 90 лет.</p>
        </div>

        {progress ? (
          <div className={styles.summary}>
            <div>
              <strong>{progress.age}</strong>
              <span>полных лет</span>
            </div>
            <div>
              <strong>{ageAtGoal === null ? '—' : ageAtGoal}</strong>
              <span>будет при достижении цели</span>
            </div>
            <div>
              <strong>{weeksUntilGoal === null ? '—' : formatNumber(weeksUntilGoal)}</strong>
              <span>недель до цели</span>
            </div>
          </div>
        ) : (
          <div className={styles.missingBirthDate}>
            <span>Добавь дату рождения, чтобы увидеть свою карту.</span>
            <Link to="/settings">Указать в настройках</Link>
          </div>
        )}
      </header>

      <div className={styles.progressLine} aria-hidden="true">
        <span style={{ width: `${progress?.percent ?? 0}%` }} />
      </div>

      <div className={styles.chartViewport}>
        <div
          className={styles.chart}
          role="img"
          aria-label={progress
            ? `Карта жизни: прожито ${progress.completedWeeks} из ${totalLifeWeeks} недель`
            : `Карта жизни на ${lifeYears} лет, дата рождения не указана`}
        >
          <div aria-hidden="true" />
          <div className={styles.weekLabels} aria-hidden="true">
            {weekMarkers.map((week) => (
              <span key={week} style={{ gridColumn: week } as CSSProperties}>{week}</span>
            ))}
          </div>

          <div className={styles.ageLabels} aria-hidden="true">
            {ageRows.map((age) => <span key={age}>{age % 5 === 0 ? age : ''}</span>)}
            <span className={styles.lastAge}>90</span>
          </div>

          <div className={styles.weeksGrid} aria-hidden="true">
            {lifeWeekCells.map((weekIndex) => {
              const isCompleted = Boolean(progress && weekIndex < progress.completedWeeks);
              const isCurrent = weekIndex === currentWeekIndex;
              const isGoal = weekIndex === goalWeekIndex;

              return (
                <span
                  className={`${styles.week} ${isCompleted ? styles.completedWeek : ''} ${isCurrent ? styles.currentWeek : ''} ${isGoal ? styles.goalWeek : ''}`}
                  key={weekIndex}
                />
              );
            })}
            {estimatedDeathAge ? (
              <span
                className={styles.estimatedDeathLine}
                style={{ '--estimated-death-age': estimatedDeathAge } as CSSProperties}
              >
                <b>≈ {estimatedDeathAge} лет</b>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <footer className={styles.legend}>
        <span><i className={styles.completedLegend} />Прожитые недели</span>
        <span><i className={styles.currentLegend} />Текущая неделя</span>
        {goalDate && goalWeekIndex !== null ? (
          <span><i className={styles.goalLegend} />Цель 35 млн — {formatDate(goalDate)}</span>
        ) : null}
        {birthDate && goalDate && goalWeekIndex === null ? (
          <span>Цель 35 млн находится за пределами карты 90 лет</span>
        ) : null}
        {estimatedDeathAge ? (
          <span>
            <i className={styles.estimatedDeathLegend} />
            Средний возраст смерти — около {estimatedDeathAge} лет
          </span>
        ) : null}
        <span><i className={styles.futureLegend} />Будущие недели</span>
      </footer>
    </article>
  );
}
