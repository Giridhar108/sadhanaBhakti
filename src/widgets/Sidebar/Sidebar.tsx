import { Link, useLocation } from 'react-router-dom';
import lotusLogo from '../../shared/assets/images/lotus-logo.png';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import styles from './Sidebar.module.css';
import { GoalReminderCard } from './GoalReminderCard';

type SidebarProps = {
  isStatic?: boolean;
};

type NavItem = {
  label: string;
  icon: IconName;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Главная', icon: 'home', href: '/' },
  { label: 'Джапа', icon: 'mala', href: '/japa' },
  { label: 'Книги', icon: 'book', href: '/books' },
  { label: 'Стихи', icon: 'scroll', href: '/verses' },
  { label: 'Календарь', icon: 'calendar', href: '/calendar' },
  { label: 'Прогресс', icon: 'chart', href: '/statistics' },
  { label: 'Друзья', icon: 'users', href: '/profile' },
  { label: 'Настройки', icon: 'settings', href: '/settings' },
];

export function Sidebar({ isStatic = false }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={`${styles.sidebar} ${isStatic ? styles.static : ''}`}>
      <div className={styles.brand}>
        <img src={lotusLogo} alt="Лотос" />
        <span>Садхана Бхакти</span>
      </div>

      <nav className={styles.nav} aria-label="Основная навигация">
        {navItems.map((item) => (
          <Link key={item.label} className={`${styles.navItem} ${location.pathname === item.href ? styles.active : ''}`} to={item.href}>
            <Icon name={item.icon} />
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
