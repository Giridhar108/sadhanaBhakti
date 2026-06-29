import ornament from '../../shared/assets/images/ornament.png';
import uttamaLotus from '../../shared/assets/images/uttamaLotus.png';
import styles from './Sidebar.module.css';

export function UttamaBhaktiCard() {
  return (
    <div className={styles.goalNote} aria-label="Уттама-бхакти">
      <div className={styles.goalCard}>
        <div className={styles.goalOrnament} aria-hidden="true">
          <img src={ornament} alt="" />
        </div>
        <p className={styles.goalVerse}>
          анйабхилашита-шунйам
          <br />
          гьяна-кармади-анавритам
          <br />
          анукулйена кришнану
          <br />
          шиланам бхактир уттама
        </p>
        <img className={styles.goalLotus} src={uttamaLotus} alt="" aria-hidden="true" />
        <img className={styles.goalBadgeOrnament} src={ornament} alt="" aria-hidden="true" />
        <span className={styles.goalBadge}>Уттама-бхакти</span>
      </div>
    </div>
  );
}
