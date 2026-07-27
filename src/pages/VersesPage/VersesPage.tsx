import { type KeyboardEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodayVerses,
  getUserVerses,
  getVerseSearchText,
  useVerseStore,
} from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import { TodayVersesCard } from '../../widgets/verses/TodayVersesCard/TodayVersesCard';
import { VerseCatalog } from '../../widgets/verses/VerseCatalog/VerseCatalog';
import { VerseList } from '../../widgets/verses/VerseList/VerseList';
import styles from './VersesPage.module.css';

type VersesTab = 'today' | 'mine' | 'catalog';
type VerseFilter = 'all' | 'learning' | 'learned' | 'favorites';

const tabs: { id: VersesTab; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'mine', label: 'Мои стихи' },
  { id: 'catalog', label: 'Каталог' },
];

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
  const userVerseIds = useVerseStore((state) => state.userVerseIds);
  const addVerseToLearning = useVerseStore((state) => state.addVerseToLearning);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const startLearningSession = useVerseStore((state) => state.startLearningSession);
  const [activeTab, setActiveTab] = useState<VersesTab>('today');
  const [filter, setFilter] = useState<VerseFilter>('all');
  const [search, setSearch] = useState('');
  const userVerses = useMemo(
    () => getUserVerses(verses, userVerseIds),
    [userVerseIds, verses],
  );
  const todayVerses = useMemo(
    () => getTodayVerses(verses, userVerseIds),
    [userVerseIds, verses],
  );
  const normalizedSearch = search.trim().toLocaleLowerCase('ru-RU');
  const searchedVerses = useMemo(
    () => (
      normalizedSearch
        ? userVerses.filter((verse) => getVerseSearchText(verse).includes(normalizedSearch))
        : userVerses
    ),
    [normalizedSearch, userVerses],
  );
  const filteredVerses = searchedVerses.filter((verse) => {
    if (filter === 'learning') {
      return verse.status === 'learning' || verse.status === 'review' || verse.status === 'needsReview';
    }

    if (filter === 'learned') {
      return verse.status === 'learned';
    }

    if (filter === 'favorites') {
      return verse.isFavorite;
    }

    return true;
  });
  const catalogVerses = normalizedSearch
    ? verses.filter((verse) => getVerseSearchText(verse).includes(normalizedSearch))
    : verses;
  const learnedCount = userVerses.filter((verse) => verse.status === 'learned').length;
  const averageProgress = userVerses.length > 0
    ? Math.round(userVerses.reduce((total, verse) => total + verse.progress, 0) / userVerses.length)
    : 0;

  const startVerse = (verseId: string) => {
    startLearningSession(verseId);
    navigate(`/verses/${verseId}/learn`);
  };

  const addVerse = (verseId: string) => {
    addVerseToLearning(verseId);
    navigate(`/verses/${verseId}`);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    setActiveTab(nextTab.id);
    const tabButtons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabButtons?.[nextIndex]?.focus();
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span>Память и повторение</span>
          <h1>Стихи</h1>
          <p>Запоминай постепенно и повторяй в нужный момент</p>
        </div>
        <div className={styles.metrics} aria-label="Прогресс изучения стихов">
          <article>
            <strong>{userVerses.length}</strong>
            <small>моих стихов</small>
          </article>
          <article>
            <strong>{averageProgress}%</strong>
            <small>средний прогресс</small>
          </article>
          <article>
            <strong>{learnedCount}</strong>
            <small>выучено</small>
          </article>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Разделы стихов">
        {tabs.map((tab, index) => (
          <button
            id={`verses-tab-${tab.id}`}
            className={activeTab === tab.id ? styles.activeTab : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`verses-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
            {tab.id === 'today' && todayVerses.length > 0 ? <span>{todayVerses.length}</span> : null}
          </button>
        ))}
      </div>

      {activeTab !== 'today' ? (
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Icon name="search" />
            <input
              value={search}
              placeholder="Найти стих, источник или слово"
              aria-label="Поиск по стихам"
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {activeTab === 'mine' ? (
            <div className={styles.filters} aria-label="Фильтры стихов">
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
          ) : null}
        </div>
      ) : null}

      <div
        id={`verses-panel-${activeTab}`}
        className={styles.panel}
        role="tabpanel"
        aria-labelledby={`verses-tab-${activeTab}`}
      >
        {activeTab === 'today' ? (
          <>
            <TodayVersesCard
              verses={todayVerses}
              onStart={() => {
                const firstVerse = todayVerses[0];

                if (firstVerse) {
                  startVerse(firstVerse.id);
                }
              }}
              onAdd={() => setActiveTab('catalog')}
              onReviewLearned={() => {
                const reviewVerse = userVerses.find((verse) => verse.status === 'learned' || verse.status === 'review');

                if (reviewVerse) {
                  startVerse(reviewVerse.id);
                } else {
                  setActiveTab('mine');
                }
              }}
            />
            {todayVerses.length > 0 ? (
              <section className={styles.todayList}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span>Очередь</span>
                    <h2>Стихи на сегодня</h2>
                  </div>
                  <small>Можно начать с любого</small>
                </div>
                <VerseList
                  verses={todayVerses}
                  onToggleFavorite={toggleVerseFavorite}
                />
              </section>
            ) : null}
          </>
        ) : null}

        {activeTab === 'mine' ? (
          <VerseList
            verses={filteredVerses}
            onToggleFavorite={toggleVerseFavorite}
            emptyTitle={search || filter !== 'all' ? 'Ничего не найдено' : 'Список пока пуст'}
            emptyText={
              search || filter !== 'all'
                ? 'Измени поисковый запрос или выбери другой фильтр.'
                : 'Открой каталог и добавь первый стих.'
            }
          />
        ) : null}

        {activeTab === 'catalog' ? (
          catalogVerses.length > 0 ? (
            <VerseCatalog
              verses={catalogVerses}
              userVerseIds={userVerseIds}
              onAddVerse={addVerse}
            />
          ) : (
            <div className={styles.catalogEmpty}>
              <strong>Стихов не найдено</strong>
              <p>Попробуй изменить поисковый запрос.</p>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
