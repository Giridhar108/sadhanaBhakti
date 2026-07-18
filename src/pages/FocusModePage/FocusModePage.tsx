import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { japaApi } from '../../entities/japa-session/api/japaApi';
import { dispatchJapaDailyProgressChanged } from '../../entities/japa-session/model/dailyProgressEvents';
import { defaultGoals, readAuthUser } from '../../entities/user/model/auth';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import {
  getTodayDateKey,
  normalizeJapaCompletedRounds,
  normalizeJapaDailyGoal,
} from '../../shared/lib/japaProgress';
import { JapaProgressRing } from '../MyJapaPage/components/JapaProgressRing/JapaProgressRing';
import { JapaRoundActions } from '../MyJapaPage/components/JapaRoundActions/JapaRoundActions';
import { ReflectionVerseCard } from '../MyJapaPage/components/ReflectionVerseCard';
import { readCachedDailyProgress, updateDailyProgressCache } from '../MyJapaPage/model/japaDailyProgressCache';
import { FocusAudioPlayer } from './components/FocusAudioPlayer/FocusAudioPlayer';
import styles from './FocusModePage.module.css';

const formatSessionTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
};

export default function FocusModePage() {
  useDocumentTitle('Фокус-режим - Садхана Бхакти');
  const authUser = readAuthUser();
  const todayDateKey = getTodayDateKey();
  const configuredDailyGoal = normalizeJapaDailyGoal(authUser?.goals.japaRounds ?? defaultGoals.japaRounds);
  const cachedProgress = authUser ? readCachedDailyProgress(authUser.id, todayDateKey) : undefined;
  const initialCompletedRounds = normalizeJapaCompletedRounds(cachedProgress?.rounds ?? 0);
  const initialDailyGoal = cachedProgress?.goalRounds
    ? normalizeJapaDailyGoal(cachedProgress.goalRounds)
    : configuredDailyGoal;
  const completedRoundsRef = useRef(initialCompletedRounds);
  const lastSavedCompletedRoundsRef = useRef(initialCompletedRounds);
  const saveRequestRef = useRef(0);
  const [completedRounds, setCompletedRounds] = useState(initialCompletedRounds);
  const [dailyGoal] = useState(initialDailyGoal);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionTime = useMemo(() => formatSessionTime(sessionSeconds), [sessionSeconds]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSessionSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!authUser) {
      return undefined;
    }

    let shouldIgnore = false;

    japaApi
      .getToday(todayDateKey)
      .then((progressItem) => {
        if (shouldIgnore) {
          return;
        }

        const savedRounds = normalizeJapaCompletedRounds(progressItem.rounds);

        updateDailyProgressCache(authUser.id, progressItem);
        completedRoundsRef.current = savedRounds;
        lastSavedCompletedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
      })
      .catch(() => undefined);

    return () => {
      shouldIgnore = true;
    };
  }, [authUser?.id, todayDateKey]);

  const updateCompletedRounds = (rounds: number) => {
    const nextRounds = Math.min(Math.max(rounds, 0), dailyGoal);

    completedRoundsRef.current = nextRounds;
    setCompletedRounds(nextRounds);

    if (!authUser) {
      return;
    }

    const requestId = saveRequestRef.current + 1;

    saveRequestRef.current = requestId;

    japaApi
      .updateToday({
        date: todayDateKey,
        rounds: nextRounds,
      })
      .then((progressItem) => {
        if (saveRequestRef.current !== requestId) {
          return;
        }

        const savedRounds = normalizeJapaCompletedRounds(progressItem.rounds);

        updateDailyProgressCache(authUser.id, progressItem);
        dispatchJapaDailyProgressChanged(progressItem);
        completedRoundsRef.current = savedRounds;
        lastSavedCompletedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
      })
      .catch(() => {
        if (saveRequestRef.current !== requestId) {
          return;
        }

        const savedRounds = lastSavedCompletedRoundsRef.current;

        completedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
      });
  };

  const addRounds = (rounds: number) => {
    updateCompletedRounds(completedRoundsRef.current + rounds);
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <FocusAudioPlayer />
      </header>

      <section className={styles.hero} aria-label="Фокус-режим джапы">
        <div className={styles.timer}>{sessionTime}</div>

        <JapaProgressRing
          className={styles.focusProgress}
          completedRounds={completedRounds}
          dailyJapaGoal={dailyGoal}
          onCompletedRoundsChange={updateCompletedRounds}
        />

        <JapaRoundActions onAddRounds={addRounds} onAddDailyGoal={() => addRounds(defaultGoals.japaRounds)} />

        <ReflectionVerseCard className={styles.focusVerseCard} />

        <Link className={styles.mobileExitButton} to="/japa">
          <span aria-hidden="true">↪</span>
          Выйти из фокус-режима
        </Link>
      </section>
    </main>
  );
}
