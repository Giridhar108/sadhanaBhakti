import { Link } from 'react-router-dom';
import profile from '../../shared/assets/images/profile.png';
import { getUserDisplayName, readAuthUser } from '../../entities/user/model/auth';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './Header.module.css';

export function Header() {
  const authUser = readAuthUser();
  const displayName = getUserDisplayName(authUser);

  return (
    <header className={styles.topbar}>
      <div>
        <h1>Харе Кришна, {displayName}</h1>
        <p>Продолжай спокойно — каждый день уже часть пути.</p>
      </div>

      <div className={styles.actions}>
        <Link className={styles.settingsBtn} to="/settings" aria-label="Настройки">
          <Icon name="settings" />
        </Link>

        <button className={styles.iconBtn} type="button" aria-label="Уведомления">
          <Icon name="bell" />
          <span className={styles.dot} />
        </button>

        <button className={styles.profile} type="button">
          <img src={profile} alt={displayName} />
          <span>{displayName}</span>
          <Icon name="chevron" />
        </button>
      </div>
    </header>
  );
}
