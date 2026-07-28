import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getVerseById,
  getVerseLines,
  type VerseLearningView,
  useVerseStore,
  VerseReference,
} from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import { VerseLearningComplete } from '../../widgets/verses/VerseLearningComplete/VerseLearningComplete';
import { VerseLearningIntro } from '../../widgets/verses/VerseLearningIntro/VerseLearningIntro';
import { VerseLearningProgress } from '../../widgets/verses/VerseLearningProgress/VerseLearningProgress';
import { VerseMemorization } from '../../widgets/verses/VerseMemorization/VerseMemorization';
import styles from './VerseLearningPage.module.css';

const getCompletionPercent = (visitedCount: number, lineCount: number) => (
  lineCount === 0 ? 100 : Math.min(100, Math.round((visitedCount / lineCount) * 100))
);

export default function VerseLearningPage() {
  const { verseId } = useParams();
  const navigate = useNavigate();
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const currentSession = useVerseStore((state) => state.currentSession);
  const reviewQueue = useVerseStore((state) => state.reviewQueue);
  const startLearningSession = useVerseStore((state) => state.startLearningSession);
  const advanceReviewQueue = useVerseStore((state) => state.advanceReviewQueue);
  const setLearningStep = useVerseStore((state) => state.setLearningStep);
  const setLearningView = useVerseStore((state) => state.setLearningView);
  const setCurrentLine = useVerseStore((state) => state.setCurrentLine);
  const toggleLineVisibility = useVerseStore((state) => state.toggleLineVisibility);
  const completeInitialLearning = useVerseStore((state) => state.completeInitialLearning);
  const completeLearningSession = useVerseStore((state) => state.completeLearningSession);
  const resetLearningSession = useVerseStore((state) => state.resetLearningSession);
  const verse = getVerseById(verses, verseId);
  const session = currentSession?.verseId === verseId ? currentSession : null;
  const initializedVerseIdRef = useRef(session?.verseId);

  useDocumentTitle(
    verse
      ? `Изучение: ${verse.bookTitle} ${verse.verseNumber} — Садхана Бхакти`
      : 'Стих не найден — Садхана Бхакти',
  );

  useEffect(() => {
    if (verses.length === 0) loadVerses();
  }, [loadVerses, verses.length]);

  useEffect(() => {
    if (session) {
      initializedVerseIdRef.current = session.verseId;
      return;
    }

    if (verse && initializedVerseIdRef.current !== verse.id) {
      initializedVerseIdRef.current = verse.id;
      startLearningSession(verse.id);
    }
  }, [session, startLearningSession, verse]);

  if (!verse && isLoading) {
    return (
      <Card className={styles.loadingCard}>
        <span aria-hidden="true" />
        <p>Загружаем стих…</p>
      </Card>
    );
  }

  if (!verse) {
    return (
      <Card className={styles.stateCard}>
        <Icon name="scroll" />
        <h1>Стих не найден</h1>
        <p>Возможно, он был удалён или ссылка устарела.</p>
        <Link to="/verses">Вернуться к стихам</Link>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className={styles.loadingCard}>
        <span aria-hidden="true" />
        <p>Готовим стих к изучению…</p>
      </Card>
    );
  }

  const translationLineCount = getVerseLines(verse.translation).length;
  const sanskritPercent = getCompletionPercent(
    session.progressState.sanskritVisitedLines.length,
    getVerseLines(verse.sanskritCyrillic).length,
  );
  const translationPercent = getCompletionPercent(
    session.progressState.translationVisitedLines.length,
    translationLineCount,
  );
  const memorizationPercent = Math.round((sanskritPercent + translationPercent) / 2);
  const queueIndex = reviewQueue.indexOf(verse.id);
  const remainingInQueue = queueIndex >= 0
    ? Math.max(0, reviewQueue.length - queueIndex - 1)
    : undefined;

  const goBack = () => {
    if (session.step === 'memorization') {
      setLearningStep('intro');
      return;
    }

    navigate(`/verses/${verse.id}`);
  };

  const changeView = (view: VerseLearningView) => {
    setLearningView(view);
  };

  const finishMemorization = () => {
    const isInitialLearning = verse.sanskritProgress === 0 && verse.translationProgress === 0;

    if (isInitialLearning) {
      completeInitialLearning();
      navigate('/verses');
      return;
    }

    setLearningStep('complete');
  };

  const finishCompletedVerse = () => {
    if (remainingInQueue !== undefined) {
      const nextVerseId = advanceReviewQueue();

      navigate(nextVerseId ? `/verses/${nextVerseId}/learn` : '/verses');
      return;
    }

    resetLearningSession();
    navigate('/verses');
  };

  return (
    <section className={styles.page}>
      <header className={styles.sessionHeader}>
        <button className={styles.iconButton} type="button" aria-label="Назад" onClick={goBack}>
          ←
        </button>
        <div className={styles.sessionIdentity}>
          <VerseReference verse={verse} />
          <VerseLearningProgress
            step={session.step}
            memorizationPercent={memorizationPercent}
          />
        </div>
        <Link
          className={styles.iconButton}
          to={`/verses/${verse.id}`}
          aria-label="Закрыть обучение"
        >
          ×
        </Link>
      </header>

      <main className={styles.learningArea}>
        {session.step === 'intro' ? (
          <VerseLearningIntro
            verse={verse}
            onStart={() => setLearningStep('memorization')}
          />
        ) : null}

        {session.step === 'memorization' ? (
          <VerseMemorization
            verse={verse}
            session={session}
            onChangeView={changeView}
            onChangeLine={setCurrentLine}
            onToggleVisibility={toggleLineVisibility}
            onFinish={finishMemorization}
          />
        ) : null}

        {session.step === 'complete' ? (
          <VerseLearningComplete
            verse={verse}
            confidence={session.confidence}
            remainingInQueue={remainingInQueue}
            onSelectConfidence={completeLearningSession}
            onReturn={finishCompletedVerse}
          />
        ) : null}
      </main>
    </section>
  );
}
