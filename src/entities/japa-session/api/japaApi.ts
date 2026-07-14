import { endpoints } from '../../../shared/api/endpoints';
import { httpClient } from '../../../shared/api/httpClient';
import type { JapaDailyProgress, JapaDailyProgressQuery } from '../model/types';

const toQueryString = (query: JapaDailyProgressQuery) => {
  const params = new URLSearchParams();

  if (query.from) {
    params.set('from', query.from);
  }

  if (query.to) {
    params.set('to', query.to);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
};

export const japaApi = {
  getHistory: (query: JapaDailyProgressQuery = {}) =>
    httpClient.get<JapaDailyProgress[]>(`${endpoints.japa.history}${toQueryString(query)}`),
  getToday: (date: string) => httpClient.get<JapaDailyProgress>(`${endpoints.japa.today}?date=${date}`),
  updateToday: (input: Pick<JapaDailyProgress, 'date'> & Partial<Pick<JapaDailyProgress, 'rounds' | 'goalRounds'>>) =>
    httpClient.patch<JapaDailyProgress>(endpoints.japa.today, input),
};
