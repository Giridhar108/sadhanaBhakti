import type {
  Verse,
  VerseLearningSession,
  VerseLearningView,
} from '../../../entities/verse';
import { getVerseLines } from '../../../entities/verse';
import { Card } from '../../../shared/ui/Card/Card';
import { VerseTextSwitcher } from '../VerseTextSwitcher/VerseTextSwitcher';
import styles from './VerseMemorization.module.css';

type VerseMemorizationProps = {
  verse: Verse;
  session: VerseLearningSession;
  onChangeView: (view: VerseLearningView) => void;
  onChangeLine: (lineIndex: number) => void;
  onToggleVisibility: (lineIndex: number) => void;
  onFinish: () => void;
};

export function VerseMemorization({
  verse,
  session,
  onChangeView,
  onChangeLine,
  onToggleVisibility,
  onFinish,
}: VerseMemorizationProps) {
  const translationLines = getVerseLines(verse.translation);
  const sanskritLines = getVerseLines(verse.sanskritCyrillic);
  const lines = session.activeView === 'sanskrit'
    ? sanskritLines
    : translationLines;
  const currentLineIndex = session.activeView === 'sanskrit'
    ? session.progressState.sanskritLineIndex
    : session.progressState.translationLineIndex;
  const hiddenLines = session.activeView === 'sanskrit'
    ? session.progressState.sanskritHiddenLines
    : session.progressState.translationHiddenLines;
  const currentLine = lines[currentLineIndex];
  const isHidden = hiddenLines.includes(currentLineIndex);
  const sanskritComplete = sanskritLines.length === 0
    || session.progressState.sanskritVisitedLines.length >= sanskritLines.length;
  const translationComplete = translationLines.length === 0
    || session.progressState.translationVisitedLines.length >= translationLines.length;
  const canComplete = sanskritComplete && translationComplete;
  const isLastLine = currentLineIndex >= Math.max(0, lines.length - 1);
  const itemLabel = session.activeView === 'sanskrit' ? 'Строка' : 'Фрагмент';
  const progressCount = lines.length > 0 ? currentLineIndex + 1 : 0;

  return (
    <Card className={styles.card}>
      <div className={styles.heading}>
        <span>Шаг 2</span>
        <h1>Запоминай постепенно</h1>
        <p>Скрывай текущую строку и пробуй произнести её по памяти.</p>
      </div>

      <VerseTextSwitcher activeView={session.activeView} onChange={onChangeView} />

      <div className={styles.modeProgress}>
        <span className={sanskritComplete ? styles.complete : ''}>
          <i aria-hidden="true">{sanskritComplete ? '✓' : ''}</i>
          Санскрит
        </span>
        <span className={translationComplete ? styles.complete : ''}>
          <i aria-hidden="true">{translationComplete ? '✓' : ''}</i>
          Перевод
        </span>
      </div>

      <section className={`${styles.lineCard} ${styles[session.activeView]}`} aria-live="polite">
        <span className={styles.counter}>
          {itemLabel} {progressCount} из {lines.length}
        </span>

        {currentLine ? (
          isHidden ? (
            <div className={styles.hiddenPrompt}>
              <strong>{itemLabel} скрыт{session.activeView === 'translation' ? '' : 'а'}</strong>
              <p>Попробуй произнести {session.activeView === 'sanskrit' ? 'её' : 'его'} по памяти</p>
            </div>
          ) : (
            <p className={styles.lineText}>{currentLine}</p>
          )
        ) : (
          <div className={styles.hiddenPrompt}>
            <strong>Текст пока отсутствует</strong>
            <p>Можно перейти к другому варианту или завершить знакомство.</p>
          </div>
        )}

        {currentLine ? (
          <button
            className={styles.visibilityButton}
            type="button"
            onClick={() => onToggleVisibility(currentLineIndex)}
          >
            {isHidden ? `Показать ${session.activeView === 'sanskrit' ? 'строку' : 'фрагмент'}` : `Скрыть ${session.activeView === 'sanskrit' ? 'строку' : 'фрагмент'}`}
          </button>
        ) : null}
      </section>

      {!canComplete && isLastLine ? (
        <p className={styles.helper}>
          Просмотри все строки санскрита и перевода — после этого можно завершить запоминание.
        </p>
      ) : null}

      <div className={styles.actions}>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={currentLineIndex === 0 || lines.length === 0}
          onClick={() => onChangeLine(currentLineIndex - 1)}
        >
          Назад
        </button>
        {isLastLine ? (
          <button
            className={styles.primaryButton}
            type="button"
            disabled={!canComplete}
            onClick={onFinish}
          >
            Завершить запоминание
          </button>
        ) : (
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => onChangeLine(currentLineIndex + 1)}
          >
            {session.activeView === 'sanskrit' ? 'Следующая строка' : 'Следующий фрагмент'}
          </button>
        )}
      </div>
    </Card>
  );
}
