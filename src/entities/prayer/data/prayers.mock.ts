import { prayersSchema } from '../model/prayer.schema';
import type { Prayer } from '../model/prayer.types';
import { gurvastakam } from './gurvastakam';
import { textPrayers } from './textPrayers';

const prayerData: Prayer[] = [
  gurvastakam,
  ...textPrayers,
];

export const prayers = import.meta.env.DEV
  ? prayersSchema.parse(prayerData)
  : prayerData;
