import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getTodayVerses, getVerseSearchText, useVerseStore, type Verse } from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import { SegmentedControl } from '../../shared/ui/SegmentedControl/SegmentedControl';
import { PrayerCatalog } from '../../widgets/prayers/PrayerCatalog/PrayerCatalog';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') === 'prayers' ? 'prayers' : 'verses';
  useDocumentTitle(`${section === 'prayers' ? 'Молитвы' : 'Стихи'} — Садхана Бхакти`);
  const navigate = useNavigate();
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const error = useVerseStore((state) => state.error);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const removeVerseFromLearning = useVerseStore((state) => state.removeVerseFromLearning);
  const startReviewQueue = useVerseStore((state) => state.startReviewQueue);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<VerseFilter>('all');
  const [verseToRemove, setVerseToRemove] = useState<Verse | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    if (section === 'verses') {
      loadVerses();
    }
  }, [loadVerses, section]);

  const communityVerses = useMemo(
    () => verses.filter((verse) => !verse.catalog),
    [verses],
  );
  const bhaktiShastriVerses = useMemo(
    () => verses.filter((verse) => verse.catalog === 'bhakti-shastri'),
    [verses],
  );
  const personalVerses = useMemo(
    () => [
      ...communityVerses,
      ...bhaktiShastriVerses.filter((verse) => verse.status !== 'new'),
    ],
    [bhaktiShastriVerses, communityVerses],
  );
  const filteredVerses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru-RU');
    return personalVerses.filter((verse) => {
      if (query && !getVerseSearchText(verse).includes(query)) return false;
      if (filter === 'learning') return ['learning', 'review', 'needsReview'].includes(verse.status);
      if (filter === 'learned') return verse.status === 'learned';
      if (filter === 'favorites') return verse.isFavorite;
      return true;
    });
  }, [filter, personalVerses, search]);
  const reviewQueue = useMemo(() => getTodayVerses(verses), [verses]);
  const beginReviewQueue = () => {
    const firstVerseId = startReviewQueue(reviewQueue.map((verse) => verse.id));

    if (firstVerseId) {
      navigate(`/verses/${firstVerseId}/learn`);
    }
  };
  const confirmRemoveFromLearning = async () => {
    if (!verseToRemove) return;

    setIsRemoving(true);
    setRemoveError('');

    try {
      await removeVerseFromLearning(verseToRemove.id);
      setVerseToRemove(null);
    } catch {
      setRemoveError('Не удалось убрать стих из изучаемых. Попробуй ещё раз.');
    } finally {
      setIsRemoving(false);
    }
  };

  const changeSection = (value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('section', value === 'prayers' ? 'prayers' : 'verses');
    setSearchParams(nextSearchParams);
  };

  const sectionTabs = (
    <SegmentedControl
      className={styles.sectionTabs}
      value={section}
      ariaLabel="Разделы учебного центра"
      options={[
        { value: 'verses', label: 'Стихи' },
        { value: 'prayers', label: 'Молитвы' },
      ]}
      onChange={changeSection}
    />
  );

  if (section === 'prayers') {
    return (
      <section className={styles.page}>
        <header className={styles.hero}>
          <div>
            <span>Единый учебный центр</span>
            <h1>Изучение</h1>
            <p>Осваивайте вайшнавские молитвы</p>
          </div>
          <div className={styles.heroLotus} aria-hidden="true"><Icon name="lotus" /></div>
        </header>
        {sectionTabs}
        <div className={styles.sectionContent} key="prayers">
          <PrayerCatalog />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span>Единый учебный центр</span>
          <h1>Изучение</h1>
          <p>Добавляй стихи для всей общины и изучай каждый в удобном для себя темпе.</p>
        </div>
        <Link className={styles.addButton} to="/verses/new">+ Добавить стих</Link>
      </header>
      {sectionTabs}

      <div className={styles.sectionContent} key="verses">
        {error ? <div className={styles.error} role="alert">{error}</div> : null}

        {isLoading && verses.length === 0 ? (
          <div className={styles.loading}><span aria-hidden="true" />Загружаем стихи…</div>
        ) : null}

        {verses.length > 0 ? (
          <VerseReviewQueue verses={reviewQueue} onStart={beginReviewQueue} />
        ) : null}

        {bhaktiShastriVerses.length > 0 ? (
          <Link className={styles.catalogCard} to="/verses/bhakti-shastri">
            <div className={styles.catalogIcon} aria-hidden="true"><Icon name="book" /></div>
            <div>
              <span>Учебный каталог</span>
              <h2>Стихи Бхакти-шастры</h2>
              <p>45 обязательных стихов, собранных по четырём книгам.</p>
              <div className={styles.catalogBooks}>
                <i>Бхагавад-гита</i>
                <i>Бхакти-расамрита-синдху</i>
                <i>Шри Ишопанишад</i>
                <i>Нектар наставлений</i>
              </div>
            </div>
            <strong>{bhaktiShastriVerses.length}<small>стихов</small></strong>
            <Icon name="chevron" />
          </Link>
        ) : null}

        {!isLoading && personalVerses.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><Icon name="lotus" /></div>
            <h2>Общая коллекция пока пуста</h2>
            <p>Добавь первый стих — он сразу станет доступен всем пользователям.</p>
            <Link to="/verses/new">Добавить первый стих</Link>
          </div>
        ) : null}

        {personalVerses.length > 0 ? (
          <>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <Icon name="search" />
                <input
                  value={search}
                  placeholder="Найти стих в своих стихах"
                  aria-label="Поиск по стихам пользователя"
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
              onRemoveFromLearning={(verse) => {
                setRemoveError('');
                setVerseToRemove(verse);
              }}
              emptyTitle="Ничего не найдено"
              emptyText="Измени поисковый запрос или выбери другой фильтр."
            />
          </>
        ) : null}

        {verseToRemove ? (
          <div className={styles.dialogBackdrop} role="presentation">
            <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="remove-learning-title">
              <h2 id="remove-learning-title">Убрать стих из изучаемых?</h2>
              <p>
                Личный прогресс по стиху «{verseToRemove.bookTitle} {verseToRemove.chapter ? `${verseToRemove.chapter}.` : ''}{verseToRemove.verseNumber}»
                будет сброшен. Сам стих останется в каталоге, а отметка «Избранное» сохранится.
              </p>
              {removeError ? <span role="alert">{removeError}</span> : null}
              <div>
                <button type="button" disabled={isRemoving} onClick={() => setVerseToRemove(null)}>Отмена</button>
                <button className={styles.confirmRemove} type="button" disabled={isRemoving} onClick={confirmRemoveFromLearning}>
                  {isRemoving ? 'Убираем…' : 'Убрать из изучаемых'}
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
