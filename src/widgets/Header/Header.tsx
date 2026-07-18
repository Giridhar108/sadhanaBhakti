import { Link } from 'react-router-dom';
import profile from '../../shared/assets/images/ShrilaPrabhupadaIcon.png';
import notifications from '../../shared/assets/images/08_notifications.png';
import focusIcon from '../../shared/assets/images/focus.png';
import { getUserDisplayName, readAuthUser } from '../../entities/user/model/auth';
import styles from './Header.module.css';

export function Header() {
  const authUser = readAuthUser();
  const displayName = getUserDisplayName(authUser);

  return (
    <header className={styles.topbar}>
      <div>
        <h1>Харе Кришна, {displayName}</h1>
        <p>Вся слава Шриле Прабхупаде</p>
      </div>

      <div className={styles.actions}>
        <Link className={styles.focusMode} to="/japa/focus" aria-label="Перейти в фокус-режим">
          <img src={focusIcon} alt="" />
        </Link>

        <button className={styles.iconBtn} type="button" aria-label="Уведомления">
          <img src={notifications} alt={displayName} />
          <span className={styles.dot} />
        </button>

        <button className={styles.profile} type="button">
          <img src={profile} alt={displayName} />
        </button>
      </div>
    </header>
  );
}
