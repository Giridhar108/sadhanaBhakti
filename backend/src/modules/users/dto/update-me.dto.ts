import { z } from 'zod';

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
  isOnboarded: z.boolean().optional(),
});

export type UpdateMeDto = z.infer<typeof updateMeSchema>;
