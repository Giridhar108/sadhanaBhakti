import { endpoints } from '../../../shared/api/endpoints';
import { httpClient } from '../../../shared/api/httpClient';
import type { JapaDailyProgress } from '../model/types';

export const japaApi = {
  getToday: (date: string) => httpClient.get<JapaDailyProgress>(`${endpoints.japa.today}?date=${date}`),
  updateToday: (input: Pick<JapaDailyProgress, 'date'> & Partial<Pick<JapaDailyProgress, 'rounds' | 'goalRounds'>>) =>
    httpClient.patch<JapaDailyProgress>(endpoints.japa.today, input),
};
