import { z } from 'zod';
import { defaultGoals } from '../../../entities/user/model/auth';
import type { AuthUser } from '../../../entities/user/model/types';
import type { CalendarEventType } from '../../../shared/lib/calendarEvents';
import { getTodayDateKey } from '../../../shared/lib/japaProgress';

export const cropFrameSize = 260;
const cropOutputSize = 320;

export type CropOffset = {
  x: number;
  y: number;
};

export type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

export type AudioUploadDraft = {
  id: string;
  file: File;
  title: string;
  subtitle: string;
};

export const settingsSchema = z.object({
  dailyReminder: z.string().min(4),
  dailyGoal: z.coerce.number().min(1).max(64),
  japaStartDate: z.string(),
});

export const personalDataSchema = z.object({
  birthDate: z.string(),
  gender: z.enum(['', 'male', 'female']),
});

export const eventSchema = z.object({
  date: z.string().min(10),
  title: z.string().trim().min(2),
  type: z.enum(['japa', 'reading', 'verse', 'meeting', 'other']),
});

export const verseSchema = z.object({
  text: z.string().trim().min(2),
  source: z.string().trim().min(2),
});

export type SettingsForm = z.infer<typeof settingsSchema>;
export type PersonalDataForm = z.infer<typeof personalDataSchema>;
export type EventForm = z.infer<typeof eventSchema>;
export type VerseForm = z.infer<typeof verseSchema>;

export const eventTypeLabels: Record<CalendarEventType, string> = {
  japa: 'Джапа',
  reading: 'Чтение',
  verse: 'Стихи',
  meeting: 'Встреча',
  other: 'Другое',
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getNextJapaGoalHistory(
  currentHistory: AuthUser['settings']['japaGoalHistory'],
  currentGoal: number,
  nextGoal: number,
) {
  if (currentGoal === nextGoal && (currentHistory.length > 0 || nextGoal === defaultGoals.japaRounds)) {
    return currentHistory;
  }

  const today = getTodayDateKey();
  const historyWithoutToday = currentHistory.filter((entry) => entry.date !== today);

  return [...historyWithoutToday, { date: today, rounds: nextGoal }].sort((firstEntry, secondEntry) =>
    firstEntry.date.localeCompare(secondEntry.date),
  );
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} КБ`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

export function getTitleFromAudioFile(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '').trim() || 'Аудио для практики';
}

export function createCroppedCircle(imageSrc: string, zoom: number, offset: CropOffset) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas is not available'));
        return;
      }

      canvas.width = cropOutputSize;
      canvas.height = cropOutputSize;
      context.clearRect(0, 0, cropOutputSize, cropOutputSize);
      context.save();
      context.beginPath();
      context.arc(cropOutputSize / 2, cropOutputSize / 2, cropOutputSize / 2, 0, Math.PI * 2);
      context.clip();

      const baseScale = Math.min(cropOutputSize / image.naturalWidth, cropOutputSize / image.naturalHeight);
      const scale = baseScale * zoom;
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const offsetScale = cropOutputSize / cropFrameSize;
      const x = (cropOutputSize - width) / 2 + offset.x * offsetScale;
      const y = (cropOutputSize - height) / 2 + offset.y * offsetScale;

      context.fillStyle = '#fffefa';
      context.fillRect(0, 0, cropOutputSize, cropOutputSize);
      context.drawImage(image, x, y, width, height);
      context.restore();
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image could not be compressed'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        },
        'image/webp',
        0.82,
      );
    };

    image.onerror = () => reject(new Error('Image could not be loaded'));
    image.src = imageSrc;
  });
}
