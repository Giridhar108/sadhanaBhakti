import { z } from 'zod';

export const prayerCategorySchema = z.enum([
  'morning-program',
  'guru',
  'gaura',
  'narasimha',
  'tulasi',
  'arati',
  'kirtan',
  'other',
]);

export const prayerWordSchema = z.object({
  id: z.string(),
  original: z.string(),
  pronunciation: z.string(),
  translation: z.string(),
});

export const prayerVerseSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  transliteration: z.string(),
  russianPronunciation: z.string(),
  words: z.array(prayerWordSchema),
  translation: z.string(),
  explanation: z.string().optional(),
});

export const prayerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortTitle: z.string().optional(),
  openingWords: z.string(),
  author: z.string().optional(),
  category: prayerCategorySchema,
  description: z.string().optional(),
  coverImage: z.string().optional(),
  totalVerses: z.number().int().positive(),
  verses: z.array(prayerVerseSchema),
  isAvailable: z.boolean(),
});

export const prayersSchema = z.array(prayerSchema);
