import type { UserVerse } from './types';

export const getTodayDateKey = () => {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getVerseById = (verses: UserVerse[], verseId: string | undefined) =>
  verses.find((verse) => verse.id === verseId);

export const getVerseLines = (value: string) =>
  value ? value.split('\n') : [];

export const getVerseProgress = (verse: UserVerse) =>
  Math.round((verse.sanskritProgress + verse.translationProgress) / 2);

export const getTodayVerses = (verses: UserVerse[]) => {
  const today = getTodayDateKey();

  return verses.filter(
    (verse) =>
      verse.status === 'learning'
      || verse.status === 'review'
      || verse.status === 'needsReview'
      || Boolean(verse.nextReviewAt && verse.nextReviewAt <= today),
  );
};

export const getVerseSearchText = (verse: UserVerse) =>
  [
    verse.bookTitle,
    verse.chapter,
    verse.verseNumber,
    verse.sanskritCyrillic,
    verse.translation,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('ru-RU');

export const getReviewDateLabel = (dateKey: string | null) => {
  if (!dateKey) {
    return 'после первого занятия';
  }

  const today = getTodayDateKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  if (dateKey <= today) {
    return 'сегодня';
  }

  if (dateKey === tomorrowKey) {
    return 'завтра';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateKey}T12:00:00`));
};
