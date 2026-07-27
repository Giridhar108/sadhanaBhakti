import { create } from 'zustand';
import { calculateNextReview } from '../lib/calculateNextReview';
import { getTodayDateKey } from './verseSelectors';
import { verseCatalog } from './verseCatalog';
import type {
  Verse,
  VerseConfidence,
  VerseLearningProgressState,
  VerseLearningSession,
  VerseLearningStep,
  VerseLearningView,
  VerseStatus,
  VerseStore,
} from './types';

const storageKey = 'hare-krishna-verses';

type PersistedVerseState = {
  verses: Verse[];
  userVerseIds: string[];
  currentSession: VerseLearningSession | null;
};

const defaultProgressState: VerseLearningProgressState = {
  sanskritLineIndex: 0,
  translationLineIndex: 0,
  sanskritVisitedLines: [],
  translationVisitedLines: [],
  sanskritHiddenLines: [],
  translationHiddenLines: [],
};

const statusValues: VerseStatus[] = ['new', 'learning', 'review', 'learned', 'needsReview'];
const stepValues: VerseLearningStep[] = ['intro', 'memorization', 'complete'];
const viewValues: VerseLearningView[] = ['sanskrit', 'translation'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0);

const isStoredVerse = (value: unknown): value is Verse =>
  isRecord(value)
  && typeof value.id === 'string'
  && statusValues.includes(value.status as VerseStatus)
  && typeof value.progress === 'number'
  && value.progress >= 0
  && value.progress <= 100
  && typeof value.isFavorite === 'boolean';

const isProgressState = (value: unknown): value is VerseLearningProgressState =>
  isRecord(value)
  && Number.isInteger(value.sanskritLineIndex)
  && Number.isInteger(value.translationLineIndex)
  && isNumberArray(value.sanskritVisitedLines)
  && isNumberArray(value.translationVisitedLines)
  && isNumberArray(value.sanskritHiddenLines)
  && isNumberArray(value.translationHiddenLines);

const isLearningSession = (value: unknown): value is VerseLearningSession =>
  isRecord(value)
  && typeof value.verseId === 'string'
  && stepValues.includes(value.step as VerseLearningStep)
  && viewValues.includes(value.activeView as VerseLearningView)
  && Number.isInteger(value.currentLineIndex)
  && isNumberArray(value.revealedLineIndexes)
  && isProgressState(value.progressState);

const mergeWithCatalog = (storedVerses: Verse[]) =>
  verseCatalog.map((catalogVerse) => {
    const storedVerse = storedVerses.find((verse) => verse.id === catalogVerse.id);

    if (!storedVerse) {
      return catalogVerse;
    }

    return {
      ...catalogVerse,
      status: storedVerse.status,
      progress: Math.min(100, Math.max(0, storedVerse.progress)),
      nextReviewAt: storedVerse.nextReviewAt,
      isFavorite: storedVerse.isFavorite,
    };
  });

const defaultPersistedState: PersistedVerseState = {
  verses: verseCatalog,
  userVerseIds: ['bhagavad-gita-2-27'],
  currentSession: null,
};

const readPersistedState = (): PersistedVerseState => {
  if (typeof window === 'undefined') {
    return defaultPersistedState;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return defaultPersistedState;
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isRecord(parsedValue)) {
      return defaultPersistedState;
    }

    const storedVerses = Array.isArray(parsedValue.verses)
      ? parsedValue.verses.filter(isStoredVerse)
      : [];
    const knownVerseIds = new Set(verseCatalog.map((verse) => verse.id));
    const userVerseIds = Array.isArray(parsedValue.userVerseIds)
      ? parsedValue.userVerseIds.filter(
        (verseId): verseId is string => typeof verseId === 'string' && knownVerseIds.has(verseId),
      )
      : defaultPersistedState.userVerseIds;
    const currentSession = isLearningSession(parsedValue.currentSession)
      && knownVerseIds.has(parsedValue.currentSession.verseId)
      ? parsedValue.currentSession
      : null;

    return {
      verses: mergeWithCatalog(storedVerses),
      userVerseIds,
      currentSession,
    };
  } catch {
    return defaultPersistedState;
  }
};

const writePersistedState = (state: VerseStore) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const persistedState: PersistedVerseState = {
      verses: state.verses,
      userVerseIds: state.userVerseIds,
      currentSession: state.currentSession,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(persistedState));
  } catch {
    // Обучение продолжает работать в памяти, если хранилище браузера недоступно.
  }
};

