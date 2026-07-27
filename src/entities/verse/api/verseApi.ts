import { endpoints } from '../../../shared/api/endpoints';
import { httpClient } from '../../../shared/api/httpClient';
import type { UserVerse, VerseEditorValues } from '../model/types';

export type VerseProgressPatch = Partial<
  Pick<
    UserVerse,
    | 'status'
    | 'sanskritProgress'
    | 'translationProgress'
    | 'repetitionLevel'
    | 'nextReviewAt'
    | 'lastReviewedAt'
    | 'isFavorite'
  >
>;

export const verseApi = {
  getAll: () => httpClient.get<UserVerse[]>(endpoints.verses.root),
  getById: (verseId: string) => httpClient.get<UserVerse>(endpoints.verses.item(verseId)),
  create: (values: VerseEditorValues) => httpClient.post<UserVerse>(endpoints.verses.root, values),
  update: (verseId: string, values: VerseEditorValues | VerseProgressPatch) =>
    httpClient.patch<UserVerse>(endpoints.verses.item(verseId), values),
  delete: (verseId: string) => httpClient.delete<{ ok: true }>(endpoints.verses.item(verseId)),
};
