import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getPrayerBySlug,
  getPrayerVerseById,
  usePrayers,
} from '../../entities/prayer';
import {
  getVerseLines,
  type Verse,
  type VerseConfidence,
  type VerseLearningSession,
  type VerseLearningView,
  useVerseStore,
} from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import { VerseLearningComplete } from '../../widgets/verses/VerseLearningComplete/VerseLearningComplete';
import { VerseLearningIntro } from '../../widgets/verses/VerseLearningIntro/VerseLearningIntro';
import { VerseLearningProgress } from '../../widgets/verses/VerseLearningProgress/VerseLearningProgress';
import { VerseMemorization } from '../../widgets/verses/VerseMemorization/VerseMemorization';
import pageStyles from '../VerseLearningPage/VerseLearningPage.module.css';
import styles from './PrayerLearningPage.module.css';

const emptyProgressState: VerseLearningSession['progressState'] = {
  sanskritLineIndex: 0,
  translationLineIndex: 0,
  sanskritVisitedLines: [],
  translationVisitedLines: [],
  sanskritHiddenLines: [],
  translationHiddenLines: [],
};

const buildSession = (verseId: string): VerseLearningSession => ({
  verseId,
  step: 'intro',
  activeView: 'sanskrit',
  currentLineIndex: 0,
  revealedLineIndexes: [],
  progressState: { ...emptyProgressState },
});

const addUniqueIndex = (indexes: number[], index: number) =>
  indexes.includes(index)
    ? indexes
    : [...indexes, index].sort((first, second) => first - second);

const toggleIndex = (indexes: number[], index: number) =>
  indexes.includes(index)
    ? indexes.filter((item) => item !== index)
    : [...indexes, index];

const getCompletionPercent = (visitedCount: number, lineCount: number) => (
  lineCount === 0 ? 100 : Math.min(100, Math.round((visitedCount / lineCount) * 100))
);

const splitTranslation = (translation: string) => {
  const fragments = translation.match(/[^.!?]+[.!?]+|[^.!?]+$/g);

  return (fragments ?? [translation])
    .map((fragment) => fragment.trim())
    .filter(Boolean)
    .join('\n');
};

