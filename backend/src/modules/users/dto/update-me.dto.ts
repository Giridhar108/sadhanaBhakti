import { z } from 'zod';

const calendarEventSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().trim().min(2),
  type: z.enum(['japa', 'reading', 'verse', 'meeting', 'other']),
});

const dailyVerseSchema = z.object({
  id: z.string(),
  image: z.string().optional(),
  text: z.string().trim().min(2),
  source: z.string().trim().min(2),
});

const japaGoalHistoryEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rounds: z.number().int().min(1).max(64),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).optional(),
  spiritualName: z.string().trim().optional(),
  practices: z.array(z.enum(['japa', 'books', 'verses'])).min(1).optional(),
  goals: z
    .object({
      japaRounds: z.number().int().min(1).max(64),
      readingPages: z.number().int().min(1).max(200),
      versesPerWeek: z.number().int().min(1).max(21),
    })
    .optional(),
  settings: z
    .object({
      dailyReminder: z.string().regex(/^\d{2}:\d{2}$/),
      japaStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      theme: z.enum(['light', 'soft']),
      calendarEvents: z.array(calendarEventSchema).optional(),
      dailyVerses: z.array(dailyVerseSchema).optional(),
      japaGoalHistory: z.array(japaGoalHistoryEntrySchema).optional(),
    })
    .optional(),
  isOnboarded: z.boolean().optional(),
});

export type UpdateMeDto = z.infer<typeof updateMeSchema>;
