import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export type RegisterDto = z.infer<typeof registerSchema>;
