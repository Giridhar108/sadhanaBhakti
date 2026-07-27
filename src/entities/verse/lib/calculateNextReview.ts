import type { VerseConfidence } from '../model/types';

const reviewIntervals = [0, 1, 3, 7, 14, 30] as const;

const clampLevel = (level: number) => Math.min(reviewIntervals.length - 1, Math.max(0, Math.round(level)));

export const calculateNextReview = (
  confidence: VerseConfidence,
  currentLevel: number,
): {
  nextReviewInDays: number;
  nextLevel: number;
} => {
  const level = clampLevel(currentLevel);

  if (confidence === 'forgot') {
    const nextLevel = Math.max(0, level - 1);

    return {
      nextReviewInDays: nextLevel === 0 ? 0 : 1,
      nextLevel,
    };
  }

  if (confidence === 'hard') {
    return {
      nextReviewInDays: 1,
      nextLevel: level,
    };
  }

  if (confidence === 'remembered') {
    const nextLevel = Math.min(reviewIntervals.length - 1, Math.max(2, level + 1));

    return {
      nextReviewInDays: reviewIntervals[Math.min(3, nextLevel)],
      nextLevel,
    };
  }

  const nextLevel = Math.min(reviewIntervals.length - 1, Math.max(3, level + 2));

  return {
    nextReviewInDays: reviewIntervals[nextLevel],
    nextLevel,
  };
};
