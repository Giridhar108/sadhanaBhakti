import { useEffect, useMemo, useState } from 'react';
import krishna from '../../shared/assets/images/krishna.png';
import lotusSoft from '../../shared/assets/images/lotus-soft.png';
import { dailyVerseChanged, readDailyVerses, type DailyVerse } from '../../shared/lib/dailyVerse';
import styles from './QuoteCard.module.css';

const verseRotationMs = 120000;
const verseFadeMs = 420;

const defaultVerse: DailyVerse = {
  id: 'default-daily-verse',
  image: krishna,
  text: 'Мой дорогой ум, продолжай практику спокойно. Даже маленький ежедневный шаг укрепляет путь самосознания и возвращает внимание к главному.',
  source: 'Напоминание дня',
};

export function QuoteCard() {
  const [customVerses, setCustomVerses] = useState<DailyVerse[]>(() => readDailyVerses());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const verses = useMemo(() => (customVerses.length > 0 ? customVerses : [defaultVerse]), [customVerses]);
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

  return (
    <section className={styles.card}>
      <div className={`${styles.verseContent} ${isVisible ? styles.visible : styles.hidden}`}>
        <img className={styles.krishna} src={verse.image ?? krishna} alt="" />
        <p>{verse.text}</p>
        <cite>{verse.source}</cite>
      </div>
      <img className={styles.lotus} src={lotusSoft} alt="" aria-hidden="true" />
    </section>
  );
}
