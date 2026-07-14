import { japaApi } from '../../../entities/japa-session/api/japaApi';
import type { JapaDailyProgress, JapaDailyProgressQuery } from '../../../entities/japa-session/model/types';

type CachedJapaHistory = {
  query: JapaDailyProgressQuery;
  progressHistory: JapaDailyProgress[];
};

const dailyProgressCache = new Map<string, JapaDailyProgress>();
const dailyProgressRequests = new Map<string, Promise<JapaDailyProgress>>();
const dailyProgressHistoryCache = new Map<string, CachedJapaHistory>();
const dailyProgressHistoryRequests = new Map<string, Promise<JapaDailyProgress[]>>();

export const getDailyProgressCacheKey = (userId: string, date: string) => `${userId}:${date}`;

export const getDailyProgressHistoryCacheKey = (userId: string, query: JapaDailyProgressQuery) =>
  `${userId}:${query.from ?? ''}:${query.to ?? ''}`;

const isDateWithinProgressQuery = (date: string, query: JapaDailyProgressQuery) =>
  (!query.from || date >= query.from) && (!query.to || date <= query.to);

export const getCachedDailyProgress = (userId: string, date: string) => {
  const cacheKey = getDailyProgressCacheKey(userId, date);
  const cachedProgress = dailyProgressCache.get(cacheKey);

  if (cachedProgress) {
    return Promise.resolve(cachedProgress);
  }

  const pendingRequest = dailyProgressRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = japaApi
    .getToday(date)
    .then((progress) => {
      dailyProgressCache.set(cacheKey, progress);
      return progress;
    })
    .finally(() => {
      dailyProgressRequests.delete(cacheKey);
    });

  dailyProgressRequests.set(cacheKey, request);
  return request;
};

export const getCachedDailyProgressHistory = (userId: string, query: JapaDailyProgressQuery) => {
  const cacheKey = getDailyProgressHistoryCacheKey(userId, query);
  const cachedHistory = dailyProgressHistoryCache.get(cacheKey);

  if (cachedHistory) {
    return Promise.resolve(cachedHistory.progressHistory);
  }

  const pendingRequest = dailyProgressHistoryRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = japaApi
    .getHistory(query)
    .then((progressHistory) => {
      dailyProgressHistoryCache.set(cacheKey, {
        query,
        progressHistory,
      });
      return progressHistory;
    })
    .finally(() => {
      dailyProgressHistoryRequests.delete(cacheKey);
    });

  dailyProgressHistoryRequests.set(cacheKey, request);
  return request;
};

export const readCachedDailyProgress = (userId: string, date: string) =>
  dailyProgressCache.get(getDailyProgressCacheKey(userId, date));

export const readCachedDailyProgressHistory = (userId: string, query: JapaDailyProgressQuery) =>
  dailyProgressHistoryCache.get(getDailyProgressHistoryCacheKey(userId, query))?.progressHistory;

export const updateDailyProgressCache = (userId: string, progress: JapaDailyProgress) => {
  dailyProgressCache.set(getDailyProgressCacheKey(userId, progress.date), progress);

  dailyProgressHistoryCache.forEach((cachedHistory, cacheKey) => {
    if (!cacheKey.startsWith(`${userId}:`) || !isDateWithinProgressQuery(progress.date, cachedHistory.query)) {
      return;
    }

    cachedHistory.progressHistory = [
      ...cachedHistory.progressHistory.filter((historyItem) => historyItem.date !== progress.date),
      progress,
    ].sort((firstItem, secondItem) => firstItem.date.localeCompare(secondItem.date));
  });
};
