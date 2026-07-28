import type {
  Prayer,
  PrayerProgress,
  PrayerVerseProgress,
} from './prayer.types';

export const prayerCategoryLabels: Record<Prayer['category'], string> = {
  'morning-program': 'Утренняя программа',
  guru: 'Молитвы духовному учителю',
  gaura: 'Господь Чайтанья',
  narasimha: 'Господь Нрисимхадев',
  tulasi: 'Туласи-деви',
  arati: 'Арати',
  kirtan: 'Киртаны',
  other: 'Другие',
};

export const getPrayerBySlug = (prayers: Prayer[], slug: string | undefined) =>
  prayers.find((prayer) => prayer.slug === slug);

export const getPrayerVerseById = (prayer: Prayer, verseId: string | undefined) =>
  prayer.verses.find((verse) => verse.id === verseId);

export const isPrayerVerseStudied = (
  progress: PrayerVerseProgress | undefined,
) => Boolean(progress?.status === 'learned' || progress?.lastReviewedAt);

export const getPrayerProgress = (
  prayer: Prayer,
  progressByVerseId: Record<string, PrayerVerseProgress>,
): PrayerProgress => {
  const prayerProgress = Object.values(progressByVerseId)
    .filter((item) => item.prayerId === prayer.id);
  const learnedVerses = prayerProgress
    .filter(isPrayerVerseStudied)
    .length;
  const reviewDates = prayerProgress
    .map((item) => item.lastReviewedAt)
    .filter((value): value is string => Boolean(value))
    .sort();
  const lastReviewedAt = reviewDates[reviewDates.length - 1];

  return {
    prayerId: prayer.id,
    learnedVerses,
    startedVerses: prayerProgress.filter((item) => item.status !== 'not-started').length,
    totalVerses: prayer.totalVerses,
    progressPercent: Math.round((learnedVerses / prayer.totalVerses) * 100),
    lastReviewedAt,
  };
};

export const formatPrayerReviewDate = (value: string | undefined) => {
  if (!value) return null;

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};
