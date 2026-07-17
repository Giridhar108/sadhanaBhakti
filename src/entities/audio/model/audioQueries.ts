import { useQuery } from '@tanstack/react-query';
import { env } from '../../../shared/config/env';
import { audioApi } from '../api/audioApi';
import { defaultAudioTracks } from './defaultAudioTracks';
import type { AudioTrack } from './types';

export const audioTracksQueryKey = ['audio', 'tracks'] as const;

export const audioTracksQueryOptions = {
  queryKey: audioTracksQueryKey,
  queryFn: async () => [...defaultAudioTracks, ...(await audioApi.list())],
  staleTime: Infinity,
  gcTime: 60 * 60 * 1000,
};

export function getAudioTrackUrl(track: AudioTrack) {
  return track.isDefault ? track.fileUrl : `${env.apiBaseUrl}${track.fileUrl}`;
}

export function useAudioTracks(enabled = true) {
  return useQuery({
    ...audioTracksQueryOptions,
    enabled,
  });
}
