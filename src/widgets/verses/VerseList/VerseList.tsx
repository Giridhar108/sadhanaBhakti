import type { Verse } from '../../../entities/verse';
import { VerseCard } from '../VerseCard/VerseCard';
import styles from './VerseList.module.css';

type VerseListProps = {
  verses: Verse[];
  onToggleFavorite: (verseId: string) => void;
  emptyTitle?: string;
  emptyText?: string;
};

export function VerseList({
  verses,
  onToggleFavorite,
  emptyTitle = 'Стихов пока нет',
  emptyText = 'Добавь свой первый стих, чтобы начать спокойное изучение.',
}: VerseListProps) {
  if (verses.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden="true">❀</span>
        <strong>{emptyTitle}</strong>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {verses.map((verse) => (
        <VerseCard
          key={verse.id}
          verse={verse}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
