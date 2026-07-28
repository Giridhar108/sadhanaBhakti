export type PrayerCategory =
  | 'morning-program'
  | 'guru'
  | 'gaura'
  | 'narasimha'
  | 'tulasi'
  | 'arati'
  | 'kirtan'
  | 'other';

export type PrayerWord = {
  id: string;
  original: string;
  pronunciation: string;
  translation: string;
};

export type PrayerVerse = {
  id: string;
  order: number;
  transliteration: string;
  russianPronunciation: string;
  words: PrayerWord[];
  translation: string;
  explanation?: string;
};

export type Prayer = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  openingWords: string;
  author?: string;
  category: PrayerCategory;
  description?: string;
  coverImage?: string;
  totalVerses: number;
  verses: PrayerVerse[];
  isAvailable: boolean;
};

export type LearningStatus = 'not-started' | 'learning' | 'learned';

export type PrayerVerseProgress = {
  prayerId: string;
  verseId: string;
  status: LearningStatus;
  successfulRepetitions: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
};

export type PrayerProgress = {
  prayerId: string;
  learnedVerses: number;
  startedVerses: number;
  totalVerses: number;
  progressPercent: number;
  lastReviewedAt?: string;
};

export type PrayerViewMode = 'text' | 'words' | 'translation';
