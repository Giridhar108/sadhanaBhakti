export type VerseStatus =
  | 'new'
  | 'learning'
  | 'review'
  | 'learned'
  | 'needsReview';

export type VerseSource =
  | 'bhagavadGita'
  | 'srimadBhagavatam'
  | 'other';

export type Verse = {
  id: string;
  source: VerseSource;
  sourceTitle: string;
  reference: string;
  chapterTitle?: string;
  sanskritCyrillicLines: string[];
  translationLines: string[];
  fullTranslation: string;
  audioUrl?: string;
  status: VerseStatus;
  progress: number;
  nextReviewAt?: string;
  isFavorite: boolean;
};

export type VerseLearningView = 'sanskrit' | 'translation';

export type VerseLearningStep = 'intro' | 'memorization' | 'complete';

export type VerseConfidence =
  | 'forgot'
  | 'hard'
  | 'remembered'
  | 'easy';

export type VerseMemorizationProgress = {
  sanskritProgress: number;
  translationProgress: number;
};

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
  verses: Verse[];
  userVerseIds: string[];
  currentSession: VerseLearningSession | null;
  addVerseToLearning: (verseId: string) => void;
  toggleVerseFavorite: (verseId: string) => void;
  startLearningSession: (verseId: string) => void;
  setLearningStep: (step: VerseLearningStep) => void;
  setLearningView: (view: VerseLearningView) => void;
  setCurrentLine: (lineIndex: number) => void;
  toggleLineVisibility: (lineIndex: number) => void;
  completeInitialLearning: () => void;
  completeLearningSession: (confidence: VerseConfidence) => void;
  resetLearningSession: () => void;
};
