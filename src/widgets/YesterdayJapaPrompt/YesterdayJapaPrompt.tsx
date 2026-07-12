import { useEffect, useState } from 'react';
import { japaApi } from '../../entities/japa-session/api/japaApi';
import { dispatchJapaDailyProgressChanged } from '../../entities/japa-session/model/dailyProgressEvents';
import type { AuthUser } from '../../entities/user/model/types';
import { defaultGoals } from '../../entities/user/model/auth';
import { formatJapaDate, getTodayDateKey, normalizeJapaCompletedRounds } from '../../shared/lib/japaProgress';
import styles from './YesterdayJapaPrompt.module.css';

type YesterdayJapaPromptProps = {
  enabled: boolean;
  user: AuthUser | null;
};

type PromptState = {
  date: string;
  storageKey: string;
};

const promptStoragePrefix = 'sadhana-yesterday-japa-prompt';

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getYesterdayDateKey = () => {
  const date = new Date();

  date.setDate(date.getDate() - 1);
  return toDateKey(date);
};

const readPromptDismissed = (storageKey: string) => {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(storageKey) === '1';
};

const markPromptDismissed = (storageKey: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, '1');
};

export function YesterdayJapaPrompt({ enabled, user }: YesterdayJapaPromptProps) {
  const [prompt, setPrompt] = useState<PromptState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!enabled || !user?.practices.includes('japa')) {
      setPrompt(null);
      return undefined;
    }

    const todayDateKey = getTodayDateKey();
    const yesterdayDateKey = getYesterdayDateKey();

    if (user.settings.japaStartDate && user.settings.japaStartDate > yesterdayDateKey) {
      return undefined;
    }

    const storageKey = `${promptStoragePrefix}:${user.id}:${todayDateKey}`;

    if (readPromptDismissed(storageKey)) {
      return undefined;
    }

    let isActive = true;

    japaApi
      .getToday(yesterdayDateKey)
      .then((progress) => {
        if (!isActive) {
          return;
        }

        const yesterdayRounds = normalizeJapaCompletedRounds(progress.rounds);

        if (yesterdayRounds >= defaultGoals.japaRounds) {
          markPromptDismissed(storageKey);
          return;
        }

        setPrompt({ date: yesterdayDateKey, storageKey });
      })
      .catch(() => {
        if (isActive) {
          markPromptDismissed(storageKey);
        }
      });

    return () => {
      isActive = false;
    };
  }, [enabled, user?.id, user?.practices, user?.settings.japaStartDate]);

  useEffect(() => {
    if (!prompt) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [prompt]);

  if (!prompt) {
    return null;
  }

  const closePrompt = () => {
    markPromptDismissed(prompt.storageKey);
    setPrompt(null);
    setStatus('');
  };

  const confirmYesterdayRounds = async () => {
    setIsSaving(true);
    setStatus('');

    try {
      const progress = await japaApi.updateToday({
        date: prompt.date,
        rounds: defaultGoals.japaRounds,
        goalRounds: defaultGoals.japaRounds,
      });

      dispatchJapaDailyProgressChanged(progress);
      closePrompt();
    } catch {
      setStatus('Не удалось сохранить круги за вчера. Проверь backend-сессию.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="yesterday-japa-title">
        <div className={styles.icon} aria-hidden="true">
          16
        </div>
        <h2 id="yesterday-japa-title">Ты прочитал 16 кругов вчера?</h2>
        <p>
          За {formatJapaDate(prompt.date)} ещё нет отметки о полной дневной норме. Если ты прочитал 16 кругов,
          я добавлю их во вчерашний прогресс.
        </p>
        <div className={styles.actions}>
          <button className={`${styles.button} ${styles.secondaryButton}`} type="button" onClick={closePrompt} disabled={isSaving}>
            Нет
          </button>
          <button className={`${styles.button} ${styles.primaryButton}`} type="button" onClick={confirmYesterdayRounds} disabled={isSaving}>
            Да, прочитал
          </button>
        </div>
        {status ? <p className={styles.status}>{status}</p> : null}
      </section>
    </div>
  );
}