const addUniqueIndex = (indexes: number[], index: number) =>
  indexes.includes(index) ? indexes : [...indexes, index].sort((first, second) => first - second);

const toggleIndex = (indexes: number[], index: number) =>
  indexes.includes(index) ? indexes.filter((item) => item !== index) : [...indexes, index];

const addDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const getLinesForView = (verse: Verse, view: VerseLearningView) => {
  if (view === 'sanskrit') {
    return verse.sanskritCyrillicLines;
  }

  return verse.translationLines.length > 0
    ? verse.translationLines
    : verse.fullTranslation
      ? [verse.fullTranslation]
      : [];
};

const getSessionViewState = (
  progressState: VerseLearningProgressState,
  view: VerseLearningView,
) => (
  view === 'sanskrit'
    ? {
        lineIndex: progressState.sanskritLineIndex,
        visitedLines: progressState.sanskritVisitedLines,
      }
    : {
        lineIndex: progressState.translationLineIndex,
        visitedLines: progressState.translationVisitedLines,
      }
);

const buildSession = (verseId: string): VerseLearningSession => ({
  verseId,
  step: 'intro',
  activeView: 'sanskrit',
  currentLineIndex: 0,
  revealedLineIndexes: [],
  progressState: { ...defaultProgressState },
});

const getNextProgress = (currentProgress: number, confidence: VerseConfidence) => {
  const progressChange: Record<VerseConfidence, number> = {
    forgot: -10,
    hard: 8,
    remembered: 18,
    easy: 28,
  };

  return Math.min(100, Math.max(0, currentProgress + progressChange[confidence]));
};

const getNextStatus = (progress: number, confidence: VerseConfidence): VerseStatus => {
  if (confidence === 'forgot') {
    return 'needsReview';
  }

  if (progress >= 100) {
    return 'learned';
  }

  if (progress >= 75) {
    return 'review';
  }

  return 'learning';
};

const hydratedState = readPersistedState();

