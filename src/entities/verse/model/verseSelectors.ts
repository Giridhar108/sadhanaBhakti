import type { Verse } from './types';

export const getTodayDateKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getVerseById = (verses: Verse[], verseId: string | undefined) =>
  verses.find((verse) => verse.id === verseId);

export const getUserVerses = (verses: Verse[], userVerseIds: string[]) =>
  verses.filter((verse) => userVerseIds.includes(verse.id));

export const getTodayVerses = (verses: Verse[], userVerseIds: string[]) => {
  const today = getTodayDateKey();

  return getUserVerses(verses, userVerseIds).filter(
    (verse) =>
      verse.status === 'learning'
      || verse.status === 'needsReview'
      || Boolean(verse.nextReviewAt && verse.nextReviewAt <= today),
  );
};

export const getVerseSearchText = (verse: Verse) =>
  [
    verse.reference,
    verse.sourceTitle,
    verse.chapterTitle,
    ...verse.sanskritCyrillicLines,
    ...verse.translationLines,
    verse.fullTranslation,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('ru-RU');

export const getReviewDateLabel = (dateKey?: string) => {
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
