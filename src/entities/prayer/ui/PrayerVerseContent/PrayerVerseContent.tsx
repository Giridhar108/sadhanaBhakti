import type { PrayerVerse } from '../../model/prayer.types';
import styles from './PrayerVerseContent.module.css';

type PrayerVerseContentProps = {
  verse: PrayerVerse;
};

export function PrayerVerseContent({ verse }: PrayerVerseContentProps) {
  return (
    <section className={styles.content}>
      <section className={styles.pronunciationBlock}>
        <span>Произношение</span>
        <p className={styles.pronunciation}>{verse.russianPronunciation}</p>
      </section>

      <section className={styles.translationBlock}>
        <span>Литературный перевод</span>
        <p>{verse.translation}</p>
      </section>
    </section>
  );
}
