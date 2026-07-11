import { type CSSProperties, type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { audioApi } from '../../entities/audio/api/audioApi';
import type { AudioTrack } from '../../entities/audio/model/types';
import { japaApi } from '../../entities/japa-session/api/japaApi';
import type { JapaDailyProgress, JapaDailyProgressQuery } from '../../entities/japa-session/model/types';
import { defaultGoals, readAuthUser } from '../../entities/user/model/auth';
import { env } from '../../shared/config/env';
import japaAudioLotus from '../../shared/assets/images/japa-audio-lotus.png';
import smallCow from '../../shared/assets/images/smallCow.png';
import pauseButtonIcon from '../../shared/assets/images/pause.svg';
import playButtonIcon from '../../shared/assets/images/play.svg';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import {
  JAPA_MANTRA_GOAL,
  JAPA_MANTRAS_PER_ROUND,
  calculateJapaMantraProgress,
  formatJapaDate,
  formatJapaNumber,
  formatJapaProgressPercent,
  formatJapaRoundsPhrase,
  getTodayDateKey,
  normalizeJapaCompletedRounds,
  normalizeJapaDailyGoal,
} from '../../shared/lib/japaProgress';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './MyJapaPage.module.css';

const rhythmStats = [
  { icon: 'flame', value: '21', unit: 'день', label: 'Серия' },
  { icon: 'mala', value: '128', unit: 'кругов', label: 'Кругов всего' },
  { icon: 'clock', value: '1:42', unit: 'мин', label: 'Среднее время' },
] as const;

const milestoneGroups = Array.from({ length: 3 }, (_, groupIndex) =>
  Array.from({ length: 4 }, (_, barIndex) => groupIndex * 4 + barIndex + 1),
);

const progressRadius = 132;
const progressCircumference = 2 * Math.PI * progressRadius;
const waveformBars = [
  2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5, 7, 10, 15, 22, 30, 24, 18, 13, 9, 6, 4, 3, 4, 7, 13, 22, 31, 25, 18, 12, 8,
  5, 4, 7, 12, 20, 29, 23, 16, 10, 7, 5, 5, 8, 14, 23, 32, 27, 19, 12, 8, 5, 4, 3, 3, 3, 3, 3, 3, 3, 3,
] as const;
const waveformBarsCount = waveformBars.length;

const getInitialDailyJapaGoal = () =>
  normalizeJapaDailyGoal(readAuthUser()?.goals.japaRounds ?? defaultGoals.japaRounds);

const formatSessionTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => part.toString().padStart(2, '0')).join(':');
};

const formatAudioTime = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds)) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

type CachedJapaHistory = {
  query: JapaDailyProgressQuery;
  progressHistory: JapaDailyProgress[];
};

const dailyProgressCache = new Map<string, JapaDailyProgress>();
const dailyProgressRequests = new Map<string, Promise<JapaDailyProgress>>();
const dailyProgressHistoryCache = new Map<string, CachedJapaHistory>();
const dailyProgressHistoryRequests = new Map<string, Promise<JapaDailyProgress[]>>();

const getDailyProgressCacheKey = (userId: string, date: string) => `${userId}:${date}`;

const getDailyProgressHistoryCacheKey = (userId: string, query: JapaDailyProgressQuery) =>
  `${userId}:${query.from ?? ''}:${query.to ?? ''}`;

const isDateWithinProgressQuery = (date: string, query: JapaDailyProgressQuery) =>
  (!query.from || date >= query.from) && (!query.to || date <= query.to);

const getCachedDailyProgress = (userId: string, date: string) => {
  const cacheKey = getDailyProgressCacheKey(userId, date);
  const cachedProgress = dailyProgressCache.get(cacheKey);

  if (cachedProgress) {
    return Promise.resolve(cachedProgress);
  }

  const pendingRequest = dailyProgressRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = japaApi
    .getToday(date)
    .then((progress) => {
      dailyProgressCache.set(cacheKey, progress);
      return progress;
    })
    .finally(() => {
      dailyProgressRequests.delete(cacheKey);
    });

  dailyProgressRequests.set(cacheKey, request);
  return request;
};

