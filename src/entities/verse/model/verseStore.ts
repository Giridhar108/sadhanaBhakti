import { create } from 'zustand';
import { readAuthUser } from '../../user/model/auth';
import { verseApi, type VerseProgressPatch } from '../api/verseApi';
import { calculateInitialReviewAt } from '../lib/calculateInitialReviewAt';
import { calculateNextReview } from '../lib/calculateNextReview';
import { getTodayDateKey, getVerseLines } from './verseSelectors';
import type {
  UserVerse,
  VerseConfidence,
  VerseEditorValues,
  VerseLearningProgressState,
  VerseLearningSession,
  VerseLearningView,
  VerseStore,
} from './types';

const storageKey = 'hare-krishna-user-verses';
const storageOwnerId = readAuthUser()?.id ?? 'preview';

type PersistedState = {
  ownerId: string;
  verses: UserVerse[];
  prayerProgress: VerseStore['prayerProgress'];
  currentSession: VerseLearningSession | null;
  reviewQueue: string[];
};

const emptyProgressState: VerseLearningProgressState = {
  sanskritLineIndex: 0,
  translationLineIndex: 0,
  sanskritVisitedLines: [],
  translationVisitedLines: [],
  sanskritHiddenLines: [],
  translationHiddenLines: [],
};

const emptyPersistedState = {
  verses: [],
  prayerProgress: {},
  currentSession: null,
  reviewQueue: [],
} satisfies Pick<VerseStore, 'verses' | 'prayerProgress' | 'currentSession' | 'reviewQueue'>;

const readPersistedState = (): Pick<
  VerseStore,
  'verses' | 'prayerProgress' | 'currentSession' | 'reviewQueue'
> => {
  if (typeof window === 'undefined') return emptyPersistedState;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as PersistedState | null;
    if (!parsed || parsed.ownerId !== storageOwnerId || !Array.isArray(parsed.verses)) {
      return emptyPersistedState;
    }
    return {
      verses: parsed.verses,
      prayerProgress: parsed.prayerProgress && typeof parsed.prayerProgress === 'object'
        ? parsed.prayerProgress
        : {},
      currentSession: parsed.currentSession ?? null,
      reviewQueue: Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : [],
    };
  } catch {
    return emptyPersistedState;
  }
};

