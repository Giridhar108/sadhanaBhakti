import type { VerseLearningView } from '../../../entities/verse';
import styles from './VerseTextSwitcher.module.css';

type VerseTextSwitcherProps = {
  activeView: VerseLearningView;
  onChange: (view: VerseLearningView) => void;
};

export function VerseTextSwitcher({ activeView, onChange }: VerseTextSwitcherProps) {
  return (
    <div className={styles.switcher} role="group" aria-label="Вариант текста для запоминания">
      <button
        className={activeView === 'sanskrit' ? styles.active : ''}
        type="button"
        aria-pressed={activeView === 'sanskrit'}
        onClick={() => onChange('sanskrit')}
      >
        Санскрит
      </button>
      <button
        className={activeView === 'translation' ? styles.active : ''}
        type="button"
        aria-pressed={activeView === 'translation'}
        onClick={() => onChange('translation')}
      >
        Перевод
      </button>
    </div>
  );
}
