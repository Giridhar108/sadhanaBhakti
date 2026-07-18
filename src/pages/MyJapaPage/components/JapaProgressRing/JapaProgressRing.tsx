import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import smallCow from '../../../../shared/assets/images/smallCow.png';
import styles from './JapaProgressRing.module.css';

type JapaProgressRingProps = {
  completedRounds: number;
  dailyJapaGoal: number;
  onCompletedRoundsChange: (rounds: number) => void;
  className?: string;
};

type MarkerDragState = {
  pointerId: number;
  lastAngle: number;
  lastFeedbackRound: number;
  rounds: number;
};

const progressRadius = 132;
const progressCircumference = 2 * Math.PI * progressRadius;

export function JapaProgressRing({
  completedRounds,
  dailyJapaGoal,
  onCompletedRoundsChange,
  className,
}: JapaProgressRingProps) {
  const progressRingRef = useRef<HTMLDivElement | null>(null);
  const markerDragRef = useRef<MarkerDragState | null>(null);
  const selectionAudioContextRef = useRef<AudioContext | null>(null);
  const [draggedRounds, setDraggedRounds] = useState<number | null>(null);
  const arcId = useId().replace(/:/g, '');
  const goalArcId = `japaGoalArc-${arcId}`;
  const remainingArcId = `japaRemainingArc-${arcId}`;
  const displayedRounds = draggedRounds ?? completedRounds;
  const visibleRounds = Math.min(displayedRounds, dailyJapaGoal);
  const remainingRounds = Math.max(dailyJapaGoal - displayedRounds, 0);
  const japaProgress = visibleRounds / dailyJapaGoal;
  const progressMarkerStyle = {
    '--progress-angle': `${japaProgress * 360}deg`,
  } as CSSProperties;
  const progressCircleStyle = {
    strokeDasharray: progressCircumference,
    strokeDashoffset: progressCircumference * (1 - japaProgress),
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
    <div
      className={`${styles.progressCircle}${className ? ` ${className}` : ''}`}
      aria-label={`${visibleRounds} из ${dailyJapaGoal} кругов сегодня`}
    >
      <div className={styles.progressRing} data-dragging={draggedRounds !== null} ref={progressRingRef}>
        <svg className={styles.progressSvg} viewBox="0 0 320 320" aria-hidden="true">
          <defs>
            <path id={goalArcId} d="M 34 48 Q 160 -44 286 48" />
            <path id={remainingArcId} d="M 72 240 Q 160 302 248 240" />
          </defs>
          <circle className={styles.progressTrack} cx="160" cy="160" r={progressRadius} />
          <circle className={styles.progressValue} cx="160" cy="160" r={progressRadius} style={progressCircleStyle} />
          <text className={styles.progressArcText}>
            <textPath href={`#${goalArcId}`} startOffset="50%" textAnchor="middle">
              Цель на сегодня: {dailyJapaGoal} кругов
            </textPath>
          </text>
          <text className={styles.progressArcText}>
            <textPath href={`#${remainingArcId}`} startOffset="50%" textAnchor="middle">
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
  );
}
