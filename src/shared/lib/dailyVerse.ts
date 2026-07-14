import { readAuthUser } from '../../entities/user/model/auth';
import krishna from '../assets/images/krishna.png';

export type DailyVerse = {
  id: string;
  image?: string;
  text: string;
  source: string;
};

export const defaultDailyVerse: DailyVerse = {
  id: 'default-daily-verse',
  image: krishna,
  text: 'Мой дорогой ум, ты избрал путь самосознания, однако, в своем безрассудстве ты считаешь, что купание в претенциозности, обмане и придирчивости, которые сродни ослиной моче, очень очищает.<br> Так ты губишь и себя, и меня. Прошу тебя, остановись! <br>Лучше давай погрузимся в океан нектара любовного служения лотосным стопам Шри&nbsp;Шри&nbsp;Гандхарвики&nbsp;Гиридхари и так принесем нам обоим нескончаемое счастье.',
  source: 'Манах Шикша. Стих 6',
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
      const validVerses = parsedVerse.filter(isDailyVerse);
      return validVerses.length > 0 ? validVerses : [defaultDailyVerse];
    }

    if (isLegacyDailyVerse(parsedVerse)) {
      return [{ id: 'legacy-daily-verse', ...parsedVerse }];
    }

    return [defaultDailyVerse];
  } catch {
    return [defaultDailyVerse];
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
