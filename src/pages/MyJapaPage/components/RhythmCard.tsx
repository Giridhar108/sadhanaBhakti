import { Icon, type IconName } from '../../../shared/ui/Icon/Icon';
import styles from './RhythmCard.module.css';

type RhythmStat = {
  icon: 'flame' | IconName;
  value: string;
  unit: string;
  label: string;
};

const rhythmStats: RhythmStat[] = [
  { icon: 'flame', value: '21', unit: 'день', label: 'Серия' },
  { icon: 'mala', value: '128', unit: 'кругов', label: 'Кругов всего' },
  { icon: 'clock', value: '1:42', unit: 'мин', label: 'Среднее время' },
];

export function RhythmCard() {
  return (
    <article className={`${styles.card} ${styles.rhythmCard}`}>
      <h2>Мой ритм</h2>
      <div className={styles.rhythmGrid}>
        {rhythmStats.map((stat) => (
          <div className={styles.rhythmItem} key={stat.label}>
            <div className={`${styles.rhythmIcon} ${styles[stat.icon]}`}>
              {stat.icon === 'flame' ? <span /> : <Icon name={stat.icon} />}
            </div>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.unit}</span>
              <small>{stat.label}</small>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
