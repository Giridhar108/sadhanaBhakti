import type { JapaDailyProgress } from '@prisma/client';

export type JapaDailyProgressDto = {
  date: string;
  rounds: number;
  goalRounds: number | null;
  updatedAt: string | null;
};

export function toJapaDailyProgressDto(progress: JapaDailyProgress | null, date: string): JapaDailyProgressDto {
  return {
    date,
    rounds: progress?.rounds ?? 0,
    goalRounds: progress?.goalRounds ?? null,
    updatedAt: progress?.updatedAt.toISOString() ?? null,
  };
}
