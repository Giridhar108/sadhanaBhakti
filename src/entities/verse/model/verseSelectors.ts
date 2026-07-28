import type { UserVerse } from './types';

export const getTodayDateKey = (today = new Date()) => {
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
};

const getCurrentDateTimeKey = () => {
  const now = new Date();

  return [
    getTodayDateKey(now),
    [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
    ].join(':'),
  ].join('T');
};

export const getVerseById = (verses: UserVerse[], verseId: string | undefined) =>
  verses.find((verse) => verse.id === verseId);

export const getVerseLines = (value: string) =>
  value ? value.split('\n') : [];

export const getVerseProgress = (verse: UserVerse) =>
  Math.round((verse.sanskritProgress + verse.translationProgress) / 2);

export const getTodayVerses = (verses: UserVerse[]) => {
  const today = getTodayDateKey();
  const currentDateTime = getCurrentDateTimeKey();
  const statusPriority: Record<UserVerse['status'], number> = {
    needsReview: 0,
    review: 1,
    learning: 2,
    learned: 3,
    new: 4,
  };

  return verses
    .filter((verse) => {
      if (!verse.nextReviewAt) {
        return false;
      }

      return verse.nextReviewAt.includes('T')
        ? verse.nextReviewAt <= currentDateTime
        : verse.nextReviewAt <= today;
    })
    .sort((first, second) => {
      const dateOrder = first.nextReviewAt!.localeCompare(second.nextReviewAt!);

      if (dateOrder !== 0) {
        return dateOrder;
      }

      const statusOrder = statusPriority[first.status] - statusPriority[second.status];

      if (statusOrder !== 0) {
        return statusOrder;
      }

      return (first.lastReviewedAt ?? first.createdAt)
        .localeCompare(second.lastReviewedAt ?? second.createdAt);
    });
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
  const [reviewDate, reviewTime] = dateKey.split('T');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  if (reviewDate <= today) {
    if (reviewDate === today && reviewTime === '19:00') {
      return 'сегодня вечером, в 19:00';
    }

    if (reviewDate === today && reviewTime) {
      return `сегодня, в ${reviewTime}`;
    }

    return 'сегодня';
  }

  if (reviewDate === tomorrowKey) {
    if (reviewTime === '08:00') {
      return 'завтра утром, в 08:00';
    }

    if (reviewTime) {
      return `завтра, в ${reviewTime}`;
    }

    return 'завтра';
  }

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${reviewDate}T12:00:00`));

  return reviewTime ? `${formattedDate}, в ${reviewTime}` : formattedDate;
};