const getCachedDailyProgressHistory = (userId: string, query: JapaDailyProgressQuery) => {
  const cacheKey = getDailyProgressHistoryCacheKey(userId, query);
  const cachedHistory = dailyProgressHistoryCache.get(cacheKey);

  if (cachedHistory) {
    return Promise.resolve(cachedHistory.progressHistory);
  }

  const pendingRequest = dailyProgressHistoryRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = japaApi
    .getHistory(query)
    .then((progressHistory) => {
      dailyProgressHistoryCache.set(cacheKey, {
        query,
        progressHistory,
      });
      return progressHistory;
    })
    .finally(() => {
      dailyProgressHistoryRequests.delete(cacheKey);
    });

  dailyProgressHistoryRequests.set(cacheKey, request);
  return request;
};

const updateDailyProgressCache = (userId: string, progress: JapaDailyProgress) => {
  dailyProgressCache.set(getDailyProgressCacheKey(userId, progress.date), progress);

  dailyProgressHistoryCache.forEach((cachedHistory, cacheKey) => {
    if (!cacheKey.startsWith(`${userId}:`) || !isDateWithinProgressQuery(progress.date, cachedHistory.query)) {
      return;
    }

    cachedHistory.progressHistory = [
      ...cachedHistory.progressHistory.filter((historyItem) => historyItem.date !== progress.date),
      progress,
    ].sort((firstItem, secondItem) => firstItem.date.localeCompare(secondItem.date));
  });
};

