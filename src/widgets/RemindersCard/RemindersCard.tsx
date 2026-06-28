import { Card } from '../../shared/ui/Card/Card';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import styles from './RemindersCard.module.css';

type Reminder = {
  title: string;
  time: string;
  icon: IconName;
  enabled: boolean;
};

const reminders: Reminder[] = [
  { title: 'Утренняя джапа', time: '05:30 каждый день', icon: 'mala', enabled: true },
  { title: 'Чтение книги', time: '20:00 вечером', icon: 'book', enabled: true },
  { title: 'Повторить стих', time: 'Суббота, 10:00', icon: 'scroll', enabled: false },
];

export function RemindersCard() {
  return (
    <Card className={styles.panel}>
      <div className={styles.head}>
        <h2>Напоминания</h2>
        <a href="#">Настроить</a>
      </div>

      {reminders.map((reminder) => (
        <div className={styles.reminder} key={reminder.title}>
          <Icon name={reminder.icon} />
          <div>
            <strong>{reminder.title}</strong>
            <span>{reminder.time}</span>
          </div>
          <button className={`${styles.switch} ${reminder.enabled ? styles.enabled : ''}`} type="button" aria-label={`Переключить ${reminder.title}`}>
            <i />
          </button>
        </div>
      ))}
    </Card>
  );
}
