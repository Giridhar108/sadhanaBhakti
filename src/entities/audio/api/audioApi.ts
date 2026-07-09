import { endpoints } from '../../../shared/api/endpoints';
import { httpClient } from '../../../shared/api/httpClient';
import type { AudioTrack, UploadAudioTrackInput } from '../model/types';

export const audioApi = {
  list: () => httpClient.get<AudioTrack[]>(endpoints.audio.root),
  upload: (input: UploadAudioTrackInput) => {
    const formData = new FormData();

    formData.append('title', input.title);
    formData.append('subtitle', input.subtitle);
    formData.append('file', input.file);

    return httpClient.postForm<AudioTrack>(endpoints.audio.root, formData);
  },
  delete: (trackId: string) => httpClient.delete<{ ok: boolean }>(endpoints.audio.item(trackId)),
};
