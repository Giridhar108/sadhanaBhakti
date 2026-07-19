import { useCallback, useEffect, useMemo, useState } from 'react';
import { readAuthUser } from '../../entities/user/model/auth';
import shrilaPrabhupada from '../../shared/assets/images/ShrilaPrabhupada.png';
import { endpoints } from '../../shared/api/endpoints';
import { httpClient } from '../../shared/api/httpClient';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './ProfilePage.module.css';

type FriendSummary = {
  id: string;
  name: string;
  spiritualName: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | null;
  todayRounds: number;
  dailyGoalRounds: number;
  totalRounds: number;
  goalDate: string | null;
};

const numberFormatter = new Intl.NumberFormat('ru-RU');
const goalDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDisplayName(friend: FriendSummary) {
  return friend.spiritualName.trim() || friend.name.trim() || 'Практикующий';
}

function getInitials(friend: FriendSummary) {
  return getDisplayName(friend)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getDailyPercent(friend: FriendSummary) {
  return Math.min(100, Math.round((friend.todayRounds / Math.max(1, friend.dailyGoalRounds)) * 100));
}

function formatGoalDate(dateKey: string | null) {
  if (!dateKey) {
    return 'Укажите дату старта';
  }

  return goalDateFormatter.format(new Date(`${dateKey}T12:00:00`));
}

function FriendAvatar({ friend }: { friend: FriendSummary }) {
  return (
    <div className={`${styles.avatar} ${friend.gender ? styles[friend.gender] : ''}`}>
      {friend.avatarUrl ? <img src={friend.avatarUrl} alt="" /> : <span>{getInitials(friend)}</span>}
    </div>
  );
}

function Identity({ friend, currentUserId }: { friend: FriendSummary; currentUserId?: string }) {
  const subtitle = friend.spiritualName.trim() ? friend.name : 'Участник сообщества';

  return (
    <div className={styles.identity}>
      <strong>
        {getDisplayName(friend)}
        {friend.id === currentUserId ? <span className={styles.youBadge}>Вы</span> : null}
      </strong>
      <small>{subtitle}</small>
    </div>
  );
}

export default function ProfilePage() {
  useDocumentTitle('Друзья — Садхана Бхакти');

  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserId = readAuthUser()?.id;

  const loadFriends = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await httpClient.get<FriendSummary[]>(`${endpoints.users.community}?date=${getTodayDateKey()}`);
      setFriends(data);
    } catch {
      setError('Не удалось загрузить участников. Попробуйте ещё раз.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const visibleFriends = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');

    if (!normalizedSearch) {
      return friends;
    }

    return friends.filter((friend) => (
      `${friend.spiritualName} ${friend.name}`.toLocaleLowerCase('ru-RU').includes(normalizedSearch)
    ));
  }, [friends, search]);
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroPortrait}>
          <img src={shrilaPrabhupada} alt="Шрила Прабхупада" />
        </div>
        <blockquote className={styles.heroQuote}>
          <p>Занимаясь преданным служением в соответствии с предписанными правилами под руководством духовного учителя, человек обязательно пробудит дремлющую в его сердце любовь к Богу. Этот путь называется абхидхеей</p>
          <footer>Шри Чайтанья-чаритамрита А̄дӣ-лӣла̄ 7.142</footer>
        </blockquote>
      </section>

      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <Icon name="search" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Найти по имени"
            aria-label="Найти пользователя"
          />
        </label>
        <p><span /> Данные за сегодня обновляются для всех участников</p>
      </div>

      {isLoading ? (
        <div className={styles.stateCard}><span className={styles.loader} /><strong>Собираем круг друзей…</strong></div>
      ) : error ? (
        <div className={styles.stateCard}>
          <strong>{error}</strong>
          <button type="button" onClick={() => void loadFriends()}>Повторить</button>
        </div>
      ) : visibleFriends.length === 0 ? (
        <div className={styles.stateCard}>
          <Icon name="users" />
          <strong>{friends.length === 0 ? 'Пока здесь нет участников' : 'Никого не нашли'}</strong>
          <span>{friends.length === 0 ? 'Первый практикующий скоро появится.' : 'Попробуйте изменить запрос.'}</span>
        </div>
      ) : (
        <section className={styles.tablePanel}>
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th>Практикующий</th>
                  <th>Сегодня</th>
                  <th>Цель дня</th>
                  <th>Всего кругов</th>
                  <th>35 млн мантр</th>
                </tr>
              </thead>
              <tbody>
                {visibleFriends.map((friend) => (
                  <tr key={friend.id}>
                    <td data-label="Практикующий">
                      <div className={styles.tableIdentity}>
                        <FriendAvatar friend={friend} />
                        <Identity friend={friend} currentUserId={currentUserId} />
                      </div>
                    </td>
                    <td data-label="Сегодня">
                      <strong className={styles.todayValue}>{friend.todayRounds} из {friend.dailyGoalRounds}</strong>
                      <div className={styles.progressTrack} aria-hidden="true">
                        <span style={{ width: `${getDailyPercent(friend)}%` }} />
                      </div>
                    </td>
                    <td data-label="Цель дня">{friend.dailyGoalRounds} кругов</td>
                    <td data-label="Всего кругов">{numberFormatter.format(friend.totalRounds)}</td>
                    <td data-label="35 млн мантр"><strong>{formatGoalDate(friend.goalDate)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className={styles.calculationNote}>
        Дата цели рассчитывается по текущему общему числу кругов и личной дневной цели: один круг — 108 повторений.
      </p>
    </div>
  );
}