export default function PrayerLearningPage() {
  const { prayerSlug, prayerVerseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sequenceMode = searchParams.get('sequence') === '1';
  const { data: prayers, isPending } = usePrayers();
  const startPrayerVerse = useVerseStore((state) => state.startPrayerVerse);
  const markPrayerVerseAsLearned = useVerseStore((state) => state.markPrayerVerseAsLearned);
  const markPrayerVerseForReview = useVerseStore((state) => state.markPrayerVerseForReview);
  const prayerVerseProgress = useVerseStore(
    (state) => prayerVerseId ? state.prayerProgress[prayerVerseId] : undefined,
  );
  const prayer = getPrayerBySlug(prayers ?? [], prayerSlug);
  const prayerVerse = prayer ? getPrayerVerseById(prayer, prayerVerseId) : undefined;
  const [session, setSession] = useState<VerseLearningSession>(
    () => buildSession(prayerVerseId ?? ''),
  );

  const learningVerse = useMemo<Verse | null>(() => {
    if (!prayer || !prayerVerse) return null;

    const isLearned = prayerVerseProgress?.status === 'learned';
    const progress = isLearned ? 100 : prayerVerseProgress ? 20 : 0;
    const timestamp = prayerVerseProgress?.lastReviewedAt ?? new Date(0).toISOString();

    return {
      id: prayerVerse.id,
      createdById: null,
      isOwner: false,
      bookTitle: prayer.title,
      chapter: null,
      verseNumber: `Строфа ${prayerVerse.order}`,
      sanskritCyrillic: prayerVerse.russianPronunciation,
      translation: splitTranslation(prayerVerse.translation),
      catalog: 'prayers',
      catalogOrder: prayerVerse.order,
      status: isLearned ? 'learned' : prayerVerseProgress ? 'learning' : 'new',
      sanskritProgress: progress,
      translationProgress: progress,
      repetitionLevel: prayerVerseProgress?.successfulRepetitions ?? 0,
      nextReviewAt: prayerVerseProgress?.nextReviewAt ?? null,
      lastReviewedAt: prayerVerseProgress?.lastReviewedAt ?? null,
      isFavorite: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }, [prayer, prayerVerse, prayerVerseProgress]);

  useDocumentTitle(
    prayer && prayerVerse
      ? `Изучение: ${prayer.title}, строфа ${prayerVerse.order} — Садхана Бхакти`
      : 'Изучение молитвы — Садхана Бхакти',
  );

  useEffect(() => {
    if (!prayer || !prayerVerse) return;

    startPrayerVerse(prayer.id, prayerVerse.id);
    setSession((currentSession) => (
      currentSession.verseId === prayerVerse.id
        ? currentSession
        : buildSession(prayerVerse.id)
    ));
  }, [prayer, prayerVerse, startPrayerVerse]);

  if (isPending) {
    return (
      <Card className={pageStyles.loadingCard}>
        <span aria-hidden="true" />
        <p>Готовим молитву к изучению…</p>
      </Card>
    );
  }

  if (!prayer || !prayerVerse || !learningVerse) {
    return (
      <Card className={pageStyles.stateCard}>
        <Icon name="scroll" />
        <h1>Строфа не найдена</h1>
        <Link to="/verses?section=prayers">Вернуться к молитвам</Link>
      </Card>
    );
  }

  const sanskritLines = getVerseLines(learningVerse.sanskritCyrillic);
  const translationLines = getVerseLines(learningVerse.translation);
  const sanskritPercent = getCompletionPercent(
    session.progressState.sanskritVisitedLines.length,
    sanskritLines.length,
  );
  const translationPercent = getCompletionPercent(
    session.progressState.translationVisitedLines.length,
    translationLines.length,
  );
  const memorizationPercent = Math.round((sanskritPercent + translationPercent) / 2);
  const versePath = `/verses/prayers/${prayer.slug}/${prayerVerse.id}`;
  const prayerPath = `/verses/prayers/${prayer.slug}`;
  const orderedPrayerVerses = [...prayer.verses]
    .sort((first, second) => first.order - second.order);
  const currentPrayerVerseIndex = orderedPrayerVerses
    .findIndex((item) => item.id === prayerVerse.id);
  const nextPrayerVerse = orderedPrayerVerses[currentPrayerVerseIndex + 1];
  const remainingInQueue = sequenceMode
    ? Math.max(0, orderedPrayerVerses.length - currentPrayerVerseIndex - 1)
    : undefined;

  const setLearningStep = (step: VerseLearningSession['step']) => {
    setSession((currentSession) => {
      const progressState = step === 'memorization'
        ? {
            ...currentSession.progressState,
            sanskritVisitedLines: addUniqueIndex(
              currentSession.progressState.sanskritVisitedLines,
              0,
            ),
          }
        : currentSession.progressState;

      return {
        ...currentSession,
        step,
        currentLineIndex: progressState.sanskritLineIndex,
        revealedLineIndexes: progressState.sanskritVisitedLines,
        progressState,
      };
    });
  };

  const setLearningView = (view: VerseLearningView) => {
    setSession((currentSession) => {
      const lineIndex = view === 'sanskrit'
        ? currentSession.progressState.sanskritLineIndex
        : currentSession.progressState.translationLineIndex;
      const progressState = view === 'sanskrit'
        ? {
            ...currentSession.progressState,
            sanskritVisitedLines: addUniqueIndex(
              currentSession.progressState.sanskritVisitedLines,
              lineIndex,
            ),
          }
        : {
            ...currentSession.progressState,
            translationVisitedLines: addUniqueIndex(
              currentSession.progressState.translationVisitedLines,
              lineIndex,
            ),
          };

      return {
        ...currentSession,
        activeView: view,
        currentLineIndex: lineIndex,
        revealedLineIndexes: view === 'sanskrit'
          ? progressState.sanskritVisitedLines
          : progressState.translationVisitedLines,
        progressState,
      };
    });
  };

  const setCurrentLine = (lineIndex: number) => {
    setSession((currentSession) => {
      const lines = currentSession.activeView === 'sanskrit'
        ? sanskritLines
        : translationLines;
      const nextIndex = Math.min(
        Math.max(0, lineIndex),
        Math.max(0, lines.length - 1),
      );
      const progressState = currentSession.activeView === 'sanskrit'
        ? {
            ...currentSession.progressState,
            sanskritLineIndex: nextIndex,
            sanskritVisitedLines: addUniqueIndex(
              currentSession.progressState.sanskritVisitedLines,
              nextIndex,
            ),
            sanskritHiddenLines: currentSession.progressState.sanskritHiddenLines
              .filter((index) => index !== nextIndex),
          }
        : {
            ...currentSession.progressState,
            translationLineIndex: nextIndex,
            translationVisitedLines: addUniqueIndex(
              currentSession.progressState.translationVisitedLines,
              nextIndex,
            ),
            translationHiddenLines: currentSession.progressState.translationHiddenLines
              .filter((index) => index !== nextIndex),
          };

      return {
        ...currentSession,
        currentLineIndex: nextIndex,
        revealedLineIndexes: currentSession.activeView === 'sanskrit'
          ? progressState.sanskritVisitedLines
          : progressState.translationVisitedLines,
        progressState,
      };
    });
  };

  const toggleLineVisibility = (lineIndex: number) => {
    setSession((currentSession) => ({
      ...currentSession,
      progressState: currentSession.activeView === 'sanskrit'
        ? {
            ...currentSession.progressState,
            sanskritHiddenLines: toggleIndex(
              currentSession.progressState.sanskritHiddenLines,
              lineIndex,
            ),
          }
        : {
            ...currentSession.progressState,
            translationHiddenLines: toggleIndex(
              currentSession.progressState.translationHiddenLines,
              lineIndex,
            ),
          },
    }));
  };

  const selectConfidence = (confidence: VerseConfidence) => {
    if (confidence === 'remembered' || confidence === 'easy') {
      markPrayerVerseAsLearned(prayer.id, prayerVerse.id);
    } else {
      markPrayerVerseForReview(prayer.id, prayerVerse.id);
    }

    setSession((currentSession) => ({
      ...currentSession,
      step: 'complete',
      confidence,
    }));
  };

  const goBack = () => {
    if (session.step === 'memorization') {
      setLearningStep('intro');
      return;
    }

    navigate(versePath);
  };

  return (
    <section className={pageStyles.page}>
      <header className={pageStyles.sessionHeader}>
        <button className={pageStyles.iconButton} type="button" aria-label="Назад" onClick={goBack}>
          <Icon name="back" />
        </button>
        <div className={pageStyles.sessionIdentity}>
          <div className={styles.prayerReference}>
            <strong>{prayer.title}</strong>
            <span>Строфа {prayerVerse.order}</span>
          </div>
          <VerseLearningProgress
            step={session.step}
            memorizationPercent={memorizationPercent}
          />
        </div>
        <Link className={pageStyles.iconButton} to={versePath} aria-label="Закрыть обучение">
          ×
        </Link>
      </header>

      <main className={pageStyles.learningArea}>
        {session.step === 'intro' ? (
          <VerseLearningIntro
            verse={learningVerse}
            heading="Познакомься со строфой"
            description="Сначала спокойно прочитай санскрит и перевод целиком."
            onStart={() => setLearningStep('memorization')}
          />
        ) : null}

        {session.step === 'memorization' ? (
          <VerseMemorization
            verse={learningVerse}
            session={session}
            onChangeView={setLearningView}
            onChangeLine={setCurrentLine}
            onToggleVisibility={toggleLineVisibility}
            onFinish={() => setLearningStep('complete')}
          />
        ) : null}

        {session.step === 'complete' ? (
          <VerseLearningComplete
            verse={learningVerse}
            confidence={session.confidence}
            remainingInQueue={remainingInQueue}
            completionTitle={`Ты повторил строфу ${prayerVerse.order} молитвы «${prayer.title}»`}
            question="Насколько легко удалось вспомнить строфу?"
            returnLabel="Вернуться к молитве"
            nextLabel="Следующая строфа"
            queueCompleteLabel="Завершить повторение молитвы"
            onSelectConfidence={selectConfidence}
            onReturn={() => {
              if (sequenceMode && nextPrayerVerse) {
                navigate(`/verses/prayers/${prayer.slug}/${nextPrayerVerse.id}/learn?sequence=1`);
                return;
              }

              navigate(prayerPath);
            }}
          />
        ) : null}
      </main>
    </section>
  );
}
