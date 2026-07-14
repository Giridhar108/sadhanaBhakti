import { z } from 'zod';

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().max(65535).default(4000),
    FRONTEND_URL: z
      .string()
      .url()
      .transform((value) => value.replace(/\/$/, ''))
      .default('http://localhost:5173'),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    AUDIO_UPLOAD_DIR: z.string().min(1).optional(),
  })
  .superRefine((environment, context) => {
    const frontendUrl = new URL(environment.FRONTEND_URL);

    if (frontendUrl.pathname !== '/' || frontendUrl.search || frontendUrl.hash) {
      context.addIssue({
        code: 'custom',
        path: ['FRONTEND_URL'],
        message: 'must be an origin without a path, query string or fragment',
      });
    }

    if (environment.NODE_ENV !== 'production') {
      return;
    }

    if (
      frontendUrl.protocol !== 'https:' &&
      !['localhost', '127.0.0.1'].includes(frontendUrl.hostname)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['FRONTEND_URL'],
        message: 'must use HTTPS in production',
      });
    }

    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      const secret = environment[key];

      const normalizedSecret = secret.toLowerCase();

      if (
        secret.length < 32 ||
        normalizedSecret.includes('change-me') ||
        normalizedSecret.includes('replace-')
      ) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'must be a unique production secret with at least 32 characters',
        });
      }
    }
  });

export function validateEnvironment(input: Record<string, unknown>) {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}
