import { type CSSProperties, type MouseEvent, type RefObject } from 'react';
import japaAudioLotus from '../../../shared/assets/images/japa-audio-lotus.png';
import pauseButtonIcon from '../../../shared/assets/images/pause.svg';
import playButtonIcon from '../../../shared/assets/images/play.svg';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './AudioPracticeCard.module.css';

type AudioPracticeCardProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  audioSource?: string;
  audioTitle: string;
  audioSubtitle: string;
  audioCurrentTime: number;
  audioDuration: number;
  audioVolume: number;
  waveformProgress: number;
  activeWaveformBars: number;
  audioStatusMessage: string;
  isAudioPlaying: boolean;
  onAudioLoadedMetadata: (duration: number) => void;
  onAudioTimeUpdate: (currentTime: number) => void;
  onAudioPause: () => void;
  onAudioPlay: () => void;
  onAudioEnded: () => void;
  onAudioSeek: (event: MouseEvent<HTMLDivElement>) => void;
  onSelectRelativeTrack: (direction: -1 | 1) => void;
  onAudioToggle: () => void;
  onVolumeChange: (value: string) => void;
};

const waveformBars = [
  2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5, 7, 10, 15, 22, 30, 24, 18, 13, 9, 6, 4, 3, 4, 7, 13, 22, 31, 25, 18, 12, 8,
  5, 4, 7, 12, 20, 29, 23, 16, 10, 7, 5, 5, 8, 14, 23, 32, 27, 19, 12, 8, 5, 4, 3, 3, 3, 3, 3, 3, 3, 3,
] as const;

export const waveformBarsCount = waveformBars.length;

const formatAudioTime = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds)) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function AudioPracticeCard({
  audioRef,
  audioSource,
  audioTitle,
  audioSubtitle,
  audioCurrentTime,
  audioDuration,
  audioVolume,
  waveformProgress,
  activeWaveformBars,
  audioStatusMessage,
  isAudioPlaying,
  onAudioLoadedMetadata,
  onAudioTimeUpdate,
  onAudioPause,
  onAudioPlay,
  onAudioEnded,
  onAudioSeek,
  onSelectRelativeTrack,
  onAudioToggle,
  onVolumeChange,
}: AudioPracticeCardProps) {
  return (
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
            preload="auto"
            onLoadedMetadata={(event) => onAudioLoadedMetadata(event.currentTarget.duration)}
            onTimeUpdate={(event) => onAudioTimeUpdate(event.currentTarget.currentTime)}
            onPause={onAudioPause}
            onPlay={onAudioPlay}
            onEnded={onAudioEnded}
          />
          <h3>{audioTitle}</h3>
          <p className={styles.audioSubtitle}>{audioSubtitle}</p>

          <div className={styles.waveform} onClick={onAudioSeek} role="presentation">
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
          {audioStatusMessage ? <p className={styles.audioStatus}>{audioStatusMessage}</p> : null}

          <div className={styles.playerControls}>
            <button type="button" onClick={() => onSelectRelativeTrack(-1)} aria-label="Предыдущий трек">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <rect x="7" y="7" width="3.4" height="18" rx="1" />
                <path d="M24.5 7.3v17.4L12 16z" />
              </svg>
            </button>
            <button
              className={styles.playButton}
              type="button"
              onClick={onAudioToggle}
              aria-label={isAudioPlaying ? 'Пауза' : 'Воспроизвести'}
            >
              <img src={isAudioPlaying ? pauseButtonIcon : playButtonIcon} alt="" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onSelectRelativeTrack(1)} aria-label="Следующий трек">
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
            onChange={(event) => onVolumeChange(event.target.value)}
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
  );
}
