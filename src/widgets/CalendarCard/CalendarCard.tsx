import streakLeft from '../../shared/assets/images/streak-left.png';
import streakRight from '../../shared/assets/images/streak-right.png';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './CalendarCard.module.css';

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const dates = [
  { value: '28', muted: true }, { value: '29', muted: true }, { value: '30', muted: true }, { value: '1' }, { value: '2', soft: true }, { value: '3' }, { value: '4' },
  { value: '5', soft: true }, { value: '6', soft: true }, { value: '7' }, { value: '8' }, { value: '9', soft: true }, { value: '10' }, { value: '11' },
  { value: '12', soft: true }, { value: '13', soft: true }, { value: '14', soft: true }, { value: '15' }, { value: '16', soft: true }, { value: '17' }, { value: '18' },
  { value: '19', active: true }, { value: '20' }, { value: '21' }, { value: '22' }, { value: '23' }, { value: '24' }, { value: '25' },
];

export function CalendarCard() {
  return (
    <Card className={styles.panel}>
      <div className={styles.title}>
        <button className={styles.roundBtn} type="button" aria-label="Предыдущий месяц"><Icon name="chevron" /></button>
        <div>
          <h2>Календарь</h2>
          <div className={styles.month}>Май 2026</div>
        </div>
        <button className={styles.roundBtn} type="button" aria-label="Следующий месяц"><Icon name="chevron" /></button>
      </div>

      <div className={styles.grid}>
        {weekdays.map((day) => <div className={styles.dayName} key={day}>{day}</div>)}
        {dates.map((date, index) => (
          <div key={`${date.value}-${index}`} className={`${styles.date} ${date.muted ? styles.muted : ''} ${date.soft ? styles.soft : ''} ${date.active ? styles.active : ''}`}>{date.value}</div>
        ))}
      </div>

      <div className={styles.streak}>
        <img className={styles.left} src={streakLeft} alt="" aria-hidden="true" />
        <strong>25 дней подряд</strong>
        <span>Ты держишь мягкий ритм практики</span>
        <img className={styles.right} src={streakRight} alt="" aria-hidden="true" />
      </div>
    </Card>
  );
}
