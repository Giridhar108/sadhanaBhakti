import krishna from '../../shared/assets/images/krishna.png';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './QuoteCard.module.css';

export function QuoteCard() {
  return (
    <section className={styles.card}>
      <img className={styles.krishna} src={krishna} alt="Кришна" />
      <p>Мой дорогой ум, продолжай практику спокойно. Даже маленький ежедневный шаг укрепляет путь самосознания и возвращает внимание к главному.</p>
      <cite>Напоминание дня</cite>
      <Icon className={styles.lotus} name="lotus" />
    </section>
  );
}
