import { formatVerseReference } from '../../model/formatVerseReference';
import type { VerseEditorValues } from '../../../../entities/verse';
import styles from './VerseLivePreview.module.css';

type VerseLivePreviewProps = {
  values: VerseEditorValues;
};

export function VerseLivePreview({ values }: VerseLivePreviewProps) {
  return (
    <aside className={styles.preview} aria-label="Предварительный просмотр стиха">
      <span className={styles.eyebrow}>Предварительный просмотр</span>
      <h2>{formatVerseReference(values)}</h2>
      <section className={styles.sanskrit}>
        <h3>Санскрит</h3>
        <p className={values.sanskritCyrillic ? '' : styles.placeholder}>
          {values.sanskritCyrillic || 'Здесь появится текст стиха'}
        </p>
      </section>
      <div className={styles.divider} aria-hidden="true"><span /><i>❧</i><span /></div>
      <section className={styles.translation}>
        <h3>Перевод</h3>
        <p className={values.translation ? '' : styles.placeholder}>
          {values.translation || 'Здесь появится перевод'}
        </p>
      </section>
    </aside>
  );
}
