import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { getAudioTrackUrl, useAudioTracks } from '../../../../entities/audio/model/audioQueries';
import styles from './FocusAudioPlayer.module.css';

export function FocusAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const keepPlayingOnSourceChangeRef = useRef(false);
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: audioTracks = [], isError, isLoading } = useAudioTracks();
  const selectedTrack = audioTracks.find((track) => track.id === selectedAudioId) ?? audioTracks[0];
  const selectedTrackIndex = selectedTrack
    ? audioTracks.findIndex((track) => track.id === selectedTrack.id)
    : -1;
  const audioSource = selectedTrack ? getAudioTrackUrl(selectedTrack) : undefined;
  const trackTitle = isLoading && audioTracks.length === 0
    ? 'Загружаем аудио...'
    : isError
      ? 'Не удалось загрузить аудио'
      : selectedTrack?.title ?? 'Аудио не выбрано';

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

    if (keepPlayingOnSourceChangeRef.current) {
      keepPlayingOnSourceChangeRef.current = false;
      return;
    }

    audio.pause();
    audio.load();
    setIsPlaying(false);
  }, [audioSource]);

  const playAudio = async (audio: HTMLAudioElement) => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (!audio || !selectedTrack) {
      return;
    }

    if (audio.paused) {
      void playAudio(audio);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const selectRelativeTrack = (direction: -1 | 1) => {
    if (audioTracks.length === 0 || selectedTrackIndex < 0) {
      return;
    }

    const nextIndex = (selectedTrackIndex + direction + audioTracks.length) % audioTracks.length;
    const nextTrack = audioTracks[nextIndex];
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (nextTrack.id !== selectedTrack?.id) {
      keepPlayingOnSourceChangeRef.current = true;
      flushSync(() => setSelectedAudioId(nextTrack.id));
      audio.load();
    } else {
      audio.currentTime = 0;
    }

    void playAudio(audio);
  };

  return (
    <div className={styles.player} aria-label="Аудио для практики">
      <audio
        ref={audioRef}
        src={audioSource}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className={styles.controls}>
        <button
          type="button"
          disabled={audioTracks.length === 0}
          onClick={() => selectRelativeTrack(-1)}
          aria-label="Предыдущий трек"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 5.5v13L8.5 12 18 5.5Z" />
            <rect x="5" y="5" width="2.5" height="14" rx="1" />
          </svg>
        </button>
        <button
          className={styles.playButton}
          type="button"
          disabled={!selectedTrack}
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="7" y="6" width="3.5" height="12" rx="1" />
              <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5 18 12 8 18.5v-13Z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          disabled={audioTracks.length === 0}
          onClick={() => selectRelativeTrack(1)}
          aria-label="Следующий трек"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 5.5 9.5 6.5L6 18.5v-13Z" />
            <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
          </svg>
        </button>
      </div>

      <div className={styles.trackInfo} aria-live="polite">
        <strong title={trackTitle}>{trackTitle}</strong>
      </div>
    </div>
  );
}
