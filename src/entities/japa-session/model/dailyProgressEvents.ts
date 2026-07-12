import type { JapaDailyProgress } from './types';

export const japaDailyProgressChanged = 'sadhana:japa-daily-progress-changed';

export type JapaDailyProgressChangedDetail = {
  progress: JapaDailyProgress;
};

export function dispatchJapaDailyProgressChanged(progress: JapaDailyProgress) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<JapaDailyProgressChangedDetail>(japaDailyProgressChanged, {
      detail: { progress },
    }),
  );
}
