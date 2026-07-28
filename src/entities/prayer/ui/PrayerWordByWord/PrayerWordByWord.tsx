import type { PrayerVerse } from '../../model/prayer.types';
import styles from './PrayerWordByWord.module.css';

type PrayerWordByWordProps = {
  verse: PrayerVerse;
};

export function PrayerWordByWord({ verse }: PrayerWordByWordProps) {
  const sanskritPhrases = verse.russianPronunciation.split('\n').filter(Boolean);

  if (sanskritPhrases.length === 0) return null;

  return (
    <dl className={styles.words}>
      {sanskritPhrases.map((sanskrit, phraseIndex) => (
        <div className={styles.word} key={`${verse.id}-phrase-${phraseIndex + 1}`}>
          <dt>{sanskrit}</dt>
          <dd>{verse.phraseTranslations[phraseIndex]}</dd>
        </div>
      ))}
    </dl>
  );
}
