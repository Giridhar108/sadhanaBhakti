const JAPA_MANTRAS_PER_ROUND = 108;
const JAPA_DAILY_ROUNDS = 16;
const JAPA_MANTRA_GOAL = 35_000_000;
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const dayInMs = 24 * 60 * 60 * 1000;

type JapaGoalHistoryEntry = {
  date: string;
  rounds: number;
};

type JapaDailyProgressEntry = {
  date: string;
  rounds: number;
};

type JapaProgressForecastInput = {
  startDate: string | null;
  todayDate: string;
  dailyRounds: number;
  goalHistory: unknown;
  dailyProgress: JapaDailyProgressEntry[];
};

export type JapaProgressForecast = {
  totalRounds: number;
  dailyRounds: number;
  targetDate: string | null;
};

function normalizeDailyRounds(value: number) {
  if (!Number.isFinite(value)) {
    return JAPA_DAILY_ROUNDS;
  }

  return Math.min(Math.max(Math.round(value), 1), 192);
}

function normalizeCompletedRounds(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 192);
}

function parseDateKey(dateKey: string) {
  if (!dateKeyPattern.test(dateKey)) {
    return null;
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

function readGoalHistory(value: unknown, startDate: Date, fallbackDailyRounds: number, todayDate: string) {
  const historyByDate = new Map<string, JapaGoalHistoryEntry>();

  if (Array.isArray(value)) {
    value.forEach((entry: unknown) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      const candidate = entry as Record<string, unknown>;
      const date = typeof candidate.date === 'string' ? parseDateKey(candidate.date) : null;
      const rounds = typeof candidate.rounds === 'number' ? candidate.rounds : Number.NaN;

      if (!date || date < startDate || !Number.isFinite(rounds)) {
        return;
      }

      historyByDate.set(candidate.date as string, {
        date: candidate.date as string,
        rounds: normalizeDailyRounds(rounds),
      });
    });
  }

  if (historyByDate.size === 0 && normalizeDailyRounds(fallbackDailyRounds) !== JAPA_DAILY_ROUNDS) {
    historyByDate.set(todayDate, {
      date: todayDate,
      rounds: normalizeDailyRounds(fallbackDailyRounds),
    });
  }

  return Array.from(historyByDate.values()).sort((first, second) => first.date.localeCompare(second.date));
}

export function calculateJapaProgressForecast({
  startDate,
  todayDate,
  dailyRounds,
  goalHistory,
  dailyProgress,
}: JapaProgressForecastInput): JapaProgressForecast {
  const parsedStartDate = startDate ? parseDateKey(startDate) : null;
  const parsedTodayDate = parseDateKey(todayDate);
  const normalizedDailyRounds = normalizeDailyRounds(dailyRounds);

  if (!parsedStartDate || !parsedTodayDate) {
    return {
      totalRounds: 0,
      dailyRounds: normalizedDailyRounds,
      targetDate: null,
    };
  }

  const normalizedHistory = readGoalHistory(
    goalHistory,
    parsedStartDate,
    normalizedDailyRounds,
    todayDate,
  );
  const segments = [
    { date: toDateKey(parsedStartDate), rounds: JAPA_DAILY_ROUNDS },
    ...normalizedHistory,
  ];
  const completedRoundsByDate = new Map<string, number>();

  dailyProgress.forEach((progress) => {
    const progressDate = parseDateKey(progress.date);

    if (!progressDate || progressDate < parsedStartDate || progressDate > parsedTodayDate) {
      return;
    }

    completedRoundsByDate.set(progress.date, normalizeCompletedRounds(progress.rounds));
  });

  let totalRounds = 0;
  let currentDailyRounds = JAPA_DAILY_ROUNDS;

  for (
    let date = new Date(parsedStartDate), segmentIndex = 0;
    date <= parsedTodayDate;
    date = addDays(date, 1)
  ) {
    while (segments[segmentIndex + 1]) {
      const nextSegmentDate = parseDateKey(segments[segmentIndex + 1].date);

      if (!nextSegmentDate || nextSegmentDate > date) {
        break;
      }

      segmentIndex += 1;
    }

    const dateKey = toDateKey(date);
    const segmentRounds = normalizeDailyRounds(segments[segmentIndex].rounds);

    currentDailyRounds = segmentRounds;
    totalRounds += completedRoundsByDate.get(dateKey) ?? segmentRounds;
  }

  const completedMantras = Math.min(totalRounds * JAPA_MANTRAS_PER_ROUND, JAPA_MANTRA_GOAL);
  const remainingMantras = Math.max(JAPA_MANTRA_GOAL - completedMantras, 0);
  const remainingDays = Math.ceil(remainingMantras / (currentDailyRounds * JAPA_MANTRAS_PER_ROUND));

  return {
    totalRounds: Math.floor(completedMantras / JAPA_MANTRAS_PER_ROUND),
    dailyRounds: currentDailyRounds,
    targetDate: toDateKey(addDays(parsedTodayDate, remainingDays)),
  };
}
