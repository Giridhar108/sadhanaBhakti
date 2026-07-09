import { CalendarCard } from '../../widgets/CalendarCard/CalendarCard';
import { MemorizationSection } from '../../widgets/MemorizationSection/MemorizationSection';
import { PracticeCardsGrid } from '../../widgets/PracticeCardsGrid/PracticeCardsGrid';
import { QuoteCard } from '../../widgets/QuoteCard/QuoteCard';
import { VerseImageBlock } from '../../widgets/VerseImageBlock/VerseImageBlock';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <section className={styles.dashboard}>
      {/* <MemorizationSection /> */}
      <div className={styles.contentGrid}>
        <section className={styles.mainCol}>
          <VerseImageBlock />
          <PracticeCardsGrid />
          <QuoteCard />
        </section>
        <aside className={styles.sideCol}>
          <CalendarCard />
        </aside>
      </div>
    </section>
  );
}
