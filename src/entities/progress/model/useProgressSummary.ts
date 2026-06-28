import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/httpClient';
import type { ProgressSummary } from './types';

const fallbackSummary: ProgressSummary = {
  japaPercent: 75,
  booksPercent: 60,
  versesPercent: 50,
  streakDays: 25,
};

export function useProgressSummary() {
  return useQuery({
    queryKey: ['progress', 'summary'],
    queryFn: async () => {
      try {
        return await httpClient.get<ProgressSummary>('/progress/summary');
      } catch {
        return fallbackSummary;
      }
    },
  });
}
