import oneRoundAudioUrl from '../../../shared/assets/audio/А.Ч. Бхактиведанта Свами Шрила Прабхупада - Джапа - 1 круг (108).mp3';
import vrindavanJapaAudioUrl from '../../../shared/assets/audio/Шрила Прабхупада - Вриндаванская Джапа.mp3';
import sevenRoundsAudioUrl from '../../../shared/assets/audio/Шрила Прабхупада - Совместная джапа 7 кругов (1круг=6,5мин!).mp3';
import type { AudioTrack } from './types';

export const maxUserAudioTracks = 3;
export const maxUserAudioFileSize = 50 * 1024 * 1024;

export const defaultAudioTracks: AudioTrack[] = [
  {
    id: 'default-prabhupada-one-round',
    title: 'Джапа Шрилы Прабхупады — 1 круг',
    subtitle: '108 повторений маха-мантры',
    fileUrl: oneRoundAudioUrl,
    originalName: 'Джапа — 1 круг (108).mp3',
    mimeType: 'audio/mpeg',
    size: 4_221_069,
    createdAt: '1970-01-01T00:00:00.000Z',
    isDefault: true,
  },
  {
    id: 'default-prabhupada-vrindavan-japa',
    title: 'Вриндаванская джапа',
    subtitle: 'Шрила Прабхупада',
    fileUrl: vrindavanJapaAudioUrl,
    originalName: 'Шрила Прабхупада — Вриндаванская джапа.mp3',
    mimeType: 'audio/mpeg',
    size: 19_261_315,
    createdAt: '1970-01-01T00:00:00.000Z',
    isDefault: true,
  },
  {
    id: 'default-prabhupada-seven-rounds',
    title: 'Совместная джапа — 7 кругов',
    subtitle: 'Шрила Прабхупада · один круг около 6,5 минут',
    fileUrl: sevenRoundsAudioUrl,
    originalName: 'Шрила Прабхупада — Совместная джапа 7 кругов.mp3',
    mimeType: 'audio/mpeg',
    size: 68_932_631,
    createdAt: '1970-01-01T00:00:00.000Z',
    isDefault: true,
  },
];
