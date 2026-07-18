import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '../../shared/assets/images/ShrilaPrabhupadaIcon.png';
import focusIcon from '../../shared/assets/images/focus.png';
import {
  getUserDisplayName,
  readAuthUser,
  subscribeToAuthUserChange,
} from '../../entities/user/model/auth';
import styles from './Header.module.css';

export function Header() {
  const [authUser, setAuthUser] = useState(() => readAuthUser());
  const displayName = getUserDisplayName(authUser);

  useEffect(() => subscribeToAuthUserChange(() => setAuthUser(readAuthUser())), []);

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

        <button className={styles.profile} type="button">
          <img src={authUser?.avatarUrl || defaultAvatar} alt={displayName} />
        </button>
      </div>
    </header>
  );
}