export default function MyJapaPage() {
  useDocumentTitle('Джапа - Садхана Бхакти');
  const authUser = readAuthUser();
  const configuredDailyJapaGoal = useMemo(() => getInitialDailyJapaGoal(), []);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const japaStartDate = authUser?.settings.japaStartDate ?? null;
  const japaGoalHistory = authUser?.settings.japaGoalHistory ?? [];
  const initialDailyProgress = authUser
    ? dailyProgressCache.get(getDailyProgressCacheKey(authUser.id, todayDateKey))
    : undefined;
  const initialCompletedRounds = normalizeJapaCompletedRounds(initialDailyProgress?.rounds ?? 0);
  const initialDailyJapaGoal = initialDailyProgress?.goalRounds
    ? normalizeJapaDailyGoal(initialDailyProgress.goalRounds)
    : configuredDailyJapaGoal;
  const initialDailyProgressHistory = authUser && japaStartDate
    ? dailyProgressHistoryCache.get(getDailyProgressHistoryCacheKey(authUser.id, {
      from: japaStartDate,
      to: todayDateKey,
    }))?.progressHistory ?? []
    : [];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completedRoundsRef = useRef(initialCompletedRounds);
  const lastSavedCompletedRoundsRef = useRef(initialCompletedRounds);
  const saveCompletedRoundsRequestRef = useRef(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSessionRunning, setIsSessionRunning] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(initialCompletedRounds);
  const [dailyJapaGoalInput, setDailyJapaGoalInput] = useState(() => String(initialDailyJapaGoal));
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.72);
  const [audioStatus, setAudioStatus] = useState('');
  const [dailyProgressHistory, setDailyProgressHistory] = useState<JapaDailyProgress[]>(initialDailyProgressHistory);
  const dailyJapaGoal = normalizeJapaDailyGoal(Number(dailyJapaGoalInput));
  const sessionTime = useMemo(() => formatSessionTime(sessionSeconds), [sessionSeconds]);
  const sessionActionLabel = isSessionRunning ? 'Пауза' : sessionSeconds > 0 ? 'Продолжить' : 'Начать';
  const sessionActionIcon = isSessionRunning ? 'Ⅱ' : '▶';
  const visibleRounds = Math.min(completedRounds, dailyJapaGoal);
  const remainingRounds = Math.max(dailyJapaGoal - completedRounds, 0);
  const japaProgress = visibleRounds / dailyJapaGoal;
  const progressDashOffset = progressCircumference * (1 - japaProgress);
  const progressMarkerStyle = {
    '--progress-angle': `${japaProgress * 360}deg`,
  } as CSSProperties;
  const progressCircleStyle = {
    strokeDasharray: progressCircumference,
    strokeDashoffset: progressDashOffset,
  } as CSSProperties;
  const selectedAudioTrack = audioTracks.find((track) => track.id === selectedAudioId) ?? audioTracks[0];
  const selectedAudioIndex = selectedAudioTrack ? audioTracks.findIndex((track) => track.id === selectedAudioTrack.id) : -1;
  const audioSource = selectedAudioTrack ? `${env.apiBaseUrl}${selectedAudioTrack.fileUrl}` : undefined;
  const audioProgress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
  const waveformProgress = Math.min(Math.max(audioProgress, 0), 1);
  const activeWaveformBars = Math.round(waveformProgress * waveformBarsCount);
  const audioTitle = selectedAudioTrack?.title ?? 'Аудио не выбрано';
  const audioSubtitle = selectedAudioTrack?.subtitle || 'Загрузи аудио в настройках';
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
  const totalJapaProgressStyle = {
    width: `${totalJapaProgress.percent}%`,
  } as CSSProperties;
  const totalCompletedRounds = Math.floor(totalJapaProgress.completedMantras / JAPA_MANTRAS_PER_ROUND);

  useEffect(() => {
    completedRoundsRef.current = completedRounds;
  }, [completedRounds]);

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
    let shouldIgnore = false;

    audioApi.list()
      .then((tracks) => {
        if (shouldIgnore) {
          return;
        }

        setAudioTracks(tracks);
        setSelectedAudioId((currentTrackId) => {
          if (tracks.some((track) => track.id === currentTrackId)) {
            return currentTrackId;
          }

          return tracks[0]?.id ?? '';
        });
        setAudioStatus('');
      })
      .catch(() => {
        if (!shouldIgnore) {
          setAudioStatus('Не удалось загрузить список аудио.');
        }
      });

    return () => {
      shouldIgnore = true;
    };
  }, []);

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
        <section className={styles.dashboard} aria-label="Моя джапа">
          <article className={`${styles.card} ${styles.todayCard}`}>
            <div className={styles.cardHeader}>
              <h1>Джапа</h1>
              <div className={styles.roundMilestones} aria-label={`Завершено ${Math.floor(completedRounds / defaultGoals.japaRounds)} блоков по 16 кругов`}>
                {milestoneGroups.map((group, groupIndex) => (
                  <div className={styles.milestoneGroup} key={groupIndex}>
                    {group.map((milestone) => (
                      <span
                        className={completedRounds >= milestone * defaultGoals.japaRounds ? styles.milestoneActive : undefined}
                        key={milestone}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.progressCircle} aria-label={`${visibleRounds} из ${dailyJapaGoal} кругов сегодня`}>
              <div className={styles.progressRing}>
                <svg className={styles.progressSvg} viewBox="0 0 320 320" aria-hidden="true">
                  <defs>
                    <path id="japaGoalArc" d="M 34 48 Q 160 -44 286 48" />
                    <path id="japaRemainingArc" d="M 72 234 Q 160 296 248 234" />
                  </defs>
                  <circle className={styles.progressTrack} cx="160" cy="160" r={progressRadius} />
                  <circle className={styles.progressValue} cx="160" cy="160" r={progressRadius} style={progressCircleStyle} />
                  <text className={styles.progressArcText}>
                    <textPath href="#japaGoalArc" startOffset="50%" textAnchor="middle">
                      Цель на сегодня: {dailyJapaGoal} кругов
                    </textPath>
                  </text>
                  <text className={styles.progressArcText}>
                    <textPath href="#japaRemainingArc" startOffset="50%" textAnchor="middle">
                      Осталось {remainingRounds} кругов
                    </textPath>
                  </text>
                </svg>
                <span className={styles.progressMarker} style={progressMarkerStyle} />
                <div className={styles.progressCenter}>
                  <strong>
                    {visibleRounds}<span>/{dailyJapaGoal}</span>
                  </strong>
                  <small>кругов сегодня</small>
                  <img src={smallCow} alt="" />
                </div>
              </div>
            </div>

            <div className={styles.todayActions}>
              <div className={styles.quickRoundActions}>
                <button className={styles.primaryButton} type="button" onClick={() => addCompletedRounds(1)}>
                  +1 круг
                </button>
                <button className={styles.primaryButton} type="button" onClick={() => addCompletedRounds(4)}>
                  +4 круга
                </button>
              </div>
              <button className={styles.secondaryButton} type="button" onClick={handleAddDailyGoal}>
                Добавить 16 кругов
              </button>
            </div>

            <label className={styles.dailyGoalField}>
              <span>Цель на день</span>
              <input
                type="number"
                min="1"
                max="192"
                step="1"
                value={dailyJapaGoalInput}
                onChange={(event) => handleDailyGoalChange(event.target.value)}
                onBlur={handleDailyGoalBlur}
              />
            </label>
          </article>

          <article className={`${styles.card} ${styles.sessionCard}`}>
            <div className={styles.cardHeader}>
              <h2>Текущая сессия</h2>
              <Icon className={styles.headerIcon} name="clock" />
            </div>
            <div className={styles.timer}>{sessionTime}</div>
            <p className={styles.timerCaption}>Время с начала сессии</p>
            <div className={styles.sessionActions}>
              <button className={styles.pauseButton} type="button" onClick={handleSessionToggle} aria-pressed={!isSessionRunning}>
                <span>{sessionActionIcon}</span>
                {sessionActionLabel}
              </button>
              <button className={styles.stopButton} type="button" onClick={handleSessionStop}>
                <span />
                Завершить
              </button>
            </div>
          </article>

          <article className={`${styles.card} ${styles.audioCard}`}>
            <div className={styles.cardHeader}>
              <h2>Аудио для практики</h2>
              <span className={styles.musicIcon}>♫</span>
            </div>

            <div className={styles.audioBody}>
              <div className={styles.albumArt}>
                <img src={japaAudioLotus} alt="" />
              </div>

              <div className={styles.audioInfo}>
                <audio
                  ref={audioRef}
                  src={audioSource}
                  preload="metadata"
                  onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration)}
                  onTimeUpdate={(event) => setAudioCurrentTime(event.currentTarget.currentTime)}
                  onPause={() => setIsAudioPlaying(false)}
                  onPlay={() => setIsAudioPlaying(true)}
                  onEnded={() => setIsAudioPlaying(false)}
                />
                <h3>{audioTitle}</h3>
                <p>{audioSubtitle}</p>
                {audioTracks.length > 1 ? (
                  <select
                    className={styles.audioSelect}
                    value={selectedAudioTrack?.id ?? ''}
                    onChange={(event) => setSelectedAudioId(event.target.value)}
                    aria-label="Выбрать аудио"
                  >
                    {audioTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.title}
                      </option>
                    ))}
                  </select>
                ) : null}

                <div className={styles.waveform} onClick={handleAudioSeek} role="presentation">
                  {waveformBars.map((height, index) => (
                    <span
                      className={index < activeWaveformBars ? styles.waveformActive : undefined}
                      key={index}
                      style={{ '--bar': `${height}px` } as CSSProperties}
                    />
                  ))}
                  <i style={{ left: `calc(${waveformProgress * 100}% + ${9 - waveformProgress * 18}px)` }} />
                </div>
                <div className={styles.audioTime}>
                  <span>{formatAudioTime(audioCurrentTime)}</span>
                  <span>{formatAudioTime(audioDuration)}</span>
                </div>
                {audioStatus ? <p className={styles.audioStatus}>{audioStatus}</p> : null}

                <div className={styles.playerControls}>
                  <button type="button" onClick={() => selectRelativeTrack(-1)} aria-label="Предыдущий трек">
                    <svg viewBox="0 0 32 32" aria-hidden="true">
                      <rect x="7" y="7" width="3.4" height="18" rx="1" />
                      <path d="M24.5 7.3v17.4L12 16z" />
                    </svg>
                  </button>
                  <button
                    className={styles.playButton}
                    type="button"
                    onClick={handleAudioToggle}
                    aria-label={isAudioPlaying ? 'Пауза' : 'Воспроизвести'}
                  >
                    <img src={isAudioPlaying ? pauseButtonIcon : playButtonIcon} alt="" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => selectRelativeTrack(1)} aria-label="Следующий трек">
                    <svg viewBox="0 0 32 32" aria-hidden="true">
                      <path d="M7.5 7.3 20 16 7.5 24.7z" />
                      <rect x="21.6" y="7" width="3.4" height="18" rx="1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.audioFooter}>
              <Icon name="bell" />
              <div className={styles.volumeTrack}>
                <span style={{ width: `${audioVolume * 100}%` }} />
                <input
                  className={styles.volumeInput}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={audioVolume}
                  onChange={(event) => handleVolumeChange(event.target.value)}
                  aria-label="Громкость"
                />
              </div>
              <button type="button" aria-label="Настройки аудио">
                <Icon name="settings" />
              </button>
              <button type="button" aria-label="Таймер">
                <Icon name="clock" />
              </button>
            </div>
          </article>

          <article className={`${styles.card} ${styles.rhythmCard}`}>
            <h2>Мой ритм</h2>
            <div className={styles.rhythmGrid}>
              {rhythmStats.map((stat) => (
                <div className={styles.rhythmItem} key={stat.label}>
                  <div className={`${styles.rhythmIcon} ${styles[stat.icon]}`}>
                    {stat.icon === 'flame' ? <span /> : <Icon name={stat.icon} />}
                  </div>
                  <div>
                    <strong>{stat.value}</strong>
                    <span>{stat.unit}</span>
                    <small>{stat.label}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className={`${styles.card} ${styles.verseCard}`}>
            <div className={styles.cardHeader}>
              <h2>Стих дня размышления</h2>
              <Icon className={styles.headerIcon} name="book" />
            </div>
            <div className={styles.verseBody}>
              <span className={styles.quoteMark}>“</span>
              <p>
                Всегда думай обо Мне, стань Моим преданным, поклоняйся Мне и поклоняйся Мне.
                Таким образом ты непременно придёшь ко Мне. Я обещаю тебе это, ибо ты Мне очень дорог.
              </p>
              <img src={smallCow} alt="" />
            </div>
            <strong className={styles.verseSource}>— Бхагавад-гита 18.65</strong>
          </article>

          <article className={`${styles.card} ${styles.overallCard}`}>
            <div className={styles.overallHeader}>
              <h2>Общий прогресс</h2>
              <strong>{formatJapaProgressPercent(totalJapaProgress.percent)}</strong>
            </div>
            <div className={styles.overallTrack}>
              <span style={totalJapaProgressStyle} />
            </div>
            <div className={styles.overallInfoDesktop}>
              <div className={styles.overallMetrics}>
                <div>
                  <strong>{formatJapaNumber(totalCompletedRounds)}</strong>
                  <span>кругов всего</span>
                </div>
                <div>
                  <strong>{formatJapaNumber(totalJapaProgress.completedMantras)}</strong>
                  <span>повторено мантр</span>
                </div>
              </div>
              <small>
                {totalJapaProgress.startDate && totalJapaProgress.targetDate
                  ? `При чтении ${formatJapaRoundsPhrase(totalJapaProgress.dailyRounds)} в день цель будет достигнута ${formatJapaDate(totalJapaProgress.targetDate)}.`
                  : 'Укажи дату начала ежедневной практики в настройках, чтобы увидеть прогресс.'}
              </small>
              <div className={styles.goalStatus}>
                Цель 35 млн мантр
                <Icon name="target" />
              </div>
              <button className={styles.linkButton} type="button">
                Кали-Сантарана-упанишада
              </button>
            </div>
            <div className={styles.overallInfoMobile}>
              <div className={styles.overallStats}>
                <p>
                  <span>Пройдено</span>
                  <strong>{formatJapaNumber(totalJapaProgress.completedMantras)}</strong>
                  <small>{formatJapaNumber(totalCompletedRounds)} кругов</small>
                </p>
                <p>
                  <span>Цель</span>
                  <strong>{formatJapaNumber(JAPA_MANTRA_GOAL)}</strong>
                  <small>мантр</small>
                </p>
              </div>
              <small className={styles.progressForecast}>
                {totalJapaProgress.startDate && totalJapaProgress.targetDate
                  ? `При чтении ${formatJapaRoundsPhrase(totalJapaProgress.dailyRounds)} в день цель будет достигнута ${formatJapaDate(totalJapaProgress.targetDate)}.`
                  : 'Укажи дату начала ежедневной практики в настройках, чтобы увидеть прогресс.'}
              </small>
              <button className={styles.linkButton} type="button">
                Кали-Сантарана-упанишада
              </button>
            </div>
          </article>
        </section>
  );
}
