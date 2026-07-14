import verseImg from '../../shared/assets/images/verseImg2.png';
import styles from './VerseImageBlock.module.css';

export function VerseImageBlock() {
  return (
    <section className={styles.block} aria-label="Иллюстрация к изучению стихов">
      <img className={styles.image} src={verseImg} alt="Иллюстрация к изучению стихов" />
    </section>
  );
}
