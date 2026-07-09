import type { AudioTrack } from '@prisma/client';

export type AudioTrackDto = {
  id: string;
  title: string;
  subtitle: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  createdAt: string;
};

export type UploadedAudioFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export function toAudioTrackDto(track: AudioTrack): AudioTrackDto {
  return {
    id: track.id,
    title: track.title,
    subtitle: track.subtitle,
    fileUrl: `/audio/${track.id}/file`,
    originalName: track.originalName,
    mimeType: track.mimeType,
    size: track.size,
    duration: track.duration ?? undefined,
    createdAt: track.createdAt.toISOString(),
  };
}
