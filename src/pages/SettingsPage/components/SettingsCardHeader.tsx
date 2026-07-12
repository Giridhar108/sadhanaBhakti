import { Icon, type IconName } from '../../../shared/ui/Icon/Icon';
import styles from './SettingsCardHeader.module.css';

type SettingsCardHeaderProps = {
  icon: IconName;
  title: string;
  description: string;
  tone: 'green' | 'violet' | 'gold';
};

export function SettingsCardHeader({ icon, title, description, tone }: SettingsCardHeaderProps) {
  return (
    <header className={styles.cardHeader}>
      <span className={`${styles.cardIcon} ${styles[tone]}`}>
        <Icon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}
