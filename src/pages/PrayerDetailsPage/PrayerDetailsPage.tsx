import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  getPrayerBySlug,
  getPrayerProgress,
  isPrayerVerseStudied,
  prayerCategoryLabels,
  usePrayers,
} from '../../entities/prayer';
import { PrayerWordByWord } from '../../entities/prayer/ui/PrayerWordByWord/PrayerWordByWord';
import { useVerseStore } from '../../entities/verse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import { ProgressBar } from '../../shared/ui/ProgressBar/ProgressBar';
import styles from './PrayerDetailsPage.module.css';

export default function PrayerDetailsPage() {
  const { prayerSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: prayers, isPending } = usePrayers();
  const prayerProgress = useVerseStore((state) => state.prayerProgress);
  const prayer = getPrayerBySlug(prayers ?? [], prayerSlug);
  const showFullText = searchParams.get('view') === 'text';

  useDocumentTitle(prayer ? `${prayer.title} — Садхана Бхакти` : 'Молитва — Садхана Бхакти');

  if (isPending) {
    return <Card className={styles.state}>Загружаем молитву…</Card>;
  }

  if (!prayer) {
    return (
      <Card className={styles.state}>
        <Icon name="lotus" />
        <h1>Молитва не найдена</h1>
        <Link to="/verses?section=prayers">Вернуться к молитвам</Link>
      </Card>
    );
  }

  const progress = getPrayerProgress(prayer, prayerProgress);
  const orderedVerses = [...prayer.verses]
    .sort((first, second) => first.order - second.order);
  const lastStartedVerse = [...orderedVerses]
    .reverse()
    .find((verse) => Boolean(prayerProgress[verse.id]));
  const isPrayerCycleComplete = progress.learnedVerses === prayer.totalVerses;
  const startVerse = isPrayerCycleComplete
    ? orderedVerses[0]
    : lastStartedVerse ?? orderedVerses[0];
  const startLearning = () => {
    if (startVerse) {
      navigate(`/verses/prayers/${prayer.slug}/${startVerse.id}/learn?sequence=1`);
    }
  };

  return (
    <section className={styles.page}>
      <Link className={styles.backLink} to="/verses?section=prayers">
        <Icon name="back" />
        Все молитвы
      </Link>

      <header className={styles.hero}>
        <div className={styles.ornament} aria-hidden="true"><Icon name="lotus" /></div>
        <div>
          <span>{prayerCategoryLabels[prayer.category]}</span>
          <h1>{prayer.title}</h1>
          <p className={styles.opening}>«{prayer.openingWords}…»</p>
          {prayer.author ? <p className={styles.author}>{prayer.author}</p> : null}
          {prayer.description ? <p className={styles.description}>{prayer.description}</p> : null}
          <div className={styles.meta}>
            <strong>{prayer.totalVerses} строф</strong>
            <span>Изучено {progress.learnedVerses}</span>
            <span>{progress.progressPercent}%</span>
          </div>
          <ProgressBar
            value={progress.progressPercent}
            ariaLabel={`Общий прогресс молитвы: ${progress.progressPercent}%`}
          />
        </div>
        <button type="button" disabled={!startVerse} onClick={startLearning}>
          <Icon name="lotus" />
          {progress.learnedVerses === prayer.totalVerses
            ? 'Продолжить повторение'
            : progress.startedVerses
              ? 'Продолжить повторение'
              : 'Начать изучение'}
        </button>
      </header>

      {prayer.isAvailable && showFullText ? (
        <section className={styles.fullText} id="prayer-full-text" aria-labelledby="prayer-full-text-title">
          <div className={styles.fullTextHeading}>
            <div>
              <span>Молитва целиком</span>
              <h2 id="prayer-full-text-title">Санскрит и перевод</h2>
            </div>
            <Link to={`/verses/prayers/${prayer.slug}`}>К списку строф</Link>
          </div>
          <div className={styles.fullTextVerses}>
            {orderedVerses.map((verse) => (
              <article className={styles.fullTextVerse} key={verse.id}>
                <div className={styles.fullTextNumber}>{verse.order}</div>
                <div>
                  <PrayerWordByWord verse={verse} />
                  <p className={styles.translationText}>{verse.translation}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {prayer.isAvailable && !showFullText ? (
        <section className={styles.verses} aria-labelledby="prayer-verses-title">
          <div className={styles.sectionHeading}>
            <div>
              <span>По одной строфе</span>
              <h2 id="prayer-verses-title">Строфы молитвы</h2>
            </div>
            <Link to={`/verses/prayers/${prayer.slug}?view=text#prayer-full-text`}>
              К полному переводу
            </Link>
          </div>
          {prayer.verses.map((verse) => {
            const verseProgress = prayerProgress[verse.id];
            const status = isPrayerVerseStudied(verseProgress)
              ? 'Изучено'
              : verseProgress?.status === 'learning'
                ? 'Изучается'
                : 'Не изучено';

            return (
              <Card className={styles.verseCard} key={verse.id}>
                <Link
                  className={styles.verseMainLink}
                  to={`/verses/prayers/${prayer.slug}/${verse.id}`}
                  aria-label={`Открыть строфу ${verse.order}: санскрит и переводы`}
                >
                  <div className={styles.verseNumber}>{verse.order}</div>
                  <div>
                    <span>{status}</span>
                    <h3>Строфа {verse.order}</h3>
                    <p>{verse.transliteration.split('\n')[0]}</p>
                  </div>
                </Link>
                <div className={styles.verseActions}>
                  <Link className={styles.learnLink} to={`/verses/prayers/${prayer.slug}/${verse.id}/learn`}>
                    Изучать
                  </Link>
                </div>
              </Card>
            );
          })}
          {prayer.verses.length < prayer.totalVerses ? (
            <div className={styles.upcoming}>
              Ещё {prayer.totalVerses - prayer.verses.length} строф будут добавлены после редакторской проверки.
            </div>
          ) : null}
        </section>
      ) : !prayer.isAvailable ? (
        <Card className={styles.state}>
          <Icon name="book" />
          <h2>Скоро появится</h2>
          <p>Пословный перевод этой молитвы скоро появится</p>
        </Card>
      ) : null}
    </section>
  );
}
