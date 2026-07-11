import { MemorizationSection } from '../../widgets/MemorizationSection/MemorizationSection';
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
          <QuoteCard />
        </section>
      </div>
    </section>
  );
}
