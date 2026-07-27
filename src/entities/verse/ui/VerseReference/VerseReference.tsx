import { Link } from 'react-router-dom';
import type { Verse } from '../../model/types';
import styles from './VerseReference.module.css';

type VerseReferenceProps = {
  verse: Pick<Verse, 'id' | 'bookTitle' | 'chapter' | 'verseNumber'>;
  linked?: boolean;
};

export function VerseReference({ verse, linked = false }: VerseReferenceProps) {
  const content = (
    <>
      <span>{verse.bookTitle}</span>
      <strong>{verse.chapter ? `${verse.chapter}.` : ''}{verse.verseNumber}</strong>
    </>
  );

  return linked ? (
    <Link className={styles.reference} to={`/verses/${verse.id}`}>
      {content}
    </Link>
  ) : (
    <div className={styles.reference}>{content}</div>
  );
}
