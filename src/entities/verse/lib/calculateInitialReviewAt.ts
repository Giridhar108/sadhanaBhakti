const afternoonStartsAtHour = 14;
const eveningReviewHour = 19;
const morningReviewHour = 8;

const formatLocalDateTime = (date: Date) => [
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-'),
  [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':'),
].join('T');

export const calculateInitialReviewAt = (startedAt = new Date()) => {
  const nextReview = new Date(startedAt);

  if (startedAt.getHours() < afternoonStartsAtHour) {
    nextReview.setHours(eveningReviewHour, 0, 0, 0);
  } else {
    nextReview.setDate(nextReview.getDate() + 1);
    nextReview.setHours(morningReviewHour, 0, 0, 0);
  }

  return formatLocalDateTime(nextReview);
};
