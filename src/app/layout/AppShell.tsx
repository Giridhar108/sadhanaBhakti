import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './AppShell.module.css';

export function AppShell() {
  const location = useLocation();

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.page}>
        <Header />
        <div className={styles.pageTransition} key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
