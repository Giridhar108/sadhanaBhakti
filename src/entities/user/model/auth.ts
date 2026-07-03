import {
  type AuthDraft,
  type AuthGoals,
  type AuthPractice,
  type AuthUser,
  type LoginAccountInput,
  type RegisterAccountInput,
} from './types';

const authUserKey = 'hare-krishna-auth-user';
const authDraftKey = 'hare-krishna-auth-draft';

export const defaultPractices: AuthPractice[] = ['japa', 'books', 'verses'];

export const defaultGoals: AuthGoals = {
  japaRounds: 16,
  readingPages: 10,
  versesPerWeek: 1,
};

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson<TValue>(key: string, fallback: TValue): TValue {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as TValue;
  } catch {
    return fallback;
  }
}

function writeJson<TValue>(key: string, value: TValue) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUserDisplayName(user: Pick<AuthUser, 'name' | 'spiritualName'> | null | undefined) {
  return user?.spiritualName || user?.name || 'Практикующий';
}

export function readAuthUser() {
  return readJson<AuthUser | null>(authUserKey, null);
}

export function writeAuthUser(user: AuthUser) {
  writeJson(authUserKey, user);
}

export function readAuthDraft() {
  return readJson<AuthDraft>(authDraftKey, {});
}

export function writeAuthDraft(draft: AuthDraft) {
  const currentDraft = readAuthDraft();

  writeJson(authDraftKey, {
    ...currentDraft,
    ...draft,
  });
}

export function clearAuthDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(authDraftKey);
}

export function startEmailRegistration(input: RegisterAccountInput) {
  writeAuthDraft({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordLength: input.password.length,
    provider: 'email',
    practices: defaultPractices,
    goals: defaultGoals,
  });
}

export function startGoogleRegistration() {
  writeAuthDraft({
    name: 'Гость практики',
    email: 'google-user@example.com',
    provider: 'google',
    practices: defaultPractices,
    goals: defaultGoals,
  });
}

export function completeOnboarding() {
  const draft = readAuthDraft();
  const now = new Date().toISOString();
  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: draft.name?.trim() || 'Практикующий',
    spiritualName: draft.spiritualName?.trim() ?? '',
    email: draft.email?.trim().toLowerCase() || 'practice@example.com',
    provider: draft.provider ?? 'email',
    practices: draft.practices?.length ? draft.practices : defaultPractices,
    goals: draft.goals ?? defaultGoals,
    createdAt: now,
    lastLoginAt: now,
    isOnboarded: true,
  };

  writeAuthUser(user);
  clearAuthDraft();

  return user;
}

export function loginWithEmail(input: LoginAccountInput) {
  const user = readAuthUser();
  const email = input.email.trim().toLowerCase();

  if (!user) {
    return {
      ok: false,
      message: 'Аккаунт пока не найден. Создай его, чтобы сохранить практику.',
    } as const;
  }

  if (user.email !== email) {
    return {
      ok: false,
      message: 'Для этого email ещё нет локального аккаунта.',
    } as const;
  }

  if (input.password.length < 8) {
    return {
      ok: false,
      message: 'Пароль должен быть не короче 8 символов.',
    } as const;
  }

  const nextUser: AuthUser = {
    ...user,
    lastLoginAt: new Date().toISOString(),
  };

  writeAuthUser(nextUser);

  return {
    ok: true,
    user: nextUser,
  } as const;
}
