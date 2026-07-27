import { Link } from 'react-router-dom';
import { type Verse, VerseReference, VerseStatusBadge } from '../../../entities/verse';
import styles from './VerseCatalog.module.css';

type VerseCatalogProps = {
  verses: Verse[];
  userVerseIds: string[];
  onAddVerse: (verseId: string) => void;
};

export function VerseCatalog({ verses, userVerseIds, onAddVerse }: VerseCatalogProps) {
  const sourceGroups = verses.reduce<Record<string, Verse[]>>((groups, verse) => {
    const group = groups[verse.sourceTitle] ?? [];

    return {
      ...groups,
      [verse.sourceTitle]: [...group, verse],
    };
  }, {});

  return (
    <div className={styles.groups}>
      {Object.entries(sourceGroups).map(([sourceTitle, sourceVerses]) => (
        <section className={styles.group} key={sourceTitle}>
          <header>
            <div>
              <span>Источник</span>
              <h2>{sourceTitle}</h2>
            </div>
            <small>{sourceVerses.length} доступно</small>
          </header>

          <div className={styles.list}>
            {sourceVerses.map((verse) => {
              const isAdded = userVerseIds.includes(verse.id);

              return (
                <article className={styles.item} key={verse.id}>
                  <div className={styles.itemCopy}>
                    <VerseReference verse={verse} />
                    <p className={styles.sanskrit}>{verse.sanskritCyrillicLines[0] || 'Текст готовится'}</p>
                    <p className={styles.translation}>{verse.fullTranslation}</p>
                  </div>
                  <div className={styles.itemActions}>
                    {isAdded ? <VerseStatusBadge status={verse.status} /> : null}
                    {isAdded ? (
                      <Link className={styles.secondaryButton} to={`/verses/${verse.id}`}>
                        Открыть стих
                      </Link>
                    ) : (
                      <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={() => onAddVerse(verse.id)}
                      >
                        Учить этот стих
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
