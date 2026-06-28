import { CalendarCard } from '../../widgets/CalendarCard/CalendarCard';
import { FriendsCard } from '../../widgets/FriendsCard/FriendsCard';
import { Header } from '../../widgets/Header/Header';
import { MemorizationSection } from '../../widgets/MemorizationSection/MemorizationSection';
import { PracticeCardsGrid } from '../../widgets/PracticeCardsGrid/PracticeCardsGrid';
import { ProgressChartCard } from '../../widgets/ProgressChartCard/ProgressChartCard';
import { QuoteCard } from '../../widgets/QuoteCard/QuoteCard';
import { RemindersCard } from '../../widgets/RemindersCard/RemindersCard';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './ComponentsPreviewPage.module.css';

export function ComponentsPreviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <span>Components preview</span>
        <h1>Компоненты dashboard</h1>
        <p>Здесь каждый блок можно смотреть и править отдельно, не ломая весь экран.</p>
      </div>

      <section className={styles.blockWide}>
        <h2>Header</h2>
        <Header />
      </section>

      <section className={styles.previewGrid}>
        <div className={styles.sidebarBox}>
          <h2>Sidebar</h2>
          <Sidebar isStatic />
        </div>
        <div className={styles.column}>
          <h2>MemorizationSection</h2>
          <MemorizationSection />
          <h2>ProgressChartCard</h2>
          <ProgressChartCard />
          <h2>PracticeCardsGrid</h2>
          <PracticeCardsGrid />
          <h2>QuoteCard</h2>
          <QuoteCard />
        </div>
        <div className={styles.sideColumn}>
          <h2>CalendarCard</h2>
          <CalendarCard />
          <h2>FriendsCard</h2>
          <FriendsCard />
          <h2>RemindersCard</h2>
          <RemindersCard />
        </div>
      </section>
    </main>
  );
}
