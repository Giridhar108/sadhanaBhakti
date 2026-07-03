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

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Напиши имя, чтобы персонализировать практику.'),
  email: z.string().trim().email('Укажи корректный email.'),
  password: z.string().min(8, 'Минимум 8 символов.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Укажи корректный email.'),
  password: z.string().min(8, 'Минимум 8 символов.'),
});

export const nameSchema = z.object({
  name: z.string().trim().min(2, 'Имя нужно для профиля.'),
  spiritualName: z.string().trim().optional(),
});

export const viewTitles: Record<AuthView, string> = {
  welcome: 'Добро пожаловать - Садхана Бхакти',
  login: 'Вход - Садхана Бхакти',
  register: 'Регистрация - Садхана Бхакти',
  name: 'Профиль практики - Садхана Бхакти',
  practices: 'Выбор практик - Садхана Бхакти',
  goals: 'Цели практики - Садхана Бхакти',
};

export const practiceCards: PracticeCard[] = [
  {
    id: 'japa',
    title: 'Джапа',
    description: 'Отмечай круги и серии',
    icon: 'mala',
    tone: 'green',
  },
  {
    id: 'books',
    title: 'Чтение книг',
    description: 'Записывай страницы и цель на день',
    icon: 'book',
    tone: 'violet',
  },
  {
    id: 'verses',
    title: 'Изучение стихов',
    description: 'Повторяй, учи и отслеживай прогресс',
    icon: 'scroll',
    tone: 'gold',
  },
];

export const goalCards: GoalCard[] = [
  {
    key: 'japaRounds',
    title: 'Джапа',
    label: 'Цель на день',
    unit: 'кругов',
    icon: 'mala',
    tone: 'green',
    step: 1,
    min: 1,
    max: 64,
  },
  {
    key: 'readingPages',
    title: 'Чтение книг',
    label: 'Цель на день',
    unit: 'страниц в день',
    icon: 'book',
    tone: 'violet',
    step: 1,
    min: 1,
    max: 200,
  },
  {
    key: 'versesPerWeek',
    title: 'Изучение стихов',
    label: 'Цель на неделю',
    unit: 'стих в неделю',
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
