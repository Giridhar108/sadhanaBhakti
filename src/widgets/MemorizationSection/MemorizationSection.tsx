import { useMemo, useState } from 'react';
import { Card } from '../../shared/ui/Card/Card';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import styles from './MemorizationSection.module.css';

type Verse = {
  ref: string;
  text: string;
  description: string;
  progress: number;
  icon: IconName;
};

const verses: Verse[] = [
  {
    ref: 'Бхагавад-гита 2.47',
    text: 'karmaṇy evādhikāras te\nmā phaleṣu kadācana\nmā karma-phala-hetur bhūr\nmā te saṅgo stv akarmaṇi',
    description: 'Тебе дано право лишь на выполнение своих обязанностей, но не на плоды их.',
    progress: 60,
    icon: 'mala',
  },
  {
    ref: 'Шримад-Бхагаватам 1.2.6',
    text: 'sa vai puṁsāṁ paro dharmo\nyato bhaktir adhokṣaje\nahaituky apratihatā yayā\nātmā suprasīdati',
    description: 'Высшая обязанность человека - развивать чистую преданность Верховному Господу.',
    progress: 40,
    icon: 'scroll',
  },
  {
    ref: 'Шримад-Бхагаватам 11.29.34',
    text: 'mat-karma-kṛn mat-paramo\nmad-bhaktaḥ saṅga-varjitaḥ\nnirvairaḥ sarva-bhūteṣu\nyaḥ sa mām eti pāṇḍava',
    description: 'Держи ум в практике, избегая лишнего, и постепенно укрепляй преданность.',
    progress: 75,
    icon: 'target',
  },
  {
    ref: 'Бхагавад-гита 4.9',
    text: 'janma karma ca me divyam\nevaṁ yo vetti tattvataḥ\ntyaktvā dehaṁ punar janma\nnaiti mām eti so rjuna',
    description: 'Понимание божественной природы Господа освобождает от повторного рождения.',
    progress: 35,
    icon: 'lotus',
  },
  {
    ref: 'Бхагавад-гита 9.22',
    text: 'ananyāś cintayanto māṁ\nye janāḥ paryupāsate\nteṣāṁ nityābhiyuktānāṁ\nyoga-kṣemaṁ vahāmy aham',
    description: 'Господь Сам заботится о тех, кто с постоянством и любовью помнит о Нем.',
    progress: 55,
    icon: 'home',
  },
  {
    ref: 'Шримад-Бхагаватам 1.2.17',
    text: 'śṛṇvatāṁ sva-kathāḥ kṛṣṇaḥ\npuṇya-śravaṇa-kīrtanaḥ\nhṛdy antaḥ-stho hy abhadrāṇi\nvidhunoti suhṛt satām',
    description: 'Слушание о Кришне очищает сердце и мягко возвращает внимание к духовной жизни.',
    progress: 20,
    icon: 'book',
  },
];

const cardsPerSlide = 3;

export function MemorizationSection() {
  const slidesCount = Math.ceil(verses.length / cardsPerSlide);
  const [activeSlide, setActiveSlide] = useState(0);
  const visibleVerses = useMemo(
    () => verses.slice(activeSlide * cardsPerSlide, activeSlide * cardsPerSlide + cardsPerSlide),
    [activeSlide],
  );

  const showPrevSlide = () => {
    setActiveSlide((slide) => (slide === 0 ? slidesCount - 1 : slide - 1));
  };

  const showNextSlide = () => {
    setActiveSlide((slide) => (slide + 1) % slidesCount);
  };

  return (
    <Card className={styles.panel}>
      <div className={styles.head}>
        <h2>Стихи для запоминания</h2>
        <a href="/verses">Смотреть все</a>
      </div>

      <button className={`${styles.sliderBtn} ${styles.prev}`} type="button" aria-label="Предыдущие стихи" onClick={showPrevSlide}>
        <Icon name="chevron" />
      </button>

      <div className={styles.grid} aria-live="polite">
        {visibleVerses.map((verse) => (
          <article className={styles.verseCard} key={verse.ref}>
            <div className={styles.verseTop}>
              <div className={styles.verseIcon}>
                <Icon name={verse.icon} />
              </div>
              <div>
                <p className={styles.verseRef}>{verse.ref}</p>
                <p className={styles.verseText}>{verse.text}</p>
              </div>
            </div>
            <p className={styles.desc}>{verse.description}</p>
            <div className={styles.progressLine}>
              <span>Прогресс запоминания</span>
              <b>{verse.progress}%</b>
            </div>
            <div className={styles.bar}>
              <i style={{ width: `${verse.progress}%` }} />
            </div>
          </article>
        ))}
      </div>

      <div className={styles.dots} aria-label="Слайды стихов">
        {Array.from({ length: slidesCount }, (_, index) => (
          <button
            aria-label={`Показать слайд ${index + 1}`}
            aria-current={activeSlide === index}
            className={activeSlide === index ? styles.activeDot : ''}
            key={index}
            onClick={() => setActiveSlide(index)}
            type="button"
          />
        ))}
      </div>

      <button className={`${styles.sliderBtn} ${styles.next}`} type="button" aria-label="Следующие стихи" onClick={showNextSlide}>
        <Icon name="chevron" />
      </button>
    </Card>
  );
}
