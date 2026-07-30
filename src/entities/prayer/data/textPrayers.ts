import type { Prayer, PrayerCategory, PrayerVerse, PrayerWord } from '../model/prayer.types';
import guruVandanaSource from '../../../shared/assets/01_Шри_Гуру-вандана.txt?raw';
import gauraAratiSource from '../../../shared/assets/02_Шри_Гаура-арати.txt?raw';
import tulasiAratiSource from '../../../shared/assets/03_Туласи-арати.txt?raw';
import narasimhaPranamaSource from '../../../shared/assets/04_Шри_Нрисимха-пранама.txt?raw';
import jayaRadhaMadhavaSource from '../../../shared/assets/05_Джая_Радха-Мадхава.txt?raw';
import yasomatiNandanaSource from '../../../shared/assets/06_Яшомати-нандана.txt?raw';
import bhajaBhakataVatsalaSource from '../../../shared/assets/07_Бхаджа_бхаката-ватсала.txt?raw';
import damodarastakamSource from '../../../shared/assets/08_Шри_Дамодараштака.txt?raw';

type ParsedWord = Omit<PrayerWord, 'id'>;

type ParsedSection = {
  russianPronunciation: string[];
  words: ParsedWord[];
  phraseTranslations: string[];
  translation: string;
};

type WordOverride = readonly [
  pronunciation: string,
  translation: string,
];

type PrayerSourceConfig = {
  id: string;
  title: string;
  shortTitle?: string;
  openingWords: string;
  category: PrayerCategory;
  description: string;
  source: string;
  linesPerVerse?: number;
  sectionWordOverrides?: Record<number, readonly WordOverride[]>;
};

const sectionHeadingPattern =
  /^(?:СТРОФА \d+|МОЛИТВА \d+|ВСТУПИТЕЛЬНАЯ МАНТРА|МАНТРА ОБХОДА ТУЛАСИ)\r?$/gm;

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

function getSectionBodies(source: string) {
  const matches = [...source.matchAll(sectionHeadingPattern)];

  return matches.map((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = matches[index + 1]?.index ?? source.length;

    return source.slice(contentStart, contentEnd);
  });
}

function parseWords(value: string): ParsedWord[] {
  return value
    .split(/;\s*|\r?\n/)
    .map((line) => line.trim().replace(/[.;]$/, ''))
    .filter(Boolean)
    .map((line) => {
      const [pronunciation = '', ...translationParts] = line.split(/\s+[—–]\s+/);

      return {
        original: pronunciation.trim(),
        pronunciation: pronunciation.trim(),
        translation: translationParts.join(' — ').trim(),
      };
    })
    .filter((word) => Boolean(word.pronunciation && word.translation));
}

function partitionWordsByLines(lines: string[], words: ParsedWord[]) {
  let wordIndex = 0;

  return lines.map((line, lineIndex) => {
    if (lineIndex === lines.length - 1) {
      const lineWords = words.slice(wordIndex);
      wordIndex = words.length;
      return lineWords;
    }

    const normalizedLine = normalizeText(line);
    const remainingLineCount = lines.length - lineIndex - 1;
    const maxEndIndex = Math.max(wordIndex + 1, words.length - remainingLineCount);
    let bestEndIndex = wordIndex + 1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let endIndex = wordIndex + 1; endIndex <= maxEndIndex; endIndex += 1) {
      const normalizedWords = words
        .slice(wordIndex, endIndex)
        .map((word) => normalizeText(word.pronunciation))
        .join('');
      const score = getEditDistance(normalizedLine, normalizedWords);

      if (score < bestScore) {
        bestScore = score;
        bestEndIndex = endIndex;
      }
    }

    const lineWords = words.slice(wordIndex, bestEndIndex);
    wordIndex = bestEndIndex;
    return lineWords;
  });
}

