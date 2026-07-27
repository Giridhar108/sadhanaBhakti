import type { VerseStatus as VerseStatusValue } from '../../model/types';
import styles from './VerseStatus.module.css';

const statusLabels: Record<VerseStatusValue, string> = {
  new: 'Новый',
  learning: 'Изучается',
  review: 'На повторении',
  learned: 'Выучен',
  needsReview: 'Нужно повторить',
};

type VerseStatusProps = {
  status: VerseStatusValue;
};

export function VerseStatus({ status }: VerseStatusProps) {
  return (
    <span className={`${styles.status} ${styles[status]}`}>
      <i aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
