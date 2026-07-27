import type { Verse } from '../../../entities/verse';
import { Card } from '../../../shared/ui/Card/Card';
import { Icon } from '../../../shared/ui/Icon/Icon';
import { VerseLines } from '../VerseLines/VerseLines';
import styles from './VerseLearningIntro.module.css';

type VerseLearningIntroProps = {
  verse: Verse;
  onStart: () => void;
};

export function VerseLearningIntro({ verse, onStart }: VerseLearningIntroProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.heading}>
        <span>Шаг 1</span>
        <h1>Познакомься со стихом</h1>
        <p>Сначала спокойно прочитай санскрит и перевод целиком.</p>
      </div>

      <VerseLines
        title="Санскрит русскими буквами"
        lines={verse.sanskritCyrillicLines}
        variant="sanskrit"
      />
      <VerseLines
        title="Перевод"
        lines={verse.translationLines}
        fallback={verse.fullTranslation}
        variant="translation"
      />

      {verse.audioUrl ? (
        <audio className={styles.audio} controls src={verse.audioUrl}>
          Браузер не поддерживает воспроизведение аудио.
        </audio>
      ) : null}

      <button className={styles.primaryButton} type="button" onClick={onStart}>
        <Icon name="lotus" />
        Начать запоминание
      </button>
    </Card>
  );
}
