import {
  getReviewDateLabel,
  getVerseProgress,
  type Verse,
  type VerseConfidence,
} from '../../../entities/verse';
import { Card } from '../../../shared/ui/Card/Card';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './VerseLearningComplete.module.css';

const confidenceLabels: Record<VerseConfidence, string> = {
  forgot: 'Не вспомнил',
  hard: 'С трудом',
  remembered: 'Вспомнил',
  easy: 'Очень легко',
};

const confidenceHints: Record<VerseConfidence, string> = {
  forgot: 'Вернём стих ближе',
  hard: 'Повторим завтра',
  remembered: 'Увеличим интервал',
  easy: 'Дадим памяти отдохнуть',
};

type VerseLearningCompleteProps = {
  verse: Verse;
  confidence?: VerseConfidence;
  remainingInQueue?: number;
  onSelectConfidence: (confidence: VerseConfidence) => void;
  onReturn: () => void;
  completionTitle?: string;
  question?: string;
  returnLabel?: string;
  nextLabel?: string;
  queueCompleteLabel?: string;
};

export function VerseLearningComplete({
  verse,
  confidence,
  remainingInQueue,
  onSelectConfidence,
  onReturn,
  completionTitle,
  question = 'Насколько легко удалось вспомнить стих?',
  returnLabel,
  nextLabel = 'Следующий стих',
  queueCompleteLabel = 'Завершить повторение',
}: VerseLearningCompleteProps) {
  const verseReference = `${verse.chapter ? `${verse.chapter}.` : ''}${verse.verseNumber}`;

  return (
    <Card className={styles.card}>
      <div className={styles.successIcon}>
        <Icon name="lotus" />
      </div>
      <span>Практика завершена</span>
      <h1>{completionTitle ?? `Ты повторил ${verse.bookTitle} ${verseReference}`}</h1>

      {!confidence ? (
        <>
          <p>{question}</p>
          <div className={styles.confidenceGrid}>
            {(Object.keys(confidenceLabels) as VerseConfidence[]).map((value) => (
              <button
                className={styles[value]}
                type="button"
                key={value}
                onClick={() => onSelectConfidence(value)}
              >
                <strong>{confidenceLabels[value]}</strong>
                <small>{confidenceHints[value]}</small>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.result}>
          <div>
            <span>Новый прогресс</span>
            <strong>{getVerseProgress(verse)}%</strong>
          </div>
          <p>Следующее повторение — {getReviewDateLabel(verse.nextReviewAt)}</p>
          {remainingInQueue !== undefined ? (
            <small className={styles.queueHint}>
              {remainingInQueue > 0
                ? `В очереди осталось: ${remainingInQueue}`
                : 'Очередь повторения завершена'}
            </small>
          ) : null}
          <button type="button" onClick={onReturn}>
            {remainingInQueue === undefined
              ? returnLabel ?? 'Вернуться к стихам'
              : remainingInQueue > 0
                ? nextLabel
                : queueCompleteLabel}
          </button>
        </div>
      )}
    </Card>
  );
}
