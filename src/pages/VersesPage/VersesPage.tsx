import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTodayVerses, getVerseSearchText, useVerseStore } from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import { VerseList } from '../../widgets/verses/VerseList/VerseList';
import { VerseReviewQueue } from '../../widgets/verses/VerseReviewQueue/VerseReviewQueue';
import styles from './VersesPage.module.css';

type VerseFilter = 'all' | 'learning' | 'learned' | 'favorites';

const filters: { id: VerseFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'learning', label: 'Изучаю' },
  { id: 'learned', label: 'Выученные' },
  { id: 'favorites', label: 'Избранные' },
];

export default function VersesPage() {
  useDocumentTitle('Стихи — Садхана Бхакти');
  const navigate = useNavigate();
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const error = useVerseStore((state) => state.error);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const startReviewQueue = useVerseStore((state) => state.startReviewQueue);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VerseFilter>('all');

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  const filteredVerses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru-RU');
    return verses.filter((verse) => {
      if (query && !getVerseSearchText(verse).includes(query)) return false;
      if (filter === 'learning') return ['learning', 'review', 'needsReview'].includes(verse.status);
      if (filter === 'learned') return verse.status === 'learned';
      if (filter === 'favorites') return verse.isFavorite;
      return true;
    });
  }, [filter, search, verses]);
  const reviewQueue = useMemo(() => getTodayVerses(verses), [verses]);
  const beginReviewQueue = () => {
    const firstVerseId = startReviewQueue(reviewQueue.map((verse) => verse.id));

    if (firstVerseId) {
      navigate(`/verses/${firstVerseId}/learn`);
    }
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span>Общая коллекция</span>
          <h1>Стихи</h1>
          <p>Добавляй стихи для всей общины и изучай каждый в удобном для себя темпе.</p>
        </div>
        <Link className={styles.addButton} to="/verses/new">+ Добавить стих</Link>
      </header>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      {isLoading && verses.length === 0 ? (
        <div className={styles.loading}><span aria-hidden="true" />Загружаем стихи…</div>
      ) : null}

      {!isLoading && verses.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><Icon name="lotus" /></div>
          <h2>Общая коллекция пока пуста</h2>
          <p>Добавь первый стих — он сразу станет доступен всем пользователям.</p>
          <Link to="/verses/new">Добавить первый стих</Link>
        </div>
      ) : null}

      {verses.length > 0 ? (
        <>
          <VerseReviewQueue verses={reviewQueue} onStart={beginReviewQueue} />
          <div className={styles.toolbar}>
            <label className={styles.search}>
              <Icon name="search" />
              <input
                value={search}
                placeholder="Найти стих в общей коллекции"
                aria-label="Поиск по общей коллекции стихов"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className={styles.filters} aria-label="Фильтры стихов">
              {filters.map((item) => (
                <button
                  type="button"
                  className={filter === item.id ? styles.activeFilter : ''}
                  aria-pressed={filter === item.id}
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <VerseList
            verses={filteredVerses}
            onToggleFavorite={toggleVerseFavorite}
            emptyTitle="Ничего не найдено"
            emptyText="Измени поисковый запрос или выбери другой фильтр."
          />
        </>
      ) : null}
    </section>
  );
}
