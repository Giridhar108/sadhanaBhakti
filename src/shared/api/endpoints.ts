export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    me: '/users/me',
  },
  japa: {
    sessions: '/japa/sessions',
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
