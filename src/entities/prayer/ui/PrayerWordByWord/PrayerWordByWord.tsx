import { useState } from 'react';
import type { PrayerVerse } from '../../model/prayer.types';
import styles from './PrayerWordByWord.module.css';

type PrayerWordByWordProps = {
  verse: PrayerVerse;
};

const normalizeText = (value: string) => (
  value.toLocaleLowerCase('ru').replace(/[^a-zа-яё0-9]/giu, '')
);

function getEditDistance(left: string, right: string) {
  let previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const currentRow = [leftIndex];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      currentRow[rightIndex] = Math.min(
        currentRow[rightIndex - 1] + 1,
        previousRow[rightIndex] + 1,
        previousRow[rightIndex - 1] + (
          left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1
        ),
      );
    }

    previousRow = currentRow;
  }

  return previousRow[right.length];
}

function getInterlinearLines(verse: PrayerVerse) {
  const pronunciationLines = verse.russianPronunciation.split('\n').filter(Boolean);
  let wordIndex = 0;

  return pronunciationLines.map((sanskrit, lineIndex) => {
    const normalizedLine = normalizeText(sanskrit);
    const remainingLineCount = pronunciationLines.length - lineIndex - 1;

    if (lineIndex === pronunciationLines.length - 1) {
      const words = verse.words.slice(wordIndex);
      wordIndex = verse.words.length;
      return { sanskrit, words };
    }

    const maxEndIndex = Math.max(
      wordIndex + 1,
      verse.words.length - remainingLineCount,
    );
    let bestEndIndex = wordIndex + 1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let endIndex = wordIndex + 1; endIndex <= maxEndIndex; endIndex += 1) {
      const normalizedWords = verse.words
        .slice(wordIndex, endIndex)
        .map((word) => normalizeText(word.pronunciation))
        .join('');
      const score = getEditDistance(normalizedLine, normalizedWords);

      if (score < bestScore) {
        bestScore = score;
        bestEndIndex = endIndex;
      }
    }

    const words = verse.words.slice(wordIndex, bestEndIndex);
    wordIndex = bestEndIndex;

    return { sanskrit, words };
  });
}

export function PrayerWordByWord({ verse }: PrayerWordByWordProps) {
  const sanskritPhrases = verse.russianPronunciation.split('\n').filter(Boolean);
  const interlinearLines = getInterlinearLines(verse);
  const [showInterlinear, setShowInterlinear] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);

  if (sanskritPhrases.length === 0) return null;

  return (
    <>
      {verse.words.length > 0 ? (
        <section className={styles.collapsibleBlock}>
          <button
            className={styles.toggleButton}
            type="button"
            aria-expanded={showInterlinear}
            onClick={() => setShowInterlinear((isVisible) => !isVisible)}
          >
            <span>Пословный перевод</span>
            <span
              className={`${styles.toggleIcon} ${showInterlinear ? styles.toggleIconOpen : ''}`}
              aria-hidden="true"
            />
          </button>
          {showInterlinear ? (
            <div className={styles.interlinear}>
              {interlinearLines.map((line, lineIndex) => (
                <div className={styles.interlinearLine} key={`${verse.id}-interlinear-${lineIndex + 1}`}>
                  {line.words.map((word) => (
                    <div className={styles.interlinearPair} key={word.id}>
                      <strong>{word.pronunciation}</strong>
                      <span>{word.translation}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={styles.collapsibleBlock}>
        <button
          className={styles.toggleButton}
          type="button"
          aria-expanded={showPhrases}
          onClick={() => setShowPhrases((isVisible) => !isVisible)}
        >
          <span>Построчный перевод</span>
          <span
            className={`${styles.toggleIcon} ${showPhrases ? styles.toggleIconOpen : ''}`}
            aria-hidden="true"
          />
        </button>
        {showPhrases ? (
          <dl className={styles.words}>
            {sanskritPhrases.map((sanskrit, phraseIndex) => (
              <div className={styles.word} key={`${verse.id}-phrase-${phraseIndex + 1}`}>
                <dt>{sanskrit}</dt>
                <dd>{verse.phraseTranslations[phraseIndex]}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
    </>
  );
}
