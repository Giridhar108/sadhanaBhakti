import { Link } from 'react-router-dom';
import type { Verse } from '../../model/types';
import styles from './VerseReference.module.css';

type VerseReferenceProps = {
  verse: Pick<Verse, 'id' | 'sourceTitle' | 'reference'>;
  linked?: boolean;
};

export function VerseReference({ verse, linked = false }: VerseReferenceProps) {
  const content = (
    <>
      <span>{verse.sourceTitle}</span>
      <strong>{verse.reference}</strong>
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
