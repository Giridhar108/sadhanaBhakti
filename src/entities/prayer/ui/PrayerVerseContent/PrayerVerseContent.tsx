import type { PrayerVerse } from '../../model/prayer.types';
import { PrayerWordByWord } from '../PrayerWordByWord/PrayerWordByWord';
import styles from './PrayerVerseContent.module.css';

type PrayerVerseContentProps = {
  verse: PrayerVerse;
};

export function PrayerVerseContent({ verse }: PrayerVerseContentProps) {
  return (
    <section className={styles.content}>
      <section className={styles.pronunciationBlock} aria-label="Санскрит">
        <p className={styles.pronunciation}>{verse.russianPronunciation}</p>
      </section>

      <section className={styles.wordsBlock} aria-label="Пословный перевод">
        <PrayerWordByWord verse={verse} />
      </section>

      <section className={styles.translationBlock} aria-label="Перевод">
        <p>{verse.translation}</p>
      </section>
    </section>
  );
}
