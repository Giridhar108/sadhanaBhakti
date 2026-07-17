export type AudioTrack = {
  id: string;
  title: string;
  subtitle: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number;
  createdAt: string;
  isDefault?: boolean;
};

export type UploadAudioTrackInput = {
  title: string;
  subtitle: string;
  file: File;
};
