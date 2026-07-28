export type VerseStatus =
  | 'new'
  | 'learning'
  | 'review'
  | 'learned'
  | 'needsReview';

export type UserVerse = {
  id: string;
  createdById: string;
  isOwner: boolean;
  bookTitle: string;
  chapter: string | null;
  verseNumber: string;
  sanskritCyrillic: string;
  translation: string;
  status: VerseStatus;
  sanskritProgress: number;
  translationProgress: number;
  repetitionLevel: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Verse = UserVerse;

export type VerseEditorValues = {
  bookTitle: string;
  chapter: string;
  verseNumber: string;
  sanskritCyrillic: string;
  translation: string;
};

export type VerseLearningView = 'sanskrit' | 'translation';
export type VerseLearningStep = 'intro' | 'memorization' | 'complete';
export type VerseConfidence = 'forgot' | 'hard' | 'remembered' | 'easy';

export type VerseLearningProgressState = {
  sanskritLineIndex: number;
  translationLineIndex: number;
  sanskritVisitedLines: number[];
  translationVisitedLines: number[];
  sanskritHiddenLines: number[];
  translationHiddenLines: number[];
};

export type VerseLearningSession = {
  verseId: string;
  step: VerseLearningStep;
  activeView: VerseLearningView;
  currentLineIndex: number;
  revealedLineIndexes: number[];
  progressState: VerseLearningProgressState;
  confidence?: VerseConfidence;
};

export type VerseStore = {
  verses: UserVerse[];
  currentSession: VerseLearningSession | null;
  reviewQueue: string[];
  isLoading: boolean;
  error: string | null;
  loadVerses: () => Promise<void>;
  createVerse: (values: VerseEditorValues) => Promise<UserVerse>;
  updateVerse: (verseId: string, values: VerseEditorValues) => Promise<UserVerse>;
  deleteVerse: (verseId: string) => Promise<void>;
  toggleVerseFavorite: (verseId: string) => void;
  startLearningSession: (verseId: string) => void;
  startReviewQueue: (verseIds: string[]) => string | null;
  advanceReviewQueue: () => string | null;
  setLearningStep: (step: VerseLearningStep) => void;
  setLearningView: (view: VerseLearningView) => void;
  setCurrentLine: (lineIndex: number) => void;
  toggleLineVisibility: (lineIndex: number) => void;
  completeInitialLearning: () => void;
  completeLearningSession: (confidence: VerseConfidence) => void;
  resetLearningSession: () => void;
};
