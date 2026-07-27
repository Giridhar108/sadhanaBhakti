import { getVerseLines, type Verse } from '../../../entities/verse';
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
        lines={getVerseLines(verse.sanskritCyrillic)}
        variant="sanskrit"
      />
      <VerseLines
        title="Перевод"
        lines={getVerseLines(verse.translation)}
        variant="translation"
      />

      <button className={styles.primaryButton} type="button" onClick={onStart}>
        <Icon name="lotus" />
        Начать запоминание
      </button>
    </Card>
  );
}
