import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { getAudioTrackUrl, useAudioTracks } from '../../entities/audio/model/audioQueries';
import { japaApi } from '../../entities/japa-session/api/japaApi';
import {
  type JapaDailyProgressChangedDetail,
  japaDailyProgressChanged,
} from '../../entities/japa-session/model/dailyProgressEvents';
import type { JapaDailyProgress } from '../../entities/japa-session/model/types';
import { defaultGoals, readAuthUser } from '../../entities/user/model/auth';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import {
  JAPA_MANTRAS_PER_ROUND,
  calculateJapaMantraProgress,
  getTodayDateKey,
  normalizeJapaCompletedRounds,
  normalizeJapaDailyGoal,
} from '../../shared/lib/japaProgress';
import { AudioPracticeCard, waveformBarsCount } from './components/AudioPracticeCard';
import { JapaTodayCard } from './components/JapaTodayCard';
import { KaliModal } from './components/KaliModal';
import { OverallProgressCard } from './components/OverallProgressCard';
import { ReflectionVerseCard } from './components/ReflectionVerseCard';
import { RhythmCard } from './components/RhythmCard';
import { SessionCard } from './components/SessionCard';
import {
  getCachedDailyProgress,
  getCachedDailyProgressHistory,
  readCachedDailyProgress,
  readCachedDailyProgressHistory,
  updateDailyProgressCache,
} from './model/japaDailyProgressCache';
import styles from './MyJapaPage.module.css';

const getInitialDailyJapaGoal = () =>
  normalizeJapaDailyGoal(readAuthUser()?.goals.japaRounds ?? defaultGoals.japaRounds);

const formatSessionTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
};

