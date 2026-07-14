import styles from './Icon.module.css';
import type { ReactNode } from 'react';

export type IconName =
  | 'home'
  | 'mala'
  | 'book'
  | 'calendar'
  | 'chart'
  | 'users'
  | 'bell'
  | 'settings'
  | 'search'
  | 'chevron'
  | 'more'
  | 'plus'
  | 'target'
  | 'scroll'
  | 'clock'
  | 'music'
  | 'lotus';

type IconProps = {
  name: IconName;
  className?: string;
  title?: string;
};

const paths: Record<IconName, ReactNode> = {
  home: <><path d="M4 11.5 12 4l8 7.5" /><path d="M6.5 10.5V20h11v-9.5" /><path d="M10 20v-5h4v5" /></>,
  mala: <><path d="M12 4c3.2 2.1 5.7 5.3 5.7 9.1a5.7 5.7 0 0 1-11.4 0C6.3 9.3 8.8 6.1 12 4Z" /><path d="M9 13c.8 1.4 1.8 2.2 3 2.2s2.2-.8 3-2.2" /><path d="M12 3v3" /></>,
  book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5Z" /><path d="M5 5.5v16" /><path d="M8 7h8" /><path d="M8 10h7" /></>,
  calendar: <><path d="M6 4v3" /><path d="M18 4v3" /><path d="M4 8h16" /><rect x="4" y="6" width="16" height="15" rx="3" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /><path d="M8 16h.01" /><path d="M12 16h.01" /></>,
  chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /><path d="M18 6h-4" /><path d="M18 6v4" /></>,
  users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M20 20v-1.4a3 3 0 0 0-2.3-2.9" /><path d="M16 5.2a3 3 0 0 1 0 5.6" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></>,
  settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9c.3.6.9 1 1.5 1h.1a2 2 0 1 1 0 4h-.1c-.6 0-1.2.4-1.5 1Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3" /><path d="M22 12h-3" /><path d="M12 22v-3" /><path d="M2 12h3" /></>,
  scroll: <><path d="M8 4h8a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" /><path d="M8 8h7" /><path d="M8 12h8" /><path d="M8 16h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  lotus: <><path d="M12 5c2.4 2.1 3.6 4.2 3.6 6.3S14.4 15.4 12 17c-2.4-1.6-3.6-3.5-3.6-5.7S9.6 7.1 12 5Z" /><path d="M7.6 9.2C4.8 9.7 3 11 2.5 13.2c1.7.6 3.6.6 5.4 0" /><path d="M16.4 9.2c2.8.5 4.6 1.8 5.1 4-1.7.6-3.6.6-5.4 0" /><path d="M5 17c4.4 2.2 9.6 2.2 14 0" /></>,
};

export function Icon({ name, className, title }: IconProps) {
  return (
    <svg className={`${styles.icon} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
