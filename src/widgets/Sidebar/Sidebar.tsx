import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import homeIcon from '../../shared/assets/images/01_home.png';
import japaIcon from '../../shared/assets/images/02_japa.png';
import booksIcon from '../../shared/assets/images/03_books.png';
import versesIcon from '../../shared/assets/images/04_verses.png';
import calendarIcon from '../../shared/assets/images/05_calendar.png';
import settingsIcon from '../../shared/assets/images/07_settings.png';
import friendsMaleIcon from '../../shared/assets/images/friendsMale.png';
import japaIconMobile from '../../shared/assets/images/japa.png';
import menu from '../../shared/assets/images/menu.png';
import settings from '../../shared/assets/images/settings.png';
import lotusLogo from '../../shared/assets/images/sadhanaBhakti.png';
import menuHeader from '../../shared/assets/images/sadhana_bhakti_header_argb.png';
import menuOrnamentLeft from '../../shared/assets/images/ornament2.png';
import menuOrnamentRight from '../../shared/assets/images/ornament2.png';
import { Icon, type IconName } from '../../shared/ui/Icon/Icon';
import { GoalReminderCard } from './GoalReminderCard';
import styles from './Sidebar.module.css';

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
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const openMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setIsMenuClosing(false);
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    if (!isMenuOpen || isMenuClosing) {
      return;
    }

    setIsMenuClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
      closeTimerRef.current = null;
    }, 240);
  };
  const featuredMenuItems = navItems.slice(0, 2);
  const compactMenuItems = navItems.slice(2);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const { overflow, position, top, width } = document.body.style;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
  }, []);

  return (
    <aside className={`${styles.sidebar} ${isStatic ? styles.static : ''}`}>
      <Link className={styles.brand} to="/" aria-label="Перейти на главную">
        <img src={lotusLogo} alt="Лотос" />
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
              onClick={openMenu}
              aria-label="Открыть меню"
              aria-expanded={isMenuOpen}
            >
              <img src={menu} alt="" />
              <span>Меню</span>
            </button>
            <Link className={`${styles.mobileDockItem} ${styles.mobileJapa}`} to="/japa" onClick={closeMenu}>
              <span className={styles.japaOrb}>
                <img src={japaIconMobile} alt="" />
              </span>
              <span>Джапа</span>
            </Link>
            <Link className={styles.mobileDockItem} to="/settings" onClick={closeMenu}>
              <img src={settings} alt="" />
              <span>Настройки</span>
            </Link>
          </nav>

          {isMenuOpen ? (
            <div className={`${styles.menuLayer} ${isMenuClosing ? styles.menuLayerClosing : ''}`} role="presentation">
              <button className={styles.menuBackdrop} type="button" onClick={closeMenu} aria-label="Закрыть меню" />
              <section className={styles.menuSheet} role="dialog" aria-modal="true" aria-label="Меню разделов">
                <header className={styles.menuHero}>
                  <img className={styles.menuHeroImage} src={menuHeader} alt="" aria-hidden="true" />
                  <button className={styles.menuCloseButton} type="button" onClick={closeMenu} aria-label="Закрыть меню">
                    ×
                  </button>
                </header>

                <nav className={styles.menuFeaturedGrid} aria-label="Главные разделы">
                  {featuredMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      className={`${styles.menuFeatureTile} ${location.pathname === item.href ? styles.menuTileActive : ''}`}
                      to={item.href}
                      onClick={closeMenu}
                    >
                      {item.image ? <img src={item.image} alt="" /> : <Icon name={item.icon ?? 'home'} />}
                      <span>{item.label}</span>
                      {location.pathname === item.href ? <i aria-hidden="true">✓</i> : null}
                    </Link>
                  ))}
                </nav>

                <nav className={styles.menuGrid} aria-label="Разделы приложения">
                  {compactMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      className={`${styles.menuTile} ${item.href === '/settings' ? styles.menuTileWide : ''} ${location.pathname === item.href ? styles.menuTileActive : ''}`}
                      to={item.href}
                      onClick={closeMenu}
                    >
                      {item.image ? <img src={item.image} alt="" /> : <Icon name={item.icon ?? 'home'} />}
                      <span>{item.label}</span>
                      <Icon name="chevron" />
                    </Link>
                  ))}
                </nav>

                <img className={`${styles.menuOrnament} ${styles.menuOrnamentLeft}`} src={menuOrnamentLeft} alt="" aria-hidden="true" />
                <img className={`${styles.menuOrnament} ${styles.menuOrnamentRight}`} src={menuOrnamentRight} alt="" aria-hidden="true" />
              </section>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
