import { prayersSchema } from '../model/prayer.schema';
import type { Prayer } from '../model/prayer.types';
import { gurvastakam } from './gurvastakam';

const upcomingPrayer = (
  id: string,
  title: string,
  openingWords: string,
  category: Prayer['category'],
  totalVerses: number,
): Prayer => ({
  id,
  slug: id,
  title,
  openingWords,
  category,
  totalVerses,
  verses: [],
  isAvailable: false,
});

const prayerData: Prayer[] = [
  gurvastakam,
  upcomingPrayer('guru-vandana', 'Шри Гуру-вандана', 'śrī-guru-caraṇa-padma', 'guru', 3),
  upcomingPrayer('gaura-arati', 'Шри Гаура-арати', 'jaya jaya gorācānder', 'gaura', 6),
  upcomingPrayer('tulasi-arati', 'Туласи-арати', 'namo namaḥ tulasī kṛṣṇa-preyasi', 'tulasi', 4),
  upcomingPrayer('narasimha-pranama', 'Нрисимха-пранама', 'namas te narasiṁhāya', 'narasimha', 3),
  upcomingPrayer('jaya-radha-madhava', 'Джая Радха-Мадхава', 'jaya rādhā-mādhava', 'kirtan', 4),
  upcomingPrayer('yasomati-nandana', 'Яшомати-нандана', 'yaśomatī-nandana', 'kirtan', 8),
  upcomingPrayer('bhaja-bhakata-vatsala', 'Бхаджа бхаката-ватсала', 'bhaja bhakata-vatsala', 'arati', 6),
  upcomingPrayer('damodarastakam', 'Шри Дамодараштака', 'namāmīśvaraṁ sac-cid-ānanda-rūpam', 'other', 8),
];

export const prayers = import.meta.env.DEV
  ? prayersSchema.parse(prayerData)
  : prayerData;