const writePersistedState = (state: VerseStore) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      ownerId: storageOwnerId,
      verses: state.verses,
      prayerProgress: state.prayerProgress,
      currentSession: state.currentSession,
      reviewQueue: state.reviewQueue,
    } satisfies PersistedState));
  } catch {
    // Состояние продолжает работать в памяти, если хранилище недоступно.
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

const buildLocalVerse = (values: VerseEditorValues): UserVerse => {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `verse-${Date.now()}`,
    createdById: storageOwnerId,
    isOwner: true,
    bookTitle: values.bookTitle,
    chapter: values.chapter || null,
    verseNumber: values.verseNumber,
    sanskritCyrillic: values.sanskritCyrillic,
    translation: values.translation,
    catalog: null,
    catalogOrder: null,
    status: 'new',
    sanskritProgress: 0,
    translationProgress: 0,
    repetitionLevel: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
};

const buildSession = (verseId: string): VerseLearningSession => ({
  verseId,
  step: 'intro',
  activeView: 'sanskrit',
  currentLineIndex: 0,
  revealedLineIndexes: [],
  progressState: { ...emptyProgressState },
});

const getLines = (verse: UserVerse, view: VerseLearningView) =>
  getVerseLines(view === 'sanskrit' ? verse.sanskritCyrillic : verse.translation);

const pendingRemotePatches = new Map<string, VerseProgressPatch>();
const pendingRemoteWrites = new Map<string, Promise<void>>();

const queueRemoteVersePatch = (verseId: string, patch: VerseProgressPatch): Promise<void> => {
  if (!readAuthUser()) return Promise.resolve();

  pendingRemotePatches.set(verseId, {
    ...pendingRemotePatches.get(verseId),
    ...patch,
  });

  const activeWrite = pendingRemoteWrites.get(verseId);
  if (activeWrite) return activeWrite;

  const flushPatches = async () => {
    while (pendingRemotePatches.has(verseId)) {
      const nextPatch = pendingRemotePatches.get(verseId);
      if (!nextPatch) return;

      pendingRemotePatches.delete(verseId);

      try {
        await verseApi.update(verseId, nextPatch);
      } catch (error) {
        pendingRemotePatches.set(verseId, {
          ...nextPatch,
          ...pendingRemotePatches.get(verseId),
        });
        throw error;
      }
    }
  };

  let writeFailed = false;
  const write = flushPatches()
    .catch(() => {
      writeFailed = true;
    })
    .finally(() => {
      pendingRemoteWrites.delete(verseId);

      const nextPatch = pendingRemotePatches.get(verseId);
      if (!writeFailed && nextPatch) {
        void queueRemoteVersePatch(verseId, nextPatch);
      }
    });

  pendingRemoteWrites.set(verseId, write);
  return write;
};

const flushPendingRemotePatches = () => {
  pendingRemotePatches.forEach((patch, verseId) => {
    if (!pendingRemoteWrites.has(verseId)) {
      void queueRemoteVersePatch(verseId, patch);
    }
  });

  return Promise.all([...pendingRemoteWrites.values()]).then(() => undefined);
};

const initialState = readPersistedState();

export const useVerseStore = create<VerseStore>((set, get) => {
  const updatePersisted = (updater: (state: VerseStore) => VerseStore) => {
    set((state) => {
      const nextState = updater(state);
      writePersistedState(nextState);
      return nextState;
    });
  };

  return {
    ...initialState,
    isLoading: false,
    error: null,
    loadVerses: () => {
      if (!readAuthUser()) {
        set({ isLoading: false, error: null });
        return Promise.resolve();
      }
      set({ isLoading: true, error: null });
      return flushPendingRemotePatches()
        .then(() => verseApi.getAll())
        .then((verses) => {
          set((state) => {
            const nextVerses = verses.map((verse) => {
              const pendingPatch = pendingRemotePatches.get(verse.id);

              return pendingPatch ? { ...verse, ...pendingPatch } : verse;
            });
            const nextState = {
              ...state,
              verses: nextVerses,
              isLoading: false,
              error: null,
            };
            writePersistedState(nextState);
            return nextState;
          });
        })
        .catch(() => {
          set((state) => ({
            isLoading: false,
            error: state.verses.length === 0
              ? 'Не удалось загрузить стихи. Попробуй обновить страницу.'
              : null,
          }));
        });
    },
    createVerse: (values) => {
      const request = readAuthUser() ? verseApi.create(values) : Promise.resolve(buildLocalVerse(values));
      return request.then((verse) => {
        updatePersisted((state) => ({
          ...state,
          verses: [verse, ...state.verses.filter((item) => item.id !== verse.id)],
        }));
        return verse;
      });
    },
    updateVerse: (verseId, values) => {
      const currentVerse = get().verses.find((verse) => verse.id === verseId);
      if (!currentVerse) return Promise.reject(new Error('Стих не найден'));
      const request = readAuthUser()
        ? verseApi.update(verseId, values)
        : Promise.resolve({
            ...currentVerse,
            ...values,
            chapter: values.chapter || null,
            updatedAt: new Date().toISOString(),
          });
      return request.then((verse) => {
        updatePersisted((state) => ({
          ...state,
          verses: state.verses.map((item) => item.id === verseId ? verse : item),
        }));
        return verse;
      });
    },
    deleteVerse: (verseId) => {
      const request = readAuthUser() ? verseApi.delete(verseId).then(() => undefined) : Promise.resolve();
      return request.then(() => {
        updatePersisted((state) => ({
          ...state,
          verses: state.verses.filter((verse) => verse.id !== verseId),
          currentSession: state.currentSession?.verseId === verseId ? null : state.currentSession,
          reviewQueue: state.reviewQueue.filter((item) => item !== verseId),
        }));
      });
    },
    removeVerseFromLearning: (verseId) => {
      const currentVerse = get().verses.find((verse) => verse.id === verseId);
      if (!currentVerse) return Promise.reject(new Error('Стих не найден'));

      const resetPatch: VerseProgressPatch = {
        status: 'new',
        sanskritProgress: 0,
        translationProgress: 0,
        repetitionLevel: 0,
        nextReviewAt: null,
        lastReviewedAt: null,
      };

      const request = readAuthUser()
        ? (async () => {
            await pendingRemoteWrites.get(verseId);
            pendingRemotePatches.delete(verseId);
            return verseApi.update(verseId, resetPatch);
          })()
        : Promise.resolve({ ...currentVerse, ...resetPatch });

      return request.then((verse) => {
        updatePersisted((state) => ({
          ...state,
          verses: state.verses.map((item) => item.id === verseId ? verse : item),
          currentSession: state.currentSession?.verseId === verseId ? null : state.currentSession,
          reviewQueue: state.reviewQueue.filter((item) => item !== verseId),
        }));
      });
    },
    toggleVerseFavorite: (verseId) => {
      const verse = get().verses.find((item) => item.id === verseId);
      if (!verse) return;
      const isFavorite = !verse.isFavorite;
      updatePersisted((state) => ({
        ...state,
        verses: state.verses.map((item) => item.id === verseId ? { ...item, isFavorite } : item),
      }));
      void queueRemoteVersePatch(verseId, { isFavorite });
    },
    startLearningSession: (verseId) => {
      const verse = get().verses.find((item) => item.id === verseId);
      if (!verse) return;
      const status = verse.status === 'new' ? 'learning' : verse.status;
      updatePersisted((state) => ({
        ...state,
        verses: state.verses.map((item) => item.id === verseId ? { ...item, status } : item),
        currentSession: buildSession(verseId),
        reviewQueue: [],
      }));
      if (status !== verse.status) void queueRemoteVersePatch(verseId, { status });
    },
    startReviewQueue: (verseIds) => {
      const availableVerseIds = new Set(get().verses.map((verse) => verse.id));
      const queue = [...new Set(verseIds)].filter((verseId) => availableVerseIds.has(verseId));
      const firstVerseId = queue[0];

      if (!firstVerseId) {
        return null;
      }

      updatePersisted((state) => ({
        ...state,
        currentSession: buildSession(firstVerseId),
        reviewQueue: queue,
      }));

      return firstVerseId;
    },
    advanceReviewQueue: () => {
      const state = get();
      const currentVerseId = state.currentSession?.verseId;
      const currentIndex = currentVerseId ? state.reviewQueue.indexOf(currentVerseId) : -1;
      const remainingQueue = state.reviewQueue
        .slice(currentIndex >= 0 ? currentIndex + 1 : 0)
        .filter((verseId) => state.verses.some((verse) => verse.id === verseId));
      const nextVerseId = remainingQueue[0] ?? null;

      updatePersisted((currentState) => ({
        ...currentState,
        currentSession: nextVerseId ? buildSession(nextVerseId) : null,
        reviewQueue: remainingQueue,
      }));

      return nextVerseId;
    },
    setLearningStep: (step) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        if (!session) return state;
        const progressState = step === 'memorization'
          ? {
              ...session.progressState,
              sanskritVisitedLines: addUniqueIndex(session.progressState.sanskritVisitedLines, 0),
            }
          : session.progressState;
        return {
          ...state,
          currentSession: {
            ...session,
            step,
            currentLineIndex: progressState.sanskritLineIndex,
            revealedLineIndexes: progressState.sanskritVisitedLines,
            progressState,
          },
        };
      });
    },
    setLearningView: (view) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        if (!session) return state;
        const index = view === 'sanskrit'
          ? session.progressState.sanskritLineIndex
          : session.progressState.translationLineIndex;
        const progressState = view === 'sanskrit'
          ? { ...session.progressState, sanskritVisitedLines: addUniqueIndex(session.progressState.sanskritVisitedLines, index) }
          : { ...session.progressState, translationVisitedLines: addUniqueIndex(session.progressState.translationVisitedLines, index) };
        return {
          ...state,
          currentSession: {
            ...session,
            activeView: view,
            currentLineIndex: index,
            revealedLineIndexes: view === 'sanskrit' ? progressState.sanskritVisitedLines : progressState.translationVisitedLines,
            progressState,
          },
        };
      });
    },
    setCurrentLine: (lineIndex) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        const verse = state.verses.find((item) => item.id === session?.verseId);
        if (!session || !verse) return state;
        const lines = getLines(verse, session.activeView);
        const nextIndex = Math.min(Math.max(0, lineIndex), Math.max(0, lines.length - 1));
        const progressState = session.activeView === 'sanskrit'
          ? {
              ...session.progressState,
              sanskritLineIndex: nextIndex,
              sanskritVisitedLines: addUniqueIndex(session.progressState.sanskritVisitedLines, nextIndex),
              sanskritHiddenLines: session.progressState.sanskritHiddenLines.filter((index) => index !== nextIndex),
            }
          : {
              ...session.progressState,
              translationLineIndex: nextIndex,
              translationVisitedLines: addUniqueIndex(session.progressState.translationVisitedLines, nextIndex),
              translationHiddenLines: session.progressState.translationHiddenLines.filter((index) => index !== nextIndex),
            };
        return {
          ...state,
          currentSession: {
            ...session,
            currentLineIndex: nextIndex,
            revealedLineIndexes: session.activeView === 'sanskrit'
              ? progressState.sanskritVisitedLines
              : progressState.translationVisitedLines,
            progressState,
          },
        };
      });
    },
    toggleLineVisibility: (lineIndex) => {
      updatePersisted((state) => {
        const session = state.currentSession;
        if (!session) return state;
        return {
          ...state,
          currentSession: {
            ...session,
            progressState: session.activeView === 'sanskrit'
              ? { ...session.progressState, sanskritHiddenLines: toggleIndex(session.progressState.sanskritHiddenLines, lineIndex) }
              : { ...session.progressState, translationHiddenLines: toggleIndex(session.progressState.translationHiddenLines, lineIndex) },
          },
        };
      });
    },
    completeInitialLearning: () => {
      const session = get().currentSession;
      const verse = get().verses.find((item) => item.id === session?.verseId);
      if (!session || !verse || verse.sanskritProgress > 0 || verse.translationProgress > 0) return;
      const patch: VerseProgressPatch = {
        status: 'learning',
        sanskritProgress: 20,
        translationProgress: 20,
        repetitionLevel: 1,
        nextReviewAt: calculateInitialReviewAt(),
      };
      updatePersisted((state) => ({
        ...state,
        verses: state.verses.map((item) => item.id === verse.id ? { ...item, ...patch } : item),
        currentSession: null,
      }));
      void queueRemoteVersePatch(verse.id, patch);
    },
    completeLearningSession: (confidence: VerseConfidence) => {
      const session = get().currentSession;
      const verse = get().verses.find((item) => item.id === session?.verseId);
      if (!session || !verse) return;
      const review = calculateNextReview(confidence, verse.repetitionLevel);
      const delta: Record<VerseConfidence, number> = { forgot: -10, hard: 8, remembered: 18, easy: 28 };
      const updateProgress = (value: number) => Math.min(100, Math.max(0, value + delta[confidence]));
      const sanskritProgress = updateProgress(verse.sanskritProgress);
      const translationProgress = updateProgress(verse.translationProgress);
      const average = Math.round((sanskritProgress + translationProgress) / 2);
      const patch: VerseProgressPatch = {
        sanskritProgress,
        translationProgress,
        repetitionLevel: review.nextLevel,
        status: confidence === 'forgot' ? 'needsReview' : average >= 100 ? 'learned' : average >= 75 ? 'review' : 'learning',
        nextReviewAt: addDays(getTodayDateKey(), review.nextReviewInDays),
        lastReviewedAt: new Date().toISOString(),
      };
      updatePersisted((state) => ({
        ...state,
        verses: state.verses.map((item) => item.id === verse.id ? { ...item, ...patch } : item),
        currentSession: { ...session, step: 'complete', confidence },
      }));
      void queueRemoteVersePatch(verse.id, patch);
    },
    resetLearningSession: () => updatePersisted((state) => ({
      ...state,
      currentSession: null,
      reviewQueue: [],
    })),
    startPrayerVerse: (prayerId, verseId) => {
      updatePersisted((state) => {
        const current = state.prayerProgress[verseId];

        return {
          ...state,
          prayerProgress: {
            ...state.prayerProgress,
            [verseId]: {
              prayerId,
              verseId,
              status: current?.status === 'learned' ? 'learned' : 'learning',
              successfulRepetitions: current?.successfulRepetitions ?? 0,
              lastReviewedAt: current?.lastReviewedAt,
              nextReviewAt: current?.nextReviewAt,
            },
          },
        };
      });
    },
    markPrayerVerseAsLearned: (prayerId, verseId) => {
      updatePersisted((state) => {
        const current = state.prayerProgress[verseId];
        const lastReviewedAt = new Date().toISOString();
        const nextReviewAt = addDays(getTodayDateKey(), 3);

        return {
          ...state,
          prayerProgress: {
            ...state.prayerProgress,
            [verseId]: {
              prayerId,
              verseId,
              status: 'learned',
              successfulRepetitions: (current?.successfulRepetitions ?? 0) + 1,
              lastReviewedAt,
              nextReviewAt,
            },
          },
        };
      });
    },
    markPrayerVerseForReview: (prayerId, verseId) => {
      updatePersisted((state) => {
        const current = state.prayerProgress[verseId];

        return {
          ...state,
          prayerProgress: {
            ...state.prayerProgress,
            [verseId]: {
              prayerId,
              verseId,
              status: 'learning',
              successfulRepetitions: current?.successfulRepetitions ?? 0,
              lastReviewedAt: new Date().toISOString(),
              nextReviewAt: getTodayDateKey(),
            },
          },
        };
      });
    },
  };
});
