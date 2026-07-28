import { useQuery } from '@tanstack/react-query';
import { prayerApi } from '../api/prayerApi';

export const usePrayers = () => useQuery({
  queryKey: ['prayers'],
  queryFn: prayerApi.getAll,
});