export default function MyJapaPage() {
  useDocumentTitle('Джапа - Садхана Бхакти');
  const authUser = readAuthUser();
  const configuredDailyJapaGoal = useMemo(() => getInitialDailyJapaGoal(), []);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const japaStartDate = authUser?.settings.japaStartDate ?? null;
  const japaGoalHistory = authUser?.settings.japaGoalHistory ?? [];
  const initialDailyProgress = authUser ? readCachedDailyProgress(authUser.id, todayDateKey) : undefined;
  const initialCompletedRounds = normalizeJapaCompletedRounds(initialDailyProgress?.rounds ?? 0);
  const initialDailyJapaGoal = initialDailyProgress?.goalRounds
    ? normalizeJapaDailyGoal(initialDailyProgress.goalRounds)
    : configuredDailyJapaGoal;
  const initialDailyProgressHistory = authUser && japaStartDate
    ? readCachedDailyProgressHistory(authUser.id, {
      from: japaStartDate,
      to: todayDateKey,
    }) ?? []
    : [];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completedRoundsRef = useRef(initialCompletedRounds);
  const lastSavedCompletedRoundsRef = useRef(initialCompletedRounds);
  const saveCompletedRoundsRequestRef = useRef(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(initialCompletedRounds);
  const [dailyJapaGoalInput, setDailyJapaGoalInput] = useState(() => String(initialDailyJapaGoal));
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.72);
  const [audioStatus, setAudioStatus] = useState('');
  const {
    data: audioTracks = [],
    isError: isAudioTracksError,
    isLoading: isAudioTracksLoading,
  } = useAudioTracks();
  const [dailyProgressHistory, setDailyProgressHistory] = useState<JapaDailyProgress[]>(initialDailyProgressHistory);
  const [isKaliModalOpen, setIsKaliModalOpen] = useState(false);
  const dailyJapaGoal = normalizeJapaDailyGoal(Number(dailyJapaGoalInput));
  const sessionTime = useMemo(() => formatSessionTime(sessionSeconds), [sessionSeconds]);
  const sessionActionLabel = isSessionRunning ? 'Пауза' : sessionSeconds > 0 ? 'Продолжить' : 'Начать';
  const sessionActionIcon = isSessionRunning ? 'Ⅱ' : '▶';
  const selectedAudioTrack = audioTracks.find((track) => track.id === selectedAudioId) ?? audioTracks[0];
  const selectedAudioIndex = selectedAudioTrack ? audioTracks.findIndex((track) => track.id === selectedAudioTrack.id) : -1;
  const audioSource = selectedAudioTrack ? getAudioTrackUrl(selectedAudioTrack) : undefined;
  const audioProgress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
  const waveformProgress = Math.min(Math.max(audioProgress, 0), 1);
  const activeWaveformBars = Math.round(waveformProgress * waveformBarsCount);
  const audioTitle = isAudioTracksLoading && audioTracks.length === 0
    ? 'Загружаем аудио...'
    : selectedAudioTrack?.title ?? 'Аудио не выбрано';
  const audioSubtitle = isAudioTracksLoading && audioTracks.length === 0
    ? 'Подготавливаем плеер для практики'
    : selectedAudioTrack?.subtitle || 'Загрузи аудио в настройках';
  const audioStatusMessage = isAudioTracksError
    ? 'Не удалось загрузить список аудио.'
    : audioStatus;
  const totalJapaProgress = useMemo(
    () =>
      calculateJapaMantraProgress(
        japaStartDate,
        new Date(),
        configuredDailyJapaGoal,
        japaGoalHistory,
        completedRounds,
        dailyProgressHistory,
      ),
    [completedRounds, configuredDailyJapaGoal, dailyProgressHistory, japaGoalHistory, japaStartDate],
  );
  const totalCompletedRounds = Math.floor(totalJapaProgress.completedMantras / JAPA_MANTRAS_PER_ROUND);

  useEffect(() => {
    completedRoundsRef.current = completedRounds;
  }, [completedRounds]);

  useEffect(() => {
    if (!isKaliModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsKaliModalOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isKaliModalOpen]);

  useEffect(() => {
    if (!isSessionRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSessionSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isSessionRunning]);

  useEffect(() => {
    if (!authUser) {
      return undefined;
    }

    let shouldIgnore = false;

    getCachedDailyProgress(authUser.id, todayDateKey)
      .then((progress) => {
        if (shouldIgnore) {
          return;
        }

        const savedRounds = normalizeJapaCompletedRounds(progress.rounds);
        const savedGoal = progress.goalRounds ? normalizeJapaDailyGoal(progress.goalRounds) : configuredDailyJapaGoal;

        completedRoundsRef.current = savedRounds;
        lastSavedCompletedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
        setDailyJapaGoalInput(String(savedGoal));
      })
      .catch(() => {
        if (!shouldIgnore) {
          completedRoundsRef.current = 0;
          lastSavedCompletedRoundsRef.current = 0;
          setCompletedRounds(0);
        }
      });

    return () => {
      shouldIgnore = true;
    };
  }, [authUser?.id, configuredDailyJapaGoal, todayDateKey]);

  useEffect(() => {
    if (!authUser || !japaStartDate) {
      setDailyProgressHistory([]);
      return undefined;
    }

    let shouldIgnore = false;

    getCachedDailyProgressHistory(authUser.id, {
      from: japaStartDate,
      to: todayDateKey,
    })
      .then((progressHistory) => {
        if (!shouldIgnore) {
          setDailyProgressHistory(progressHistory);
        }
      })
      .catch(() => {
        if (!shouldIgnore) {
          setDailyProgressHistory([]);
        }
      });

    return () => {
      shouldIgnore = true;
    };
  }, [authUser?.id, japaStartDate, todayDateKey]);

  useEffect(() => {
    if (!authUser) {
      return undefined;
    }

    const handleDailyProgressChange = (event: Event) => {
      const { progress } = (event as CustomEvent<JapaDailyProgressChangedDetail>).detail;

      updateDailyProgressCache(authUser.id, progress);

      if (progress.date === todayDateKey) {
        const savedRounds = normalizeJapaCompletedRounds(progress.rounds);

        completedRoundsRef.current = savedRounds;
        lastSavedCompletedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
      }

      if (!japaStartDate || progress.date < japaStartDate || progress.date > todayDateKey) {
        return;
      }

      setDailyProgressHistory((currentHistory) => [
        ...currentHistory.filter((historyItem) => historyItem.date !== progress.date),
        progress,
      ].sort((firstItem, secondItem) => firstItem.date.localeCompare(secondItem.date)));
    };

    window.addEventListener(japaDailyProgressChanged, handleDailyProgressChange);

    return () => {
      window.removeEventListener(japaDailyProgressChanged, handleDailyProgressChange);
    };
  }, [authUser?.id, japaStartDate, todayDateKey]);

  useEffect(() => {
    setSelectedAudioId((currentTrackId) => {
      if (audioTracks.some((track) => track.id === currentTrackId)) {
        return currentTrackId;
      }

      return audioTracks[0]?.id ?? '';
    });
  }, [audioTracks]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.load();
    audio.volume = audioVolume;
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  }, [audioSource]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const handleSessionToggle = () => {
    setIsSessionRunning((currentState) => !currentState);
  };

  const handleSessionStop = () => {
    setIsSessionRunning(false);
    setSessionSeconds(0);
  };

  const saveCompletedRounds = (rounds: number) => {
    if (!authUser) {
      return;
    }

    const requestId = saveCompletedRoundsRequestRef.current + 1;

    saveCompletedRoundsRequestRef.current = requestId;

    japaApi
      .updateToday({
        date: todayDateKey,
        rounds,
        goalRounds: dailyJapaGoal,
      })
      .then((progress) => {
        if (saveCompletedRoundsRequestRef.current !== requestId) {
          return;
        }

        const savedRounds = normalizeJapaCompletedRounds(progress.rounds);

        updateDailyProgressCache(authUser.id, progress);
        completedRoundsRef.current = savedRounds;
        lastSavedCompletedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
        setDailyProgressHistory((currentHistory) => [
          ...currentHistory.filter((historyItem) => historyItem.date !== progress.date),
          progress,
        ].sort((firstItem, secondItem) => firstItem.date.localeCompare(secondItem.date)));
      })
      .catch(() => {
        if (saveCompletedRoundsRequestRef.current !== requestId) {
          return;
        }

        const savedRounds = lastSavedCompletedRoundsRef.current;

        completedRoundsRef.current = savedRounds;
        setCompletedRounds(savedRounds);
      });
  };

  const updateCompletedRounds = (rounds: number) => {
    const nextRounds = Math.min(Math.max(rounds, 0), dailyJapaGoal);

    completedRoundsRef.current = nextRounds;
    setCompletedRounds(nextRounds);
    saveCompletedRounds(nextRounds);
  };

  const saveDailyJapaGoal = (goalRounds: number) => {
    if (!authUser) {
      return;
    }

    void japaApi.updateToday({
      date: todayDateKey,
      goalRounds,
    }).then((progress) => {
      updateDailyProgressCache(authUser.id, progress);
      setDailyProgressHistory((currentHistory) => [
        ...currentHistory.filter((historyItem) => historyItem.date !== progress.date),
        progress,
      ].sort((firstItem, secondItem) => firstItem.date.localeCompare(secondItem.date)));
    });
  };

  const addCompletedRounds = (rounds: number) => {
    updateCompletedRounds(completedRoundsRef.current + rounds);
  };

  const handleAddDailyGoal = () => {
    updateCompletedRounds(completedRoundsRef.current + defaultGoals.japaRounds);
  };

  const handleDailyGoalChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setDailyJapaGoalInput(value);
    }
  };

  const handleDailyGoalBlur = () => {
    const nextGoal = dailyJapaGoal;

    setDailyJapaGoalInput(String(nextGoal));
    saveDailyJapaGoal(nextGoal);
  };

  const handleAudioToggle = async () => {
    const audio = audioRef.current;

    if (!audio || !selectedAudioTrack) {
      setAudioStatus('Сначала загрузи аудио в настройках.');
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsAudioPlaying(true);
        setAudioStatus('');
      } catch {
        setAudioStatus('Не удалось запустить аудио.');
      }
      return;
    }

    audio.pause();
    setIsAudioPlaying(false);
  };

  const selectRelativeTrack = (direction: -1 | 1) => {
    if (audioTracks.length === 0 || selectedAudioIndex < 0) {
      return;
    }

    const nextIndex = (selectedAudioIndex + direction + audioTracks.length) % audioTracks.length;

    setSelectedAudioId(audioTracks[nextIndex].id);
  };

  const handleAudioSeek = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;

    if (!audio || audioDuration <= 0) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    const nextTime = progress * audioDuration;

    audio.currentTime = nextTime;
    setAudioCurrentTime(nextTime);
  };

  const handleVolumeChange = (value: string) => {
    const nextVolume = Number(value);

    setAudioVolume(nextVolume);

    if (audioRef.current) {
      audioRef.current.volume = nextVolume;
    }
  };

  return (
    <>
        <section className={styles.dashboard} aria-label="Моя джапа">
          <JapaTodayCard
            completedRounds={completedRounds}
            dailyJapaGoal={dailyJapaGoal}
            dailyJapaGoalInput={dailyJapaGoalInput}
            onAddRounds={addCompletedRounds}
            onAddDailyGoal={handleAddDailyGoal}
            onDailyGoalChange={handleDailyGoalChange}
            onDailyGoalBlur={handleDailyGoalBlur}
          />

          <SessionCard
            sessionTime={sessionTime}
            actionIcon={sessionActionIcon}
            actionLabel={sessionActionLabel}
            isSessionRunning={isSessionRunning}
            onSessionToggle={handleSessionToggle}
            onSessionStop={handleSessionStop}
          />

          <AudioPracticeCard
            audioRef={audioRef}
            audioSource={audioSource}
            audioTitle={audioTitle}
            audioSubtitle={audioSubtitle}
            audioTracks={audioTracks}
            selectedAudioTrack={selectedAudioTrack}
            audioCurrentTime={audioCurrentTime}
            audioDuration={audioDuration}
            audioVolume={audioVolume}
            waveformProgress={waveformProgress}
            activeWaveformBars={activeWaveformBars}
            audioStatusMessage={audioStatusMessage}
            isAudioPlaying={isAudioPlaying}
            onAudioLoadedMetadata={setAudioDuration}
            onAudioTimeUpdate={setAudioCurrentTime}
            onAudioPause={() => setIsAudioPlaying(false)}
            onAudioPlay={() => setIsAudioPlaying(true)}
            onAudioEnded={() => setIsAudioPlaying(false)}
            onSelectedAudioChange={setSelectedAudioId}
            onAudioSeek={handleAudioSeek}
            onSelectRelativeTrack={selectRelativeTrack}
            onAudioToggle={handleAudioToggle}
            onVolumeChange={handleVolumeChange}
          />

          <RhythmCard />

          <ReflectionVerseCard />

          <OverallProgressCard
            totalJapaProgress={totalJapaProgress}
            totalCompletedRounds={totalCompletedRounds}
            onOpenKaliModal={() => setIsKaliModalOpen(true)}
          />
        </section>
      {isKaliModalOpen ? <KaliModal onClose={() => setIsKaliModalOpen(false)} /> : null}
    </>
  );
}
