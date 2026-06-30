import { Header } from '../../widgets/Header/Header';
import { MemorizationSection } from '../../widgets/MemorizationSection/MemorizationSection';
import { PracticeCardsGrid } from '../../widgets/PracticeCardsGrid/PracticeCardsGrid';
import { QuoteCard } from '../../widgets/QuoteCard/QuoteCard';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.dashboard}>
        <Header />
        <MemorizationSection />
        <div className={styles.contentGrid}>
          <section className={styles.mainCol}>
            <PracticeCardsGrid />
            <QuoteCard />
          </section>
        </div>
      </main>
    </div>
  );
}
