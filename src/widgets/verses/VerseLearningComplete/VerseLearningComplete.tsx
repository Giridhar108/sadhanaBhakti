import {
  getReviewDateLabel,
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
  onSelectConfidence: (confidence: VerseConfidence) => void;
  onReturn: () => void;
};

export function VerseLearningComplete({
  verse,
  confidence,
  onSelectConfidence,
  onReturn,
}: VerseLearningCompleteProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.successIcon}>
        <Icon name="lotus" />
      </div>
      <span>Практика завершена</span>
      <h1>Ты повторил {verse.sourceTitle} {verse.reference}</h1>

      {!confidence ? (
        <>
          <p>Насколько легко удалось вспомнить стих?</p>
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
            <strong>{verse.progress}%</strong>
          </div>
          <p>Следующее повторение — {getReviewDateLabel(verse.nextReviewAt)}</p>
          <button type="button" onClick={onReturn}>
            Вернуться к стихам
          </button>
        </div>
      )}
    </Card>
  );
}
