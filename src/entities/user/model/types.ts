export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type UserGender = 'male' | 'female';

export type AuthPractice = 'japa' | 'books' | 'verses';

export type AuthGoals = {
  japaRounds: number;
  readingPages: number;
  versesPerWeek: number;
};

export type CalendarEventType = 'japa' | 'reading' | 'verse' | 'meeting' | 'other';

export type CalendarEventSetting = {
  id: string;
  date: string;
  title: string;
  type: CalendarEventType;
};

export type DailyVerseSetting = {
  id: string;
  image?: string;
  text: string;
  source: string;
};

export type JapaGoalHistoryEntry = {
  date: string;
  rounds: number;
};

export type AuthUser = User & {
  spiritualName: string;
  birthDate: string | null;
  gender: UserGender | null;
  practices: AuthPractice[];
  goals: AuthGoals;
  settings: {
    dailyReminder: string;
    japaStartDate: string | null;
    theme: 'light' | 'soft';
    calendarEvents: CalendarEventSetting[];
    dailyVerses: DailyVerseSetting[];
    japaGoalHistory: JapaGoalHistoryEntry[];
  };
  provider: 'email';
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
