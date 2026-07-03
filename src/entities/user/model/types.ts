export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthPractice = 'japa' | 'books' | 'verses';

export type AuthGoals = {
  japaRounds: number;
  readingPages: number;
  versesPerWeek: number;
};

export type AuthUser = User & {
  spiritualName: string;
  practices: AuthPractice[];
  goals: AuthGoals;
  provider: 'email' | 'google';
  createdAt: string;
  lastLoginAt: string;
  isOnboarded: boolean;
};

export type AuthDraft = {
  name?: string;
  spiritualName?: string;
  email?: string;
  passwordLength?: number;
  practices?: AuthPractice[];
  goals?: AuthGoals;
  provider?: AuthUser['provider'];
};

export type RegisterAccountInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginAccountInput = {
  email: string;
  password: string;
};
