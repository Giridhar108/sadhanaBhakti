import { useState } from 'react';
import verseImg from '../../shared/assets/images/verseImg2.png';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './MemorizationSection.module.css';

const grades = [
  { emoji: '☹', title: 'Не помню', tone: 'red' },
  { emoji: '😐', title: 'С ошибками', tone: 'orange' },
  { emoji: '☺', title: 'Почти идеально', tone: 'amber' },
  { emoji: '🙂', title: 'Легко вспомнил', tone: 'green' },
] as const;

const verses = [
  {
    reference: 'Бхагавад-гита 3.27',
    lines: ['пракр̣тех̣ крийама̄н̣а̄ни', 'гун̣аих̣ карма̄н̣и сарваш́ах̣', 'ахан̇ка̄ра-вимӯд̣ха̄тма̄', 'карта̄хам ити манйате'],
    meaning: 'Душа, введенная в заблуждение ложным эго, считает себя совершающей действия, хотя они выполняются гунами материальной природы.',
  },
  {
    reference: 'Бхагавад-гита 3.28',
    lines: ['таттва-вит ту маха̄-ба̄хо', 'гун̣а-карма-вибха̄гайох̣', 'гун̣а̄ гун̣еш̣у вартанта', 'ити матва̄ на саджджате'],
    meaning: 'Тот, кто знает истину, понимает связь гун и деятельности. Видя, что гуны взаимодействуют с гунами, он не привязывается.',
  },
  {
    reference: 'Бхагавад-гита 3.29',
    lines: ['пракр̣тер гун̣а-саммӯд̣ха̄х̣', 'саджджанте гун̣а-кармасу', 'та̄н акр̣тсна-видо манда̄н', 'кр̣тсна-вин на вича̄лайет'],
    meaning: 'Люди, сбитые с толку гунами природы, привязываются к действиям, рожденным гунами. Мудрый не должен тревожить тех, чье понимание еще неполно.',
  },
  {
    reference: 'Бхагавад-гита 3.30',
    lines: ['майи сарва̄н̣и карма̄н̣и', 'саннйасйа̄дхйа̄тма-четаса̄', 'нира̄ш́ӣр нирмамо бхӯтва̄', 'йудхйасва вигата-джварах̣'],
    meaning: 'Посвяти все свои действия Мне, сосредоточь сознание на духовном, оставь ожидания и чувство собственности, и действуй без беспокойства.',
  },
] as const;

export function MemorizationSection() {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const currentVerse = verses[currentVerseIndex];

  const goToPreviousVerse = () => {
    setCurrentVerseIndex((index) => (index === 0 ? verses.length - 1 : index - 1));
    setIsAnswerVisible(false);
  };

  const goToNextVerse = () => {
    setCurrentVerseIndex((index) => (index === verses.length - 1 ? 0 : index + 1));
    setIsAnswerVisible(false);
  };

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

        <span className={styles.pill}>{currentVerse.reference}</span>

        <div className={styles.controls} aria-label="Навигация по стихам">
          <span className={styles.counter}>{currentVerseIndex + 1} / {verses.length}</span>
          <button className={styles.navBtn} type="button" aria-label="Предыдущий стих" onClick={goToPreviousVerse}>
            <Icon name="chevron" />
          </button>
          <button className={styles.navBtn} type="button" aria-label="Следующий стих" onClick={goToNextVerse}>
            <Icon name="chevron" />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <article className={styles.heroCard}>
          <img src={verseImg} alt="" aria-hidden="true" />
          <div className={styles.heroOverlay}>
            {isAnswerVisible ? (
              <div className={styles.answerCard}>
                <div className={styles.answerContent}>
                  <p className={styles.verseText}>
                    {currentVerse.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </p>
                  <div className={styles.answerDivider} aria-hidden="true">
                    <span />
                    <Icon name="lotus" />
                    <span />
                  </div>
                  <p className={styles.meaning}>{currentVerse.meaning}</p>
                </div>
              </div>
            ) : (
              <p className={styles.prompt}>
                Попробуй вспомнить стих целиком.
                <br />
                Когда будешь готов — открой ответ.
              </p>
            )}
            <button className={styles.answerBtn} type="button" onClick={() => setIsAnswerVisible((isVisible) => !isVisible)}>
              <span className={`${styles.eyeIcon} ${isAnswerVisible ? styles.eyeOff : ''}`} aria-hidden="true" />
              {isAnswerVisible ? 'Скрыть ответ' : 'Показать ответ'}
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
            <span className={styles.infoWrap}>
              <button className={styles.infoTrigger} type="button" aria-label="Показать подсказку">
                i
              </button>
              <span className={styles.tooltip} role="tooltip">
                <span className={styles.tooltipHead}>
                  <Icon name="lotus" className={styles.tooltipIcon} />
                  <strong>Качество &gt; Количество</strong>
                </span>
                <span className={styles.tooltipText}>
                  Лучше вспомнить один раз с усилием, чем читать десять раз подряд. Старайся вспоминать, а не просто перечитывать.
                </span>
              </span>
            </span>
            <p>Система интервального повторения подберёт оптимальное время для следующего повторения.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
