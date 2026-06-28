import profile from '../../shared/assets/images/profile.png';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.topbar}>
      <div>
        <h1>Сегодняшняя практика</h1>
        <p>Продолжай спокойно — каждый день уже часть пути.</p>
      </div>

      <div className={styles.actions}>
        <label className={styles.search}>
          <Icon name="search" />
          <input placeholder="Поиск практики" />
        </label>

        <button className={styles.iconBtn} type="button" aria-label="Уведомления">
          <Icon name="bell" />
          <span className={styles.dot} />
        </button>

        <button className={styles.profile} type="button">
          <img src={profile} alt="Ананда дас" />
          <span>Ананда дас</span>
          <Icon name="chevron" />
        </button>
      </div>
    </header>
  );
}
