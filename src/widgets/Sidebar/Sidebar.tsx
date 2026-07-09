import { Link, useLocation } from 'react-router-dom';
import homeIcon from '../../shared/assets/images/01_home.png';
import japaIcon from '../../shared/assets/images/02_japa.png';
import booksIcon from '../../shared/assets/images/03_books.png';
import versesIcon from '../../shared/assets/images/04_verses.png';
import calendarIcon from '../../shared/assets/images/05_calendar.png';
import progressIcon from '../../shared/assets/images/06_progress.png';
import settingsIcon from '../../shared/assets/images/07_settings.png';
import lotusLogo from '../../shared/assets/images/lotus-logo.png';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import styles from './Sidebar.module.css';
import { GoalReminderCard } from './GoalReminderCard';

type SidebarProps = {
  isStatic?: boolean;
};

type NavItem = {
  label: string;
  icon?: IconName;
  image?: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Главная', image: homeIcon, href: '/' },
  { label: 'Джапа', image: japaIcon, href: '/japa' },
  { label: 'Книги', image: booksIcon, href: '/books' },
  { label: 'Стихи', image: versesIcon, href: '/verses' },
  { label: 'Календарь', image: calendarIcon, href: '/calendar' },
  { label: 'Прогресс', image: progressIcon, href: '/statistics' },
  { label: 'Друзья', icon: 'users', href: '/profile' },
  { label: 'Настройки', image: settingsIcon, href: '/settings' },
];

export function Sidebar({ isStatic = false }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={`${styles.sidebar} ${isStatic ? styles.static : ''}`}>
      <Link className={styles.brand} to="/" aria-label="Перейти на главную">
        <img src={lotusLogo} alt="Лотос" />
        <span>Садхана Бхакти</span>
      </Link>

      <nav className={styles.nav} aria-label="Основная навигация">
        {navItems.map((item) => (
          <Link key={item.label} className={`${styles.navItem} ${location.pathname === item.href ? styles.active : ''}`} to={item.href}>
            {item.image ? <img className={styles.navIcon} src={item.image} alt="" /> : <Icon name={item.icon ?? 'home'} />}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.goalNote}>
        <GoalReminderCard />
      </div>
    </aside>
  );
}
