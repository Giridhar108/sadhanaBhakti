export type JapaSession = {
  id: string;
  userId: string;
  rounds: number;
  startedAt: string;
  finishedAt?: string;
};

export type JapaDailyProgress = {
  date: string;
  rounds: number;
  goalRounds: number | null;
  updatedAt: string | null;
};

export type JapaDailyProgressQuery = {
  from?: string;
  to?: string;
};