function parseSection(section: string): ParsedSection | null {
  const pronunciationMatch = section.match(
    /Санскрит(?: \/ бенгали)? русскими буквами:\s*\r?\n([\s\S]*?)\r?\n\s*Пословный перевод:/i,
  );
  const wordsMatch = section.match(
    /Пословный перевод:\s*\r?\n([\s\S]*?)\r?\n\s*Литературный перевод:/i,
  );
  const translationMatch = section.match(
    /Литературный перевод:\s*\r?\n([\s\S]*)/i,
  );

  if (!pronunciationMatch || !wordsMatch || !translationMatch) return null;

  const russianPronunciation = pronunciationMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const words = parseWords(wordsMatch[1]);
  const wordsByLine = partitionWordsByLines(russianPronunciation, words);
  const translation = translationMatch[1]
    .replace(/^-{8,}\s*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    russianPronunciation,
    words,
    phraseTranslations: wordsByLine.map((lineWords) => (
      lineWords.map((word) => word.translation).join(', ')
    )),
    translation,
  };
}

function splitSentences(value: string) {
  return (value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [value])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getFragmentTranslation(
  translation: string,
  fragmentIndex: number,
  fragmentCount: number,
) {
  if (fragmentCount === 1) return translation;

  const sentences = splitSentences(translation);

  if (sentences.length < fragmentCount) return translation;

  const startIndex = Math.floor((fragmentIndex * sentences.length) / fragmentCount);
  const endIndex = Math.floor(((fragmentIndex + 1) * sentences.length) / fragmentCount);

  return sentences.slice(startIndex, Math.max(startIndex + 1, endIndex)).join(' ');
}

function buildPrayer(config: PrayerSourceConfig): Prayer {
  const parsedSections = getSectionBodies(config.source)
    .map(parseSection)
    .filter((section): section is ParsedSection => Boolean(section))
    .map((section, sectionIndex) => {
      const wordOverride = config.sectionWordOverrides?.[sectionIndex];

      if (!wordOverride) return section;

      const words = wordOverride.map(([pronunciation, translation]) => ({
        original: pronunciation,
        pronunciation,
        translation,
      }));
      const wordsByLine = partitionWordsByLines(section.russianPronunciation, words);

      return {
        ...section,
        words,
        phraseTranslations: wordsByLine.map((lineWords) => (
          lineWords.map((word) => word.translation).join(', ')
        )),
      };
    });
  const verseDrafts = parsedSections.flatMap((section) => {
    const wordsByLine = partitionWordsByLines(section.russianPronunciation, section.words);
    const linesPerVerse = config.linesPerVerse ?? section.russianPronunciation.length;
    const fragmentCount = Math.ceil(section.russianPronunciation.length / linesPerVerse);

    return Array.from({ length: fragmentCount }, (_, fragmentIndex) => {
      const startIndex = fragmentIndex * linesPerVerse;
      const endIndex = startIndex + linesPerVerse;

      return {
        russianPronunciation: section.russianPronunciation.slice(startIndex, endIndex),
        words: wordsByLine.slice(startIndex, endIndex).flat(),
        phraseTranslations: section.phraseTranslations.slice(startIndex, endIndex),
        translation: getFragmentTranslation(
          section.translation,
          fragmentIndex,
          fragmentCount,
        ),
      };
    });
  });
  const author = config.source.match(/^Автор(?: молитвы)?:\s*(.+)$/m)?.[1]?.trim();
  const verses: PrayerVerse[] = verseDrafts.map((draft, verseIndex) => {
    const order = verseIndex + 1;

    return {
      id: `${config.id}-${order}`,
      order,
      transliteration: draft.russianPronunciation.join('\n'),
      russianPronunciation: draft.russianPronunciation.join('\n'),
      words: draft.words.map((word, wordIndex) => ({
        ...word,
        id: `${config.id}-${order}-word-${wordIndex + 1}`,
      })),
      phraseTranslations: draft.phraseTranslations,
      translation: draft.translation,
    };
  });

  return {
    id: config.id,
    slug: config.id,
    title: config.title,
    shortTitle: config.shortTitle,
    openingWords: config.openingWords,
    author,
    category: config.category,
    description: config.description,
    totalVerses: verses.length,
    verses,
    isAvailable: true,
  };
}

export const textPrayers: Prayer[] = [
  buildPrayer({
    id: 'guru-vandana',
    title: 'Шри Гуру-вандана',
    shortTitle: 'Шри-гуру-чарана-падма',
    openingWords: 'śrī-guru-caraṇa-padma',
    category: 'guru',
    description: 'Молитва о принятии прибежища у лотосных стоп духовного учителя.',
    source: guruVandanaSource,
  }),
  buildPrayer({
    id: 'gaura-arati',
    title: 'Шри Гаура-арати',
    shortTitle: 'Джая джая Горачандер',
    openingWords: 'jaya jaya gorācānder',
    category: 'gaura',
    description: 'Вечерняя песнь арати, прославляющая Господа Гаурачандру и Его спутников.',
    source: gauraAratiSource,
  }),
  buildPrayer({
    id: 'tulasi-arati',
    title: 'Туласи-арати',
    shortTitle: 'Намо намах Туласи',
    openingWords: 'namo namaḥ tulasī kṛṣṇa-preyasi',
    category: 'tulasi',
    description: 'Молитвы Шримати Туласи-деви, включая вступительную мантру и мантру обхода.',
    source: tulasiAratiSource,
  }),
  buildPrayer({
    id: 'narasimha-pranama',
    title: 'Нрисимха-пранама',
    shortTitle: 'Намас те Нарасимхая',
    openingWords: 'namas te narasiṁhāya',
    category: 'narasimha',
    description: 'Три молитвы Господу Нрисимхадеве о защите и духовном прибежище.',
    source: narasimhaPranamaSource,
    sectionWordOverrides: {
      1: [
        ['ито', 'здесь'],
        ['нрисимхах', 'Господь Нрисимха'],
        ['парато', 'там'],
        ['нрисимхо', 'Господь Нрисимха'],
        ['ято ято', 'куда бы'],
        ['ями', 'я ни пошёл'],
        ['тато', 'там'],
        ['нрисимхах', 'Господь Нрисимха'],
        ['бахир', 'снаружи'],
        ['нрисимхо', 'Господь Нрисимха'],
        ['хридайе', 'в сердце'],
        ['нрисимхо', 'Господь Нрисимха'],
        ['нрисимхам', 'Господу Нрисимхе'],
        ['адим', 'изначальному'],
        ['шаранам', 'прибежищу'],
        ['прападье', 'предаюсь'],
      ],
    },
  }),
  buildPrayer({
    id: 'jaya-radha-madhava',
    title: 'Джая Радха-Мадхава',
    shortTitle: 'Джая Радха-Мадхава',
    openingWords: 'jaya rādhā-mādhava',
    category: 'kirtan',
    description: 'Киртан о Радхе и Мадхаве и сладостных играх Кришны во Вриндаване.',
    source: jayaRadhaMadhavaSource,
    linesPerVerse: 1,
  }),
  buildPrayer({
    id: 'yasomati-nandana',
    title: 'Яшомати-нандана',
    shortTitle: 'Яшомати-нандана',
    openingWords: 'yaśomatī-nandana',
    category: 'kirtan',
    description: 'Нама-киртана, прославляющая имена, качества и игры Господа Кришны.',
    source: yasomatiNandanaSource,
    linesPerVerse: 2,
  }),
  buildPrayer({
    id: 'bhaja-bhakata-vatsala',
    title: 'Бхаджа бхаката-ватсала',
    shortTitle: 'Бхога-арати',
    openingWords: 'bhaja bhakata-vatsala',
    category: 'arati',
    description: 'Полный текст бхога-арати, описывающий подношение трапезы Господу.',
    source: bhajaBhakataVatsalaSource,
  }),
  buildPrayer({
    id: 'damodarastakam',
    title: 'Шри Дамодараштака',
    shortTitle: 'Намамишварам',
    openingWords: 'namāmīśvaraṁ sac-cid-ānanda-rūpam',
    category: 'other',
    description: 'Восемь молитв Господу Дамодаре, традиционно исполняемые в месяц Картика.',
    source: damodarastakamSource,
  }),
];
