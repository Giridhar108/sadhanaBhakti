import { useEffect, useMemo, useState } from 'react';
import lotusSoft from '../../shared/assets/images/smallCow1.png';
import { dailyVerseChanged, defaultDailyVerse, readDailyVerses, type DailyVerse } from '../../shared/lib/dailyVerse';
import styles from './QuoteCard.module.css';

const verseRotationMs = 120000;
const verseFadeMs = 420;

export function QuoteCard() {
  const [customVerses, setCustomVerses] = useState<DailyVerse[]>(() => readDailyVerses());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const verses = useMemo(() => customVerses, [customVerses]);
  const verse = verses[activeIndex] ?? verses[0];

  useEffect(() => {
    const syncVerse = () => {
      setCustomVerses(readDailyVerses());
      setActiveIndex(0);
      setIsVisible(true);
    };

    window.addEventListener('storage', syncVerse);
    window.addEventListener(dailyVerseChanged, syncVerse);

    return () => {
      window.removeEventListener('storage', syncVerse);
      window.removeEventListener(dailyVerseChanged, syncVerse);
    };
  }, []);

  useEffect(() => {
    if (verses.length < 2) {
      return undefined;
    }

    let timeoutId: number | undefined;
    const intervalId = window.setInterval(() => {
      setIsVisible(false);

      timeoutId = window.setTimeout(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % verses.length);
        setIsVisible(true);
      }, verseFadeMs);
    }, verseRotationMs);

    return () => {
      window.clearInterval(intervalId);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [verses.length]);

  if (!verse) {
    return null;
  }

  return (
    <section className={styles.card}>
      <div className={`${styles.verseContent} ${isVisible ? styles.visible : styles.hidden}`}>
        <img className={styles.krishna} src={verse.image ?? defaultDailyVerse.image} alt="" />
        <p>
          {verse.text.split(/<br\s*\/?>/gi).map((line, index) => (
            <span key={`${index}-${line}`}>
              {index > 0 && <br />}
              {line.replace(/&nbsp;[ \t]*/gi, '\u00a0')}
            </span>
          ))}
        </p>
        <cite>{verse.source}</cite>
      </div>
      <img className={styles.lotus} src={lotusSoft} alt="" aria-hidden="true" />
    </section>
  );
}
