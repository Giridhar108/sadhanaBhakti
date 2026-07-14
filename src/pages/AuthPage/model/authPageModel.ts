import { z } from 'zod';
import type { AuthGoals, AuthPractice } from '../../../entities/user/model/types';

export type AuthView = 'welcome' | 'login' | 'register' | 'name' | 'practices' | 'goals';

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type NameForm = z.infer<typeof nameSchema>;

export type PracticeCard = {
  id: AuthPractice;
  title: string;
  description: string;
  icon: 'mala' | 'book' | 'scroll';
  tone: 'green' | 'violet' | 'gold';
};

export type GoalCard = {
  key: keyof AuthGoals;
  title: string;
  label: string;
  unit: string;
  icon: 'mala' | 'book' | 'scroll';
  tone: 'green' | 'violet' | 'gold';
  step: number;
  min: number;
  max: number;
};

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, '\u041d\u0430\u043f\u0438\u0448\u0438 \u0438\u043c\u044f, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0443.'),
    email: z.string().trim().email('\u0423\u043a\u0430\u0436\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 email.'),
    password: z.string().min(8, '\u041c\u0438\u043d\u0438\u043c\u0443\u043c 8 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.'),
    confirmPassword: z.string().min(1, '\u041f\u043e\u0432\u0442\u043e\u0440\u0438 \u043f\u0430\u0440\u043e\u043b\u044c.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '\u041f\u0430\u0440\u043e\u043b\u0438 \u043d\u0435 \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u044e\u0442.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('\u0423\u043a\u0430\u0436\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 email.'),
  password: z.string().min(8, '\u041c\u0438\u043d\u0438\u043c\u0443\u043c 8 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.'),
});

export const nameSchema = z.object({
  name: z.string().trim().min(2, '\u0418\u043c\u044f \u043d\u0443\u0436\u043d\u043e \u0434\u043b\u044f \u043f\u0440\u043e\u0444\u0438\u043b\u044f.'),
  spiritualName: z.string().trim().optional(),
});

export const viewTitles: Record<AuthView, string> = {
  welcome: '\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
  login: '\u0412\u0445\u043e\u0434 - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
  register: '\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044f - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
  name: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0438 - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
  practices: '\u0412\u044b\u0431\u043e\u0440 \u043f\u0440\u0430\u043a\u0442\u0438\u043a - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
  goals: '\u0426\u0435\u043b\u0438 \u043f\u0440\u0430\u043a\u0442\u0438\u043a\u0438 - \u0421\u0430\u0434\u0445\u0430\u043d\u0430 \u0411\u0445\u0430\u043a\u0442\u0438',
};

export const practiceCards: PracticeCard[] = [
  {
    id: 'japa',
    title: '\u0414\u0436\u0430\u043f\u0430',
    description: '\u041e\u0442\u043c\u0435\u0447\u0430\u0439 \u043a\u0440\u0443\u0433\u0438 \u0438 \u0441\u0435\u0440\u0438\u0438',
    icon: 'mala',
    tone: 'green',
  },
  {
    id: 'books',
    title: '\u0427\u0442\u0435\u043d\u0438\u0435 \u043a\u043d\u0438\u0433',
    description: '\u0417\u0430\u043f\u0438\u0441\u044b\u0432\u0430\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0438 \u0446\u0435\u043b\u044c \u043d\u0430 \u0434\u0435\u043d\u044c',
    icon: 'book',
    tone: 'violet',
  },
  {
    id: 'verses',
    title: '\u0418\u0437\u0443\u0447\u0435\u043d\u0438\u0435 \u0441\u0442\u0438\u0445\u043e\u0432',
    description: '\u041f\u043e\u0432\u0442\u043e\u0440\u044f\u0439, \u0443\u0447\u0438 \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439 \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441',
    icon: 'scroll',
    tone: 'gold',
  },
];

export const goalCards: GoalCard[] = [
  {
    key: 'japaRounds',
    title: '\u0414\u0436\u0430\u043f\u0430',
    label: '\u0426\u0435\u043b\u044c \u043d\u0430 \u0434\u0435\u043d\u044c',
    unit: '\u043a\u0440\u0443\u0433\u043e\u0432',
    icon: 'mala',
    tone: 'green',
    step: 1,
    min: 1,
    max: 64,
  },
  {
    key: 'readingPages',
    title: '\u0427\u0442\u0435\u043d\u0438\u0435 \u043a\u043d\u0438\u0433',
    label: '\u0426\u0435\u043b\u044c \u043d\u0430 \u0434\u0435\u043d\u044c',
    unit: '\u0441\u0442\u0440\u0430\u043d\u0438\u0446 \u0432 \u0434\u0435\u043d\u044c',
    icon: 'book',
    tone: 'violet',
    step: 1,
    min: 1,
    max: 200,
  },
  {
    key: 'versesPerWeek',
    title: '\u0418\u0437\u0443\u0447\u0435\u043d\u0438\u0435 \u0441\u0442\u0438\u0445\u043e\u0432',
    label: '\u0426\u0435\u043b\u044c \u043d\u0430 \u043d\u0435\u0434\u0435\u043b\u044e',
    unit: '\u0441\u0442\u0438\u0445 \u0432 \u043d\u0435\u0434\u0435\u043b\u044e',
    icon: 'scroll',
    tone: 'gold',
    step: 1,
    min: 1,
    max: 21,
  },
];

export function getAuthView(pathname: string): AuthView {
  if (pathname.endsWith('/login')) {
    return 'login';
  }

  if (pathname.endsWith('/register')) {
    return 'register';
  }

  if (pathname.endsWith('/onboarding/name')) {
    return 'name';
  }

  if (pathname.endsWith('/onboarding/practices')) {
    return 'practices';
  }

  if (pathname.endsWith('/onboarding/goals')) {
    return 'goals';
  }

  return 'welcome';
}
