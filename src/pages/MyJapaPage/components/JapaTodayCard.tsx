import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defaultGoals } from '../../../entities/user/model/auth';
import smallCow from '../../../shared/assets/images/smallCow.png';
import styles from './JapaTodayCard.module.css';

type JapaTodayCardProps = {
  completedRounds: number;
  dailyJapaGoal: number;
  dailyJapaGoalInput: string;
  onAddRounds: (rounds: number) => void;
  onAddDailyGoal: () => void;
  onCompletedRoundsChange: (rounds: number) => void;
  onDailyGoalChange: (value: string) => void;
  onDailyGoalBlur: () => void;
};

type MarkerDragState = {
  pointerId: number;
  lastAngle: number;
  lastFeedbackRound: number;
  rounds: number;
};

const milestoneGroups = Array.from({ length: 3 }, (_, groupIndex) =>
  Array.from({ length: 4 }, (_, barIndex) => groupIndex * 4 + barIndex + 1),
);

const progressRadius = 132;
const progressCircumference = 2 * Math.PI * progressRadius;

export function JapaTodayCard({
  completedRounds,
  dailyJapaGoal,
  dailyJapaGoalInput,
  onAddRounds,
  onAddDailyGoal,
  onCompletedRoundsChange,
  onDailyGoalChange,
  onDailyGoalBlur,
}: JapaTodayCardProps) {
  const progressRingRef = useRef<HTMLDivElement | null>(null);
  const markerDragRef = useRef<MarkerDragState | null>(null);
  const selectionAudioContextRef = useRef<AudioContext | null>(null);
  const [draggedRounds, setDraggedRounds] = useState<number | null>(null);
  const displayedRounds = draggedRounds ?? completedRounds;
  const visibleRounds = Math.min(displayedRounds, dailyJapaGoal);
  const remainingRounds = Math.max(dailyJapaGoal - displayedRounds, 0);
  const japaProgress = visibleRounds / dailyJapaGoal;
  const progressDashOffset = progressCircumference * (1 - japaProgress);
  const progressMarkerStyle = {
    '--progress-angle': `${japaProgress * 360}deg`,
  } as CSSProperties;
  const progressCircleStyle = {
    strokeDasharray: progressCircumference,
    strokeDashoffset: progressDashOffset,
  } as CSSProperties;

  useEffect(() => () => {
    const audioContext = selectionAudioContextRef.current;

    selectionAudioContextRef.current = null;

    if (audioContext) {
      void audioContext.close();
    }
  }, []);

  const prepareSelectionFeedback = () => {
    if (!selectionAudioContextRef.current || selectionAudioContextRef.current.state === 'closed') {
      selectionAudioContextRef.current = new AudioContext();
    }

    if (selectionAudioContextRef.current.state === 'suspended') {
      void selectionAudioContextRef.current.resume();
    }
  };

  const playSelectionFeedback = () => {
    prepareSelectionFeedback();

    const audioContext = selectionAudioContextRef.current;

    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'running') {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startedAt = audioContext.currentTime;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(520, startedAt);
      oscillator.frequency.exponentialRampToValueAtTime(360, startedAt + 0.025);
      gain.gain.setValueAtTime(0.022, startedAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + 0.025);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startedAt);
      oscillator.stop(startedAt + 0.026);
    }

    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(7);
    }
  };

  const getPointerAngle = (event: PointerEvent<HTMLElement>) => {
    const bounds = progressRingRef.current?.getBoundingClientRect();

    if (!bounds) {
      return null;
    }

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    return (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI + 90;
  };

  const handleMarkerPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    const angle = getPointerAngle(event);

    if (angle === null) {
      return;
    }

    event.preventDefault();
    prepareSelectionFeedback();
    event.currentTarget.setPointerCapture(event.pointerId);
    markerDragRef.current = {
      pointerId: event.pointerId,
      lastAngle: angle,
      lastFeedbackRound: visibleRounds,
      rounds: visibleRounds,
    };
    setDraggedRounds(visibleRounds);
  };

  const handleMarkerPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const dragState = markerDragRef.current;
    const angle = getPointerAngle(event);

    if (!dragState || dragState.pointerId !== event.pointerId || angle === null) {
      return;
    }

    let angleDelta = angle - dragState.lastAngle;

    if (angleDelta > 180) {
      angleDelta -= 360;
    } else if (angleDelta < -180) {
      angleDelta += 360;
    }

    const nextRawRounds = Math.min(
      Math.max(dragState.rounds + (angleDelta / 360) * dailyJapaGoal, 0),
      dailyJapaGoal,
    );

    dragState.lastAngle = angle;
    dragState.rounds = nextRawRounds;

    const nextRounds = Math.round(nextRawRounds);

    if (nextRounds !== dragState.lastFeedbackRound) {
      dragState.lastFeedbackRound = nextRounds;
      playSelectionFeedback();
    }

    setDraggedRounds(nextRounds);
  };

  const finishMarkerDrag = (event: PointerEvent<HTMLSpanElement>, shouldSave: boolean) => {
    const dragState = markerDragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const nextRounds = Math.round(dragState.rounds);

    markerDragRef.current = null;
    setDraggedRounds(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (shouldSave && nextRounds !== completedRounds) {
      onCompletedRoundsChange(nextRounds);
    }
  };

  const handleMarkerKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const nextRoundsByKey: Partial<Record<string, number>> = {
      ArrowDown: visibleRounds - 1,
      ArrowLeft: visibleRounds - 1,
      ArrowRight: visibleRounds + 1,
      ArrowUp: visibleRounds + 1,
      End: dailyJapaGoal,
      Home: 0,
    };
    const nextRounds = nextRoundsByKey[event.key];

    if (nextRounds === undefined) {
      return;
    }

    event.preventDefault();

    const normalizedRounds = Math.min(Math.max(nextRounds, 0), dailyJapaGoal);

    if (normalizedRounds !== visibleRounds) {
      playSelectionFeedback();
      onCompletedRoundsChange(normalizedRounds);
    }
  };

  return (
    <article className={`${styles.card} ${styles.todayCard}`}>
      <div className={styles.cardHeader}>
        <h1>Джапа</h1>
        <div
          className={styles.roundMilestones}
          aria-label={`Завершено ${Math.floor(completedRounds / defaultGoals.japaRounds)} блоков по 16 кругов`}
        >
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
        <div className={styles.progressRing} data-dragging={draggedRounds !== null} ref={progressRingRef}>
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
          <span
            className={styles.progressMarker}
            style={progressMarkerStyle}
            role="slider"
            tabIndex={0}
            aria-label="Количество прочитанных кругов"
            aria-valuemin={0}
            aria-valuemax={dailyJapaGoal}
            aria-valuenow={visibleRounds}
            onKeyDown={handleMarkerKeyDown}
            onPointerDown={handleMarkerPointerDown}
            onPointerMove={handleMarkerPointerMove}
            onPointerUp={(event) => finishMarkerDrag(event, true)}
            onPointerCancel={(event) => finishMarkerDrag(event, false)}
          />
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
          <button className={styles.primaryButton} type="button" onClick={() => onAddRounds(1)}>
            +1 круг
          </button>
          <button className={styles.primaryButton} type="button" onClick={() => onAddRounds(4)}>
            +4 круга
          </button>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={onAddDailyGoal}>
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
          onChange={(event) => onDailyGoalChange(event.target.value)}
          onBlur={onDailyGoalBlur}
        />
      </label>
    </article>
  );
}
