import lotusSoft from '../../shared/assets/images/lotus-logo1.png';
import styles from './GoalReminderCard.module.css';

export function GoalReminderCard() {
  return (
    <div className={styles.card} aria-label="Помни о цели">
      <h3>Нектар преданности</h3>
      <p>
        анйабхилашита-шунйам
        <br />
        гьяна-кармади-анавритам
        <br />
        анукулйена кришнану
        <br />
        шиланам бхактир уттама
      </p>
      <img src={lotusSoft} alt="" aria-hidden="true" />
    </div>
  );
}
