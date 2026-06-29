import lotusSoft from '../../shared/assets/images/lotus-soft.png';
import styles from './GoalReminderCard.module.css';

export function GoalReminderCard() {
  return (
    <div className={styles.card} aria-label="Помни о цели">
      <h3>Помни о цели</h3>
      <p>
        Каждый шаг приближает
        <br />
        тебя к любви к Богу.
      </p>
      <img src={lotusSoft} alt="" aria-hidden="true" />
    </div>
  );
}
