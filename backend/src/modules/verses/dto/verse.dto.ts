import { z } from 'zod';

const nonBlankText = (message: string, maxLength: number) =>
  z.string().max(maxLength).refine((value) => value.trim().length > 0, message);

export const createVerseSchema = z.object({
  bookTitle: nonBlankText('Укажи название книги', 120),
  chapter: z.string().max(120).nullable().optional(),
  verseNumber: nonBlankText('Укажи номер стиха', 50),
  sanskritCyrillic: nonBlankText('Добавь текст стиха', 5000),
  translation: nonBlankText('Добавь перевод', 10000),
});

export const updateVerseSchema = createVerseSchema.partial().extend({
  status: z.enum(['new', 'learning', 'review', 'learned', 'needsReview']).optional(),
  sanskritProgress: z.number().int().min(0).max(100).optional(),
  translationProgress: z.number().int().min(0).max(100).optional(),
  repetitionLevel: z.number().int().min(0).max(5).optional(),
  nextReviewAt: z.string().nullable().optional(),
  lastReviewedAt: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
});

export type CreateVerseDto = z.infer<typeof createVerseSchema>;
export type UpdateVerseDto = z.infer<typeof updateVerseSchema>;
