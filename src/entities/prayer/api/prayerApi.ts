import { prayers } from '../data/prayers.mock';

export const prayerApi = {
  getAll: () => Promise.resolve(prayers),
};
