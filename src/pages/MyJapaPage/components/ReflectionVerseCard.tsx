import smallCow from '../../../shared/assets/images/smallCow.png';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './ReflectionVerseCard.module.css';

type ReflectionVerseCardProps = {
  className?: string;
};

export function ReflectionVerseCard({ className }: ReflectionVerseCardProps = {}) {
  return (
    <article className={`${styles.card} ${styles.verseCard}${className ? ` ${className}` : ''}`}>
      <div className={styles.cardHeader}>
        <h2>Стих дня размышления</h2>
        <Icon className={styles.headerIcon} name="book" />
      </div>
      <div className={styles.verseBody}>
        <span className={styles.quoteMark}>“</span>
        <p>
          Всегда думай обо Мне, стань Моим преданным, поклоняйся Мне и поклоняйся Мне. Таким образом ты непременно
          придёшь ко Мне. Я обещаю тебе это, ибо ты Мне очень дорог.
        </p>
        <img src={smallCow} alt="" />
      </div>
      <strong className={styles.verseSource}>— Бхагавад-гита 18.65</strong>
    </article>
  );
}
