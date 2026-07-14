export const JAPA_MANTRAS_PER_ROUND = 108;
export const JAPA_DAILY_ROUNDS = 16;
export const JAPA_DAILY_MANTRAS = JAPA_DAILY_ROUNDS * JAPA_MANTRAS_PER_ROUND;
export const JAPA_MANTRA_GOAL = 35_000_000;

export type JapaGoalHistoryEntry = {
  date: string;
  rounds: number;
};

export type JapaDailyProgressEntry = {
  date: string;
  rounds: number;
};

type JapaMantraProgress = {
  startDate: string | null;
  targetDate: string | null;
  dailyRounds: number;
  dailyMantras: number;
  days: number;
  completedMantras: number;
  totalMantras: number;
  percent: number;
};

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dayInMs = 24 * 60 * 60 * 1000;

const normalizeDailyRounds = (value: number) => {
  if (!Number.isFinite(value)) {
    return JAPA_DAILY_ROUNDS;
  }

  return Math.max(1, Math.round(value));
};

export const normalizeJapaDailyGoal = (value: number) => Math.min(normalizeDailyRounds(value), 192);

export const normalizeJapaCompletedRounds = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 192);
};

const parseDateKey = (dateKey: string) => {
  if (!dateKeyPattern.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const toStartOfLocalDay = (date: Date) => {
  const nextDate = new Date(date);

  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = () => toDateKey(new Date());

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getInclusiveDays = (startDate: Date, endDate: Date) =>
  Math.max(Math.floor((endDate.getTime() - startDate.getTime()) / dayInMs) + 1, 0);

const normalizeGoalHistory = (history: JapaGoalHistoryEntry[], startDate: Date, fallbackDailyRounds: number) => {
  const historyByDate = new Map<string, JapaGoalHistoryEntry>();

  history.forEach((entry) => {
    const date = parseDateKey(entry.date);

    if (!date || date < startDate) {
      return;
    }

    historyByDate.set(entry.date, {
      date: entry.date,
      rounds: normalizeJapaDailyGoal(entry.rounds),
    });
  });

  if (historyByDate.size === 0 && normalizeJapaDailyGoal(fallbackDailyRounds) !== JAPA_DAILY_ROUNDS) {
    historyByDate.set(getTodayDateKey(), {
      date: getTodayDateKey(),
      rounds: normalizeJapaDailyGoal(fallbackDailyRounds),
    });
  }

  return Array.from(historyByDate.values()).sort((firstEntry, secondEntry) => firstEntry.date.localeCompare(secondEntry.date));
};

const getSegments = (startDate: Date, history: JapaGoalHistoryEntry[]) => [
  {
    date: toDateKey(startDate),
    rounds: JAPA_DAILY_ROUNDS,
  },
  ...history,
];

const calculateTargetDate = (today: Date, completedMantras: number, dailyRounds: number) => {
  const remainingMantras = Math.max(JAPA_MANTRA_GOAL - completedMantras, 0);

  if (remainingMantras === 0) {
    return toDateKey(today);
  }

  const dailyMantras = normalizeJapaDailyGoal(dailyRounds) * JAPA_MANTRAS_PER_ROUND;
  const remainingDays = Math.ceil(remainingMantras / dailyMantras);

  return toDateKey(addDays(today, remainingDays));
};

export const calculateJapaMantraProgress = (
  startDate: string | null,
  today = new Date(),
  dailyRounds = JAPA_DAILY_ROUNDS,
  goalHistory: JapaGoalHistoryEntry[] = [],
  todayCompletedRounds?: number,
  dailyProgressHistory: JapaDailyProgressEntry[] = [],
): JapaMantraProgress => {
  const parsedStartDate = startDate ? parseDateKey(startDate) : null;
  const normalizedDailyRounds = normalizeJapaDailyGoal(dailyRounds);
  const dailyMantras = normalizedDailyRounds * JAPA_MANTRAS_PER_ROUND;

  if (!parsedStartDate) {
    return {
      startDate: null,
      targetDate: null,
      dailyRounds: normalizedDailyRounds,
      dailyMantras,
      days: 0,
      completedMantras: 0,
      totalMantras: 0,
      percent: 0,
    };
  }

  const todayDate = toStartOfLocalDay(today);
  const todayDateKey = toDateKey(todayDate);
  const days = getInclusiveDays(parsedStartDate, todayDate);
  const normalizedHistory = normalizeGoalHistory(goalHistory, parsedStartDate, normalizedDailyRounds);
  const segments = getSegments(parsedStartDate, normalizedHistory);
  const completedRoundsByDate = new Map<string, number>();
  let totalMantras = 0;
  let currentDailyRounds = JAPA_DAILY_ROUNDS;

  dailyProgressHistory.forEach((progress) => {
    const progressDate = parseDateKey(progress.date);

    if (!progressDate || progressDate < parsedStartDate || progressDate > todayDate) {
      return;
    }

    completedRoundsByDate.set(progress.date, normalizeJapaCompletedRounds(progress.rounds));
  });

  if (todayCompletedRounds !== undefined && parsedStartDate <= todayDate) {
    completedRoundsByDate.set(todayDateKey, normalizeJapaCompletedRounds(todayCompletedRounds));
  }

  for (let date = new Date(parsedStartDate), segmentIndex = 0; date <= todayDate; date = addDays(date, 1)) {
    while (segments[segmentIndex + 1]) {
      const nextSegmentStartDate = parseDateKey(segments[segmentIndex + 1].date);

      if (!nextSegmentStartDate || nextSegmentStartDate > date) {
        break;
      }

      segmentIndex += 1;
    }

    const dateKey = toDateKey(date);
    const segmentRounds = normalizeJapaDailyGoal(segments[segmentIndex].rounds);
    const completedRounds = completedRoundsByDate.get(dateKey) ?? segmentRounds;

    currentDailyRounds = segmentRounds;
    totalMantras += completedRounds * JAPA_MANTRAS_PER_ROUND;
  }

  const completedMantras = Math.min(totalMantras, JAPA_MANTRA_GOAL);
  const percent = Math.min((totalMantras / JAPA_MANTRA_GOAL) * 100, 100);
  const targetDate = calculateTargetDate(todayDate, completedMantras, currentDailyRounds);

  return {
    startDate,
    targetDate,
    dailyRounds: currentDailyRounds,
    dailyMantras: currentDailyRounds * JAPA_MANTRAS_PER_ROUND,
    days,
    completedMantras,
    totalMantras,
    percent,
  };
};

export const formatJapaNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

export const formatJapaProgressPercent = (value: number) =>
  `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)}%`;

export const formatJapaDate = (dateKey: string) => {
  const date = parseDateKey(dateKey);

  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat('ru-RU').format(date);
};

export const formatJapaRoundsPhrase = (rounds: number) => {
  const normalizedRounds = normalizeDailyRounds(rounds);
  const lastTwoDigits = normalizedRounds % 100;
  const lastDigit = normalizedRounds % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${normalizedRounds} кругов`;
  }

  if (lastDigit === 1) {
    return `${normalizedRounds} круг`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${normalizedRounds} круга`;
  }

  return `${normalizedRounds} кругов`;
};
