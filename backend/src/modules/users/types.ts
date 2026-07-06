import type { User } from '@prisma/client';

export type PracticeId = 'japa' | 'books' | 'verses';

export type AuthUserDto = {
  id: string;
  name: string;
  spiritualName: string;
  email: string;
  avatarUrl?: string;
  provider: 'email';
  practices: PracticeId[];
  goals: {
    japaRounds: number;
    readingPages: number;
    versesPerWeek: number;
  };
  createdAt: string;
  lastLoginAt: string;
  isOnboarded: boolean;
};

export function toAuthUserDto(user: User): AuthUserDto {
  return {
    id: user.id,
    name: user.name,
    spiritualName: user.spiritualName,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    provider: user.provider.toLowerCase() as AuthUserDto['provider'],
    practices: user.practices as PracticeId[],
    goals: {
      japaRounds: user.japaRounds,
      readingPages: user.readingPages,
      versesPerWeek: user.versesPerWeek,
    },
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt.toISOString(),
    isOnboarded: user.isOnboarded,
  };
}
