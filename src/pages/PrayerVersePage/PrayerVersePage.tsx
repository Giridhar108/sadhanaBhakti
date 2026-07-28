import { Link, useParams } from 'react-router-dom';
import {
  getPrayerBySlug,
  getPrayerVerseById,
  prayerCategoryLabels,
  usePrayers,
} from '../../entities/prayer';
import { PrayerVerseContent } from '../../entities/prayer/ui/PrayerVerseContent/PrayerVerseContent';
import { useVerseStore } from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './PrayerVersePage.module.css';

export default function PrayerVersePage() {
  const { prayerSlug, prayerVerseId } = useParams();
  const { data: prayers, isPending } = usePrayers();
  const prayerProgress = useVerseStore((state) => state.prayerProgress);
  const prayer = getPrayerBySlug(prayers ?? [], prayerSlug);
  const verse = prayer ? getPrayerVerseById(prayer, prayerVerseId) : undefined;
  const status = verse ? prayerProgress[verse.id]?.status : undefined;

  useDocumentTitle(
    prayer && verse
      ? `Строфа ${verse.order}: ${prayer.title} — Садхана Бхакти`
      : 'Строфа молитвы — Садхана Бхакти',
  );

  if (isPending) {
    return <Card className={styles.state}>Загружаем строфу…</Card>;
  }

  if (!prayer || !verse) {
    return (
      <Card className={styles.state}>
        <Icon name="scroll" />
        <h1>Строфа не найдена</h1>
        <Link to="/verses?section=prayers">Вернуться к молитвам</Link>
      </Card>
    );
  }

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to={`/verses/prayers/${prayer.slug}`}>
        <Icon name="back" />
        {prayer.title}
      </Link>
      <header className={styles.header}>
        <div>
          <span>{prayerCategoryLabels[prayer.category]}</span>
          <h1>Строфа {verse.order}</h1>
          <p>{prayer.title} · {status === 'learned' ? 'Изучено' : status === 'learning' ? 'Изучается' : 'Не изучено'}</p>
        </div>
        <Link className={styles.learnLink} to={`/verses/prayers/${prayer.slug}/${verse.id}/learn`}>
          <Icon name="lotus" />
          {status ? 'Продолжить изучение' : 'Начать изучение'}
        </Link>
      </header>
      <Card className={styles.contentCard}>
        <PrayerVerseContent verse={verse} />
      </Card>
    </section>
  );
}
