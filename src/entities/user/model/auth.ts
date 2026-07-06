import { endpoints } from '../../../shared/api/endpoints';
import { httpClient } from '../../../shared/api/httpClient';
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
const authUserChangeEvent = 'auth-user-change';

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

function notifyAuthUserChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(authUserChangeEvent));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function writeDraftFromUser(user: AuthUser, passwordLength?: number) {
  writeAuthDraft({
    name: user.name,
    spiritualName: user.spiritualName,
    email: user.email,
    passwordLength,
    provider: user.provider,
    practices: user.practices,
    goals: user.goals,
  });
}

export function getUserDisplayName(user: Pick<AuthUser, 'name' | 'spiritualName'> | null | undefined) {
  return user?.spiritualName || user?.name || 'Практикующий';
}

export function readAuthUser() {
  return readJson<AuthUser | null>(authUserKey, null);
}

export function writeAuthUser(user: AuthUser) {
  writeJson(authUserKey, user);
  notifyAuthUserChanged();
}

export function clearAuthUser() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(authUserKey);
  notifyAuthUserChanged();
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

export async function startEmailRegistration(input: RegisterAccountInput) {
  try {
    const user = await httpClient.post<AuthUser>(endpoints.auth.register, {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    writeAuthUser(user);
    writeDraftFromUser(user, input.password.length);

    return { ok: true, user } as const;
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'Не удалось создать аккаунт. Проверь backend и попробуй ещё раз.'),
    } as const;
  }
}

export async function loginWithEmail(input: LoginAccountInput) {
  try {
    const user = await httpClient.post<AuthUser>(endpoints.auth.login, {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    writeAuthUser(user);

    return { ok: true, user } as const;
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'Не удалось войти. Проверь email и пароль.'),
    } as const;
  }
}

export async function completeOnboarding() {
  const draft = readAuthDraft();

  try {
    const user = await httpClient.patch<AuthUser>(endpoints.users.me, {
      name: draft.name,
      spiritualName: draft.spiritualName,
      practices: draft.practices?.length ? draft.practices : defaultPractices,
      goals: draft.goals ?? defaultGoals,
      isOnboarded: true,
    });

    writeAuthUser(user);
    clearAuthDraft();

    return { ok: true, user } as const;
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, 'Не удалось сохранить онбординг. Проверь backend-сессию.'),
    } as const;
  }
}

export async function loadAuthSession() {
  try {
    const user = await httpClient.get<AuthUser>(endpoints.users.me);

    writeAuthUser(user);

    return user;
  } catch {
    try {
      await httpClient.post(endpoints.auth.refresh);
      const user = await httpClient.get<AuthUser>(endpoints.users.me);

      writeAuthUser(user);

      return user;
    } catch {
      clearAuthUser();

      return null;
    }
  }
}

export function subscribeToAuthUserChange(listener: () => void) {
  window.addEventListener(authUserChangeEvent, listener);

  return () => {
    window.removeEventListener(authUserChangeEvent, listener);
  };
}
