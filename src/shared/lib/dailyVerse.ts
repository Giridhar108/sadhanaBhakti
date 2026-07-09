import { readAuthUser } from '../../entities/user/model/auth';

export type DailyVerse = {
  id: string;
  image?: string;
  text: string;
  source: string;
};

const STORAGE_KEY = 'hare-krishna-daily-verse';

const isDailyVerse = (value: unknown): value is DailyVerse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const verse = value as Record<string, unknown>;

  return (
    typeof verse.id === 'string' &&
    typeof verse.text === 'string' &&
    typeof verse.source === 'string' &&
    (typeof verse.image === 'undefined' || typeof verse.image === 'string')
  );
};

const isLegacyDailyVerse = (value: unknown): value is Omit<DailyVerse, 'id'> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const verse = value as Record<string, unknown>;

  return (
    typeof verse.text === 'string' &&
    typeof verse.source === 'string' &&
    (typeof verse.image === 'undefined' || typeof verse.image === 'string')
  );
};

export const dailyVerseChanged = 'daily-verse-changed';

export function readDailyVerses(): DailyVerse[] {
  const authVerses = readAuthUser()?.settings.dailyVerses;

  if (authVerses) {
    return authVerses.filter(isDailyVerse);
  }

  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawVerse = window.localStorage.getItem(STORAGE_KEY);
    const parsedVerse: unknown = rawVerse ? JSON.parse(rawVerse) : null;

    if (Array.isArray(parsedVerse)) {
      return parsedVerse.filter(isDailyVerse);
    }

    if (isLegacyDailyVerse(parsedVerse)) {
      return [{ id: 'legacy-daily-verse', ...parsedVerse }];
    }

    return [];
  } catch {
    return [];
  }
}

export function readDailyVerse(): DailyVerse | null {
  return readDailyVerses()[0] ?? null;
}

export function writeDailyVerses(verses: DailyVerse[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(verses));
  window.dispatchEvent(new Event(dailyVerseChanged));
}

export function writeDailyVerse(verse: Omit<DailyVerse, 'id'> | DailyVerse) {
  const nextVerse = 'id' in verse ? verse : { id: `${Date.now()}`, ...verse };

  writeDailyVerses([nextVerse]);
}

export function clearDailyVerse() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(dailyVerseChanged));
}
