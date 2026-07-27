export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    community: '/users',
    me: '/users/me',
  },
  japa: {
    history: '/japa/history',
    sessions: '/japa/sessions',
    today: '/japa/today',
  },
  verses: {
    root: '/me/verses',
    item: (verseId: string) => `/me/verses/${verseId}`,
  },
  audio: {
    root: '/audio',
    file: (trackId: string) => `/audio/${trackId}/file`,
    item: (trackId: string) => `/audio/${trackId}`,
  },
  progress: {
    summary: '/progress/summary',
    calendar: '/progress/calendar',
  },
  uploads: {
    root: '/uploads',
  },
  settings: {
    root: '/settings',
  },
} as const;
