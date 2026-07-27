import styles from './VerseLines.module.css';

type VerseLinesProps = {
  title: string;
  lines: string[];
  fallback?: string;
  variant: 'sanskrit' | 'translation';
};

export function VerseLines({ title, lines, fallback, variant }: VerseLinesProps) {
  const visibleLines = lines.length > 0 ? lines : fallback ? [fallback] : [];

  return (
    <section className={`${styles.block} ${styles[variant]}`}>
      <header>
        <span aria-hidden="true">{variant === 'sanskrit' ? 'ॐ' : '❀'}</span>
        <h2>{title}</h2>
      </header>
      {visibleLines.length > 0 ? (
        <div className={styles.lines}>
          {visibleLines.map((line, index) => (
            <p key={`${index}-${line}`}>{line}</p>
          ))}
        </div>
      ) : (
        <p className={styles.missing}>Текст пока не добавлен.</p>
      )}
    </section>
  );
}
