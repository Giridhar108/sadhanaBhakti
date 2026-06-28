import type { PropsWithChildren } from 'react';
import styles from './Card.module.css';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return <section className={`${styles.card} ${className ?? ''}`}>{children}</section>;
}