export const useVerseStore = create<VerseStore>((set) => {
  const updatePersisted = (updater: (state: VerseStore) => VerseStore) => {
    set((state) => {
      const nextState = updater(state);
      writePersistedState(nextState);

      return nextState;
    });
  };

  return {
    ...hydratedState,
    addVerseToLearning: (verseId) => {
      updatePersisted((state) => {
        if (!state.verses.some((verse) => verse.id === verseId)) {
          return state;
        }

        return {
          ...state,
          userVerseIds: state.userVerseIds.includes(verseId)
            ? state.userVerseIds
            : [...state.userVerseIds, verseId],
          verses: state.verses.map((verse) =>
            verse.id === verseId && verse.status === 'new'
              ? { ...verse, status: 'learning', nextReviewAt: getTodayDateKey() }
              : verse,
          ),
        };
      });
    },
    toggleVerseFavorite: (verseId) => {
      updatePersisted((state) => ({
        ...state,
        verses: state.verses.map((verse) =>
          verse.id === verseId ? { ...verse, isFavorite: !verse.isFavorite } : verse,
        ),
      }));
    },
    startLearningSession: (verseId) => {
      updatePersisted((state) => {
        if (!state.verses.some((verse) => verse.id === verseId)) {
          return state;
        }

        return {
          ...state,
          userVerseIds: state.userVerseIds.includes(verseId)
            ? state.userVerseIds
            : [...state.userVerseIds, verseId],
          verses: state.verses.map((verse) =>
            verse.id === verseId && verse.status === 'new'
              ? { ...verse, status: 'learning', nextReviewAt: getTodayDateKey() }
              : verse,
          ),
          currentSession: buildSession(verseId),
        };
      });
    },
    setLearningStep: (step) => {
      updatePersisted((state) => {
        if (!state.currentSession) {
          return state;
        }

        const progressState = state.currentSession.progressState;
        const nextProgressState = step === 'memorization'
          ? {
              ...progressState,
              sanskritVisitedLines: addUniqueIndex(progressState.sanskritVisitedLines, 0),
            }
          : progressState;

        return {
          ...state,
          currentSession: {
            ...state.currentSession,
            step,
            currentLineIndex: nextProgressState.sanskritLineIndex,
            revealedLineIndexes: nextProgressState.sanskritVisitedLines,
            progressState: nextProgressState,
          },
        };
      });
    },
    setLearningView: (view) => {
      updatePersisted((state) => {
        const session = state.currentSession;

        if (!session) {
          return state;
        }

        const viewState = getSessionViewState(session.progressState, view);
        const progressState = view === 'sanskrit'
          ? {
              ...session.progressState,
              sanskritVisitedLines: addUniqueIndex(
                session.progressState.sanskritVisitedLines,
                viewState.lineIndex,
              ),
            }
          : {
              ...session.progressState,
              translationVisitedLines: addUniqueIndex(
                session.progressState.translationVisitedLines,
                viewState.lineIndex,
              ),
            };
        const nextViewState = getSessionViewState(progressState, view);

        return {
          ...state,
          currentSession: {
            ...session,
            activeView: view,
            currentLineIndex: nextViewState.lineIndex,
            revealedLineIndexes: nextViewState.visitedLines,
            progressState,
          },
        };
      });
    },
    setCurrentLine: (lineIndex) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        const verse = state.verses.find((item) => item.id === session?.verseId);

        if (!session || !verse) {
          return state;
        }

        const lines = getLinesForView(verse, session.activeView);
        const nextLineIndex = Math.min(Math.max(0, lineIndex), Math.max(0, lines.length - 1));
        const progressState = session.activeView === 'sanskrit'
          ? {
              ...session.progressState,
              sanskritLineIndex: nextLineIndex,
              sanskritVisitedLines: addUniqueIndex(
                session.progressState.sanskritVisitedLines,
                nextLineIndex,
              ),
              sanskritHiddenLines: session.progressState.sanskritHiddenLines.filter(
                (index) => index !== nextLineIndex,
              ),
            }
          : {
              ...session.progressState,
              translationLineIndex: nextLineIndex,
              translationVisitedLines: addUniqueIndex(
                session.progressState.translationVisitedLines,
                nextLineIndex,
              ),
              translationHiddenLines: session.progressState.translationHiddenLines.filter(
                (index) => index !== nextLineIndex,
              ),
            };
        const viewState = getSessionViewState(progressState, session.activeView);

        return {
          ...state,
          currentSession: {
            ...session,
            currentLineIndex: nextLineIndex,
            revealedLineIndexes: viewState.visitedLines,
            progressState,
          },
        };
      });
    },
    toggleLineVisibility: (lineIndex) => {
      updatePersisted((state) => {
        const session = state.currentSession;

        if (!session) {
          return state;
        }

        return {
          ...state,
          currentSession: {
            ...session,
            progressState: session.activeView === 'sanskrit'
              ? {
                  ...session.progressState,
                  sanskritHiddenLines: toggleIndex(
                    session.progressState.sanskritHiddenLines,
                    lineIndex,
                  ),
                }
              : {
                  ...session.progressState,
                  translationHiddenLines: toggleIndex(
                    session.progressState.translationHiddenLines,
                    lineIndex,
                  ),
                },
          },
        };
      });
    },
    completeInitialLearning: () => {
      updatePersisted((state) => {
        const session = state.currentSession;
        const verse = state.verses.find((item) => item.id === session?.verseId);

        if (!session || !verse || verse.status !== 'learning' || verse.progress > 0) {
          return state;
        }

        return {
          ...state,
          verses: state.verses.map((item) =>
            item.id === verse.id
              ? {
                  ...item,
                  progress: 20,
                  status: 'learning',
                  nextReviewAt: addDays(getTodayDateKey(), 1),
                }
              : item,
          ),
          currentSession: null,
        };
      });
    },
    completeLearningSession: (confidence) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        const verse = state.verses.find((item) => item.id === session?.verseId);

        if (!session || !verse) {
          return state;
        }

        const currentLevel = Math.round(verse.progress / 20);
        const review = calculateNextReview(confidence, currentLevel);
        const progress = getNextProgress(verse.progress, confidence);

        return {
          ...state,
          verses: state.verses.map((item) =>
            item.id === verse.id
              ? {
                  ...item,
                  progress,
                  status: getNextStatus(progress, confidence),
                  nextReviewAt: addDays(getTodayDateKey(), review.nextReviewInDays),
                }
              : item,
          ),
          currentSession: {
            ...session,
            step: 'complete',
            confidence,
          },
        };
      });
    },
    resetLearningSession: () => {
      updatePersisted((state) => ({
        ...state,
        currentSession: null,
      }));
    },
  };
});
