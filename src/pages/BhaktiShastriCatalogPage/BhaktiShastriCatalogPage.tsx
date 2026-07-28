import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVerseSearchText, useVerseStore, type Verse } from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import { VerseList } from '../../widgets/verses/VerseList/VerseList';
import styles from './BhaktiShastriCatalogPage.module.css';

const catalogId = 'bhakti-shastri';

const catalogBooks = [
  {
    number: 1,
    title: 'Бхагавад-гита',
    description: 'Избранные стихи из всех восемнадцати глав',
    anchor: 'bhagavad-gita',
  },
  {
    number: 2,
    title: 'Бхакти-расамрита-синдху',
    description: 'Определения и принципы чистого преданного служения',
    anchor: 'bhakti-rasamrita-sindhu',
  },
  {
    number: 3,
    title: 'Шри Ишопанишад',
    description: 'Обращение и первая мантра',
    anchor: 'sri-isopanishad',
  },
  {
    number: 4,
    title: 'Нектар наставлений',
    description: 'Первые четыре наставления Шрилы Рупы Госвами',
    anchor: 'nectar-of-instruction',
  },
] as const;

const sortCatalogVerses = (first: Verse, second: Verse) =>
  (first.catalogOrder ?? Number.MAX_SAFE_INTEGER) - (second.catalogOrder ?? Number.MAX_SAFE_INTEGER);

export default function BhaktiShastriCatalogPage() {
  useDocumentTitle('Каталог Бхакти-шастры — Садхана Бхакти');
  const verses = useVerseStore((state) => state.verses);
  const isLoading = useVerseStore((state) => state.isLoading);
  const error = useVerseStore((state) => state.error);
  const loadVerses = useVerseStore((state) => state.loadVerses);
  const toggleVerseFavorite = useVerseStore((state) => state.toggleVerseFavorite);
  const [search, setSearch] = useState('');
  const [expandedBooks, setExpandedBooks] = useState<string[]>([]);

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  const catalogVerses = useMemo(
    () => verses.filter((verse) => verse.catalog === catalogId).sort(sortCatalogVerses),
    [verses],
  );

  const visibleBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru-RU');

    return catalogBooks
      .map((book) => ({
        ...book,
        verses: catalogVerses.filter((verse) =>
          verse.bookTitle === book.title
          && (!query || getVerseSearchText(verse).includes(query))),
      }))
      .filter((book) => book.verses.length > 0);
  }, [catalogVerses, search]);

  const toggleBook = (anchor: string) => {
    setExpandedBooks((current) =>
      current.includes(anchor)
        ? current.filter((item) => item !== anchor)
        : [...current, anchor]);
  };

  const openBook = (anchor: string) => {
    setExpandedBooks((current) => current.includes(anchor) ? current : [...current, anchor]);
    window.requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/verses">
        <Icon name="back" />
        Все стихи
      </Link>

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">
          <Icon name="book" />
        </div>
        <div>
          <span>Учебная коллекция</span>
          <h1>Стихи Бхакти-шастры</h1>
          <p>
            45 обязательных стихов с санскритом и точным русским переводом.
            Выбирай книгу и изучай каждый стих в своём темпе.
          </p>
        </div>
        <div className={styles.summary} aria-label="Состав каталога">
          <strong>{catalogVerses.length || 45}</strong>
          <span>стихов</span>
          <i aria-hidden="true" />
          <strong>4</strong>
          <span>книги</span>
        </div>
      </header>

      <nav className={styles.bookNavigation} aria-label="Книги каталога">
        {catalogBooks.map((book) => {
          const count = catalogVerses.filter((verse) => verse.bookTitle === book.title).length;

          return (
            <button type="button" onClick={() => openBook(book.anchor)} key={book.title}>
              <span>{book.title}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </nav>

      <label className={styles.search}>
        <Icon name="search" />
        <input
          value={search}
          placeholder="Найти стих в каталоге"
          aria-label="Поиск по каталогу Бхакти-шастры"
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      {isLoading && catalogVerses.length === 0 ? (
        <div className={styles.loading}><span aria-hidden="true" />Загружаем каталог…</div>
      ) : null}

      {!isLoading && catalogVerses.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="book" />
          <h2>Каталог пока недоступен</h2>
          <p>Обнови страницу или попробуй открыть каталог немного позже.</p>
        </div>
      ) : null}

      {catalogVerses.length > 0 && visibleBooks.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="search" />
          <h2>Стихи не найдены</h2>
          <p>Попробуй изменить поисковый запрос.</p>
        </div>
      ) : null}

      {visibleBooks.map((book) => (
        <section className={styles.bookSection} id={book.anchor} key={book.title}>
          <button
            className={styles.bookToggle}
            type="button"
            aria-expanded={expandedBooks.includes(book.anchor)}
            aria-controls={`${book.anchor}-verses`}
            onClick={() => toggleBook(book.anchor)}
          >
            <div className={styles.bookNumber} aria-hidden="true">{book.number}</div>
            <div className={styles.bookCopy}>
              <span>Книга {book.number}</span>
              <h2>{book.title}</h2>
              <p>{book.description}</p>
            </div>
            <strong>{book.verses.length} стихов</strong>
            <span className={styles.expandIcon} aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </button>
          {expandedBooks.includes(book.anchor) ? (
            <div className={styles.bookContent} id={`${book.anchor}-verses`}>
              <VerseList
                verses={book.verses}
                onToggleFavorite={toggleVerseFavorite}
              />
            </div>
          ) : null}
        </section>
      ))}
    </section>
  );
}
