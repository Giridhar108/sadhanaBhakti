import type { Prayer, PrayerVerse, PrayerWord } from '../model/prayer.types';
import gurvastakamSource from '../../../shared/assets/Шри_Шри_Гурв-аштака.txt?raw';

type PrayerWordSource = readonly [
  original: string,
  pronunciation: string,
  translation: string,
];

type PrayerVerseSource = {
  order: number;
  transliteration: string[];
  russianPronunciation: string[];
  words: PrayerWordSource[];
  translation: string;
  explanation?: string;
};

const buildWord = (
  verseOrder: number,
  wordIndex: number,
  source: PrayerWordSource,
): PrayerWord => ({
  id: `gurvastakam-${verseOrder}-word-${wordIndex + 1}`,
  original: source[0],
  pronunciation: source[1],
  translation: source[2],
});

const buildVerse = (source: PrayerVerseSource): PrayerVerse => ({
  id: `gurvastakam-${source.order}`,
  order: source.order,
  transliteration: source.transliteration.join('\n'),
  russianPronunciation: source.russianPronunciation.join('\n'),
  words: source.words.map((word, wordIndex) => buildWord(source.order, wordIndex, word)),
  translation: source.translation,
  explanation: source.explanation,
});

const getSourceBlock = (
  value: string,
  startMarker: string,
  endMarker?: string,
) => {
  const startIndex = value.indexOf(startMarker);
  if (startIndex < 0) return '';

  const contentStart = startIndex + startMarker.length;
  const endIndex = endMarker
    ? value.indexOf(endMarker, contentStart)
    : value.length;

  return value
    .slice(contentStart, endIndex < 0 ? value.length : endIndex)
    .trim();
};

const parseSourceWords = (value: string): PrayerWordSource[] => value
  .split(/\r?\n/)
  .map((line) => line.trim().replace(/[.;]$/, ''))
  .filter(Boolean)
  .map((line) => {
    const [pronunciation, ...translationParts] = line.split(' — ');
    const translation = translationParts.join(' — ');

    return [
      pronunciation,
      pronunciation,
      translation,
    ] satisfies PrayerWordSource;
  })
  .filter((word) => Boolean(word[0] && word[2]));

const sourceSections = gurvastakamSource
  .split(/(?=ТЕКСТ \d+\r?\n)/)
  .filter((section) => section.startsWith('ТЕКСТ '));

const verseSources: PrayerVerseSource[] = [
  {
    order: 1,
    transliteration: [
      'saṁsāra-dāvānala-līḍha-loka-',
      'trāṇāya kāruṇya-ghanāghanatvam',
      'prāptasya kalyāṇa-guṇārṇavasya',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [
      'самсара-даванала-лидха-лока-',
      'транайа карунйа-гханагханатвам',
      'праптасйа калйана-гунарнавасйа',
      'ванде гурох шри-чаранаравиндам',
    ],
    words: [
      ['saṁsāra', 'самсара', 'материальное существование'],
      ['dāva-anala', 'дава-анала', 'лесной пожар'],
      ['līḍha', 'лидха', 'охваченный, пожираемый'],
      ['loka', 'лока', 'мир, живые существа'],
      ['trāṇāya', 'транайа', 'ради спасения'],
      ['kāruṇya', 'карунйа', 'милости, сострадания'],
      ['ghana-aghanatvam', 'гхана-агханатвам', 'состояние густой дождевой тучи'],
      ['prāptasya', 'праптасйа', 'обретшего'],
      ['kalyāṇa', 'калйана', 'благоприятных'],
      ['guṇa', 'гуна', 'качеств'],
      ['arṇavasya', 'арнавасйа', 'океана'],
      ['vande', 'ванде', 'я поклоняюсь'],
      ['guroḥ', 'гурох', 'духовного учителя'],
      ['śrī-caraṇa-aravindam', 'шри-чарана-аравиндам', 'прекрасным лотосным стопам'],
    ],
    translation:
      'Духовный учитель, подобно туче, проливающей дождь милости, гасит лесной пожар материального существования и спасает людей, охваченных его пламенем. Он — океан благоприятных качеств. Я в глубоком почтении склоняюсь к лотосным стопам моего духовного учителя.',
    explanation:
      'Образ лесного пожара передаёт беспокойство материального мира, а дождевое облако — бескорыстную милость духовного учителя.',
  },
  {
    order: 2,
    transliteration: [
      'mahāprabhoḥ kīrtana-nṛtya-gīta-',
      'vāditra-mādyan-manaso rasena',
      'romāñca-kampāśru-taraṅga-bhājo',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 3,
    transliteration: [
      'śrī-vigrahārādhana-nitya-nānā-',
      'śṛṅgāra-tan-mandira-mārjanādau',
      'yuktasya bhaktāṁś ca niyuñjato ’pi',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 4,
    transliteration: [
      'catur-vidha-śrī-bhagavat-prasāda-',
      'svādv-anna-tṛptān hari-bhakta-saṅghān',
      'kṛtvaiva tṛptiṁ bhajataḥ sadaiva',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 5,
    transliteration: [
      'śrī-rādhikā-mādhavayor apāra-',
      'mādhurya-līlā-guṇa-rūpa-nāmnām',
      'prati-kṣaṇāsvādana-lolupasya',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 6,
    transliteration: [
      'nikuñja-yūno rati-keli-siddhyai',
      'yā yālibhir yuktir apekṣaṇīyā',
      'tatrāti-dākṣyād ati-vallabhasya',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 7,
    transliteration: [
      'sākṣād-dharitvena samasta-śāstrair',
      'uktas tathā bhāvyata eva sadbhiḥ',
      'kintu prabhor yaḥ priya eva tasya',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
  {
    order: 8,
    transliteration: [
      'yasya prasādād bhagavat-prasādo',
      'yasyāprasādān na gatiḥ kuto ’pi',
      'dhyāyan stuvaṁs tasya yaśas tri-sandhyaṁ',
      'vande guroḥ śrī-caraṇāravindam',
    ],
    russianPronunciation: [],
    words: [],
    translation: '',
  },
];

const hydratedVerseSources = verseSources.map((verseSource, verseIndex) => {
  if (verseIndex === 0) return verseSource;

  const sourceSection = sourceSections[verseIndex];
  if (!sourceSection) return verseSource;

  const russianPronunciation = getSourceBlock(
    sourceSection,
    'Санскрит русскими буквами:',
    'Пословный перевод:',
  ).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const words = parseSourceWords(getSourceBlock(
    sourceSection,
    'Пословный перевод:',
    'Литературный перевод:',
  ));
  const translation = getSourceBlock(
    sourceSection,
    'Литературный перевод:',
  ).replace(/\s+/g, ' ');

  return {
    ...verseSource,
    russianPronunciation,
    words,
    translation,
  };
});

export const gurvastakam: Prayer = {
  id: 'gurvastakam',
  slug: 'gurvastakam',
  title: 'Шри Шри Гурв-аштака',
  shortTitle: 'Самсара-даванала',
  openingWords: 'saṁsāra-dāvānala-līḍha-loka',
  author: 'Шрила Вишванатха Чакраварти Тхакур',
  category: 'guru',
  description:
    'Восемь молитв духовному учителю. Традиционно исполняются во время мангала-арати.',
  totalVerses: 8,
  isAvailable: true,
  verses: hydratedVerseSources.map(buildVerse),
};
