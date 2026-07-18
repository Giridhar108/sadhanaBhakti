import type { User } from '@prisma/client';

export type PracticeId = 'japa' | 'books' | 'verses';
export type CalendarEventType = 'japa' | 'reading' | 'verse' | 'meeting' | 'other';

export type CalendarEventDto = {
  id: string;
  date: string;
  title: string;
  type: CalendarEventType;
};

export type DailyVerseDto = {
  id: string;
  image?: string;
  text: string;
  source: string;
};

export type JapaGoalHistoryEntryDto = {
  date: string;
  rounds: number;
};

export type AuthUserDto = {
  id: string;
  name: string;
  spiritualName: string;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  email: string;
  avatarUrl?: string;
  provider: 'email';
  practices: PracticeId[];
  goals: {
    japaRounds: number;
    readingPages: number;
    versesPerWeek: number;
  };
  settings: {
    dailyReminder: string;
    japaStartDate: string | null;
    theme: 'light' | 'soft';
    calendarEvents: CalendarEventDto[];
    dailyVerses: DailyVerseDto[];
    japaGoalHistory: JapaGoalHistoryEntryDto[];
  };
  createdAt: string;
  lastLoginAt: string;
  isOnboarded: boolean;
};

export function toAuthUserDto(user: User): AuthUserDto {
  const calendarEvents = Array.isArray(user.calendarEvents) ? user.calendarEvents : [];
  const dailyVerses = Array.isArray(user.dailyVerses) ? user.dailyVerses : [];
  const japaGoalHistory = Array.isArray(user.japaGoalHistory) ? user.japaGoalHistory : [];

  return {
    id: user.id,
    name: user.name,
    spiritualName: user.spiritualName,
    birthDate: user.birthDate,
    gender: user.gender as AuthUserDto['gender'],
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    provider: user.provider.toLowerCase() as AuthUserDto['provider'],
    practices: user.practices as PracticeId[],
    goals: {
      japaRounds: user.japaRounds,
      readingPages: user.readingPages,
      versesPerWeek: user.versesPerWeek,
    },
    settings: {
      dailyReminder: user.dailyReminder,
      japaStartDate: user.japaStartDate,
      theme: user.theme === 'light' ? 'light' : 'soft',
      calendarEvents: calendarEvents as CalendarEventDto[],
      dailyVerses: dailyVerses as DailyVerseDto[],
      japaGoalHistory: japaGoalHistory as JapaGoalHistoryEntryDto[],
    },
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt.toISOString(),
    isOnboarded: user.isOnboarded,
  };
}
