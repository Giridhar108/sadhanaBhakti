import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import homeIcon from '../../shared/assets/images/01_home.png';
import japaIcon from '../../shared/assets/images/02_japa.png';
import japaIconMobile from '../../shared/assets/images/japa.png';
import menu from '../../shared/assets/images/menu.png';
import settings from '../../shared/assets/images/settings.png';
import booksIcon from '../../shared/assets/images/03_books.png';
import versesIcon from '../../shared/assets/images/04_verses.png';
import calendarIcon from '../../shared/assets/images/05_calendar.png';
import settingsIcon from '../../shared/assets/images/07_settings.png';
import friendsMaleIcon from '../../shared/assets/images/friendsMale.png';
import lotusLogo from '../../shared/assets/images/sadhanaBhakti.png';
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
  { label: 'Друзья', image: friendsMaleIcon, href: '/profile' },
  { label: 'Настройки', image: settingsIcon, href: '/settings' },
];

export function Sidebar({ isStatic = false }: SidebarProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <aside className={`${styles.sidebar} ${isStatic ? styles.static : ''}`}>
      <Link className={styles.brand} to="/" aria-label="Перейти на главную">
        <img src={lotusLogo} alt="Лотос" />
        {/* <span>Садхана Бхакти</span> */}
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

      {!isStatic ? (
        <div className={styles.mobileNavigation}>
          <nav className={styles.mobileDock} aria-label="Быстрая навигация">
            <button
              className={styles.mobileDockItem}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={isMenuOpen}
            >
                <img src={menu} alt="" />
              <span>Меню</span>
            </button>
            <Link className={`${styles.mobileDockItem} ${styles.mobileJapa}`} to="/japa" onClick={closeMenu}>
              <span className={styles.japaOrb}><img src={japaIconMobile} alt="" /></span>
              <span>Джапа</span>
            </Link>
            <Link className={styles.mobileDockItem} to="/settings" onClick={closeMenu}>
              <img src={settings} alt="" />
              <span>Настройки</span>
            </Link>
          </nav>

          {isMenuOpen ? (
            <div className={styles.menuLayer} role="presentation">
              <button className={styles.menuBackdrop} type="button" onClick={closeMenu} aria-label="Закрыть меню" />
              <section className={styles.menuSheet} role="dialog" aria-modal="true" aria-label="Меню разделов">
                <div className={styles.sheetHandle} />
                <header className={styles.menuSheetHeader}>
                  <h2>Меню</h2>
                  <button type="button" onClick={closeMenu} aria-label="Закрыть меню">×</button>
                </header>
                <nav className={styles.menuGrid} aria-label="Разделы приложения">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      className={`${styles.menuTile} ${location.pathname === item.href ? styles.menuTileActive : ''}`}
                      to={item.href}
                      onClick={closeMenu}
                    >
                      {item.image ? <img src={item.image} alt="" /> : <Icon name={item.icon ?? 'home'} />}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </section>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
