import { CalendarCard } from '../../widgets/CalendarCard/CalendarCard';
import { FriendsCard } from '../../widgets/FriendsCard/FriendsCard';
import { Header } from '../../widgets/Header/Header';
import { MemorizationSection } from '../../widgets/MemorizationSection/MemorizationSection';
import { PracticeCardsGrid } from '../../widgets/PracticeCardsGrid/PracticeCardsGrid';
import { ProgressChartCard } from '../../widgets/ProgressChartCard/ProgressChartCard';
import { QuoteCard } from '../../widgets/QuoteCard/QuoteCard';
import { RemindersCard } from '../../widgets/RemindersCard/RemindersCard';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.dashboard}>
        <Header />
        <div className={styles.contentGrid}>
          <section className={styles.mainCol}>
            <MemorizationSection />
            <ProgressChartCard />
            <PracticeCardsGrid />
            <QuoteCard />
          </section>
          <aside className={styles.sideCol}>
            <CalendarCard />
            <FriendsCard />
            <RemindersCard />
          </aside>
        </div>
      </main>
    </div>
  );
}
