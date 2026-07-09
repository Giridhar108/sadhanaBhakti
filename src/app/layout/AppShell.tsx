import { Outlet } from 'react-router-dom';
import { Header } from '../../widgets/Header/Header';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.page}>
        <Header />
        <Outlet />
      </main>
    </div>
  );
}
