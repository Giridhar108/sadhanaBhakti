import type { VerseReferenceInput } from './types';

export const formatVerseReference = (input: VerseReferenceInput): string => {
  const chapter = input.chapter.trim();
  const verseNumber = input.verseNumber.trim();
  const parts = [
    input.bookTitle.trim(),
    chapter ? `Глава ${chapter}` : '',
    verseNumber ? chapter ? `Стих ${verseNumber}` : verseNumber : '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Новый стих';
};
