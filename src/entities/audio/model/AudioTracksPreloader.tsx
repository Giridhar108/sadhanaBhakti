import { useEffect, useRef } from 'react';
import { getAudioTrackUrl, useAudioTracks } from './audioQueries';

type AudioTracksPreloaderProps = {
  enabled: boolean;
};

export function AudioTracksPreloader({ enabled }: AudioTracksPreloaderProps) {
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const { data: audioTracks = [] } = useAudioTracks(enabled);
  const firstAudioTrack = audioTracks[0];

  useEffect(() => {
    if (!enabled || !firstAudioTrack || typeof Audio === 'undefined') {
      return;
    }

    const audioSource = getAudioTrackUrl(firstAudioTrack);

    if (preloadedAudioRef.current?.src === new URL(audioSource, window.location.href).href) {
      return;
    }

    const audio = new Audio(audioSource);
    audio.preload = 'auto';
    audio.load();
    preloadedAudioRef.current = audio;
  }, [enabled, firstAudioTrack]);

  return null;
}
