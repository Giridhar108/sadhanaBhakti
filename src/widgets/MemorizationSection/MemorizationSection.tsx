import verseImg from '../../shared/assets/images/verseImg.png';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './MemorizationSection.module.css';

const grades = [
  { emoji: '☹', title: 'Не помню', tone: 'red' },
  { emoji: '😐', title: 'С ошибками', tone: 'orange' },
  { emoji: '☺', title: 'Почти идеально', tone: 'amber' },
  { emoji: '🙂', title: 'Легко вспомнил', tone: 'green' },
] as const;

export function MemorizationSection() {
  return (
    <section className={styles.section} aria-labelledby="memorization-title">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <Icon name="lotus" className={styles.lotusIcon} />
          <div>
            <h2 id="memorization-title">Проверь себя</h2>
            <p>Вспомни стих полностью без подсказок</p>
          </div>
        </div>

        <span className={styles.pill}>Бхагавад-гита 3.27</span>

        <div className={styles.controls} aria-label="Навигация по стихам">
          <span className={styles.counter}>1 / 3</span>
          <button className={styles.navBtn} type="button" aria-label="Предыдущий стих">
            <Icon name="chevron" />
          </button>
          <button className={styles.navBtn} type="button" aria-label="Следующий стих">
            <Icon name="chevron" />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <article className={styles.heroCard}>
          <img src={verseImg} alt="" aria-hidden="true" />
          <div className={styles.heroOverlay}>
            <p>
              Попробуй вспомнить стих целиком.
              <br />
              Когда будешь готов — открой ответ.
            </p>
            <button className={styles.answerBtn} type="button">
              <span className={styles.eyeIcon} aria-hidden="true" />
              Показать ответ
            </button>
          </div>
          <Icon name="lotus" className={styles.heroLotus} />
        </article>

        <aside className={styles.scoreCard}>
          <div className={styles.scoreHead}>
            <h3>Оцени, как получилось</h3>
            <p>От этого зависит, когда стих появится снова</p>
          </div>

          <div className={styles.gradeGrid}>
            {grades.map((grade) => (
              <button className={`${styles.grade} ${styles[grade.tone]}`} type="button" key={grade.title}>
                <span className={styles.face}>{grade.emoji}</span>
                <span>
                  <strong>{grade.title}</strong>
                </span>
              </button>
            ))}
          </div>

          <div className={styles.note}>
            <span aria-hidden="true">i</span>
            <p>Система интервального повторения подберёт оптимальное время для следующего повторения.</p>
          </div>
        </aside>
      </div>

      <footer className={styles.footer}>
        <Icon name="lotus" className={styles.footerIcon} />
        <strong>Качество &gt; Количество</strong>
        <span />
        <p>Лучше вспомнить один раз с усилием, чем читать десять раз подряд. Старайся вспоминать, а не просто перечитывать.</p>
        <Icon name="lotus" className={styles.footerWatermark} />
      </footer>
    </section>
  );
}
