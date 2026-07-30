import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPrayerProgress,
  prayerCategoryLabels,
  usePrayers,
  type PrayerCategory,
} from '../../../entities/prayer';
import { PrayerCard } from '../../../entities/prayer/ui/PrayerCard/PrayerCard';
import { useVerseStore } from '../../../entities/verse';
import { Icon } from '../../../shared/ui/Icon/Icon';
import styles from './PrayerCatalog.module.css';

type PrayerFilter = 'all' | PrayerCategory;

const filters: { id: PrayerFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  ...Object.entries(prayerCategoryLabels).map(([id, label]) => ({
    id: id as PrayerCategory,
    label,
  })),
];

const morningProgramPrayerSlugs = [
  'gurvastakam',
  'guru-vandana',
  'narasimha-pranama',
  'tulasi-arati',
];

const morningProgramOrder = new Map(
  morningProgramPrayerSlugs.map((slug, index) => [slug, index]),
);

export function PrayerCatalog() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PrayerFilter>('all');
  const { data: prayers, isPending, isError, refetch } = usePrayers();
  const prayerProgress = useVerseStore((state) => state.prayerProgress);
  const filteredPrayers = useMemo(() => {
    if (filter === 'all') return prayers ?? [];

    if (filter === 'morning-program') {
      return (prayers ?? [])
        .filter((prayer) => (
          prayer.category === filter || morningProgramOrder.has(prayer.slug)
        ))
        .sort((firstPrayer, secondPrayer) => (
          (morningProgramOrder.get(firstPrayer.slug) ?? Number.MAX_SAFE_INTEGER)
          - (morningProgramOrder.get(secondPrayer.slug) ?? Number.MAX_SAFE_INTEGER)
        ));
    }

    return (prayers ?? []).filter((prayer) => prayer.category === filter);
  }, [filter, prayers]);

  if (isPending) {
    return (
      <div className={styles.skeletonGrid} aria-label="Загружаем молитвы" aria-busy="true">
        {[0, 1, 2].map((item) => <div key={item} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <section className={styles.state} role="alert">
        <Icon name="lotus" />
        <h2>Не удалось загрузить молитвы</h2>
        <button type="button" onClick={() => void refetch()}>Попробовать снова</button>
      </section>
    );
  }

  return (
    <section className={styles.catalog} aria-labelledby="prayer-catalog-title">
      <div className={styles.heading}>
        <div>
          <span>Молитвенная практика</span>
          <h2 id="prayer-catalog-title">Каталог молитв</h2>
        </div>
        <strong>{prayers?.length ?? 0}<small>молитв</small></strong>
      </div>

      <div className={styles.filters} aria-label="Категории молитв">
        {filters.map((item) => (
          <button
            className={filter === item.id ? styles.activeFilter : ''}
            type="button"
            aria-pressed={filter === item.id}
            key={item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredPrayers.length > 0 ? (
        <div className={styles.grid}>
          {filteredPrayers.map((prayer) => (
            <PrayerCard
              prayer={prayer}
              progress={getPrayerProgress(prayer, prayerProgress)}
              key={prayer.id}
              onOpen={(prayerSlug) => navigate(`/verses/prayers/${prayerSlug}`)}
              onRead={(prayerSlug) => navigate(`/verses/prayers/${prayerSlug}?view=text#prayer-full-text`)}
            />
          ))}
        </div>
      ) : (
        <section className={styles.state}>
          <Icon name="lotus" />
          <h2>В этой категории пока нет молитв</h2>
          <button type="button" onClick={() => setFilter('all')}>Показать все молитвы</button>
        </section>
      )}
    </section>
  );
}
