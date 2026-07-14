import { z } from 'zod';

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const japaTodayQuerySchema = z.object({
  date: dateKeySchema.optional(),
});

export const japaHistoryQuerySchema = z.object({
  from: dateKeySchema.optional(),
  to: dateKeySchema.optional(),
});

export const updateJapaTodaySchema = z.object({
  date: dateKeySchema,
  rounds: z.number().int().min(0).max(192).optional(),
  goalRounds: z.number().int().min(1).max(192).nullable().optional(),
});

export type JapaHistoryQueryDto = z.infer<typeof japaHistoryQuerySchema>;
export type JapaTodayQueryDto = z.infer<typeof japaTodayQuerySchema>;
export type UpdateJapaTodayDto = z.infer<typeof updateJapaTodaySchema>;
