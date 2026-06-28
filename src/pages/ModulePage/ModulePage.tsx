import { type ReactNode } from 'react';
import { Header } from '../../widgets/Header/Header';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './ModulePage.module.css';

type Metric = {
  label: string;
  value: string;
  tone?: 'violet' | 'green' | 'gold';
};

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Metric[];
  children: ReactNode;
  aside?: ReactNode;
};

export function ModulePage({ eyebrow, title, description, metrics, children, aside }: ModulePageProps) {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.page}>
        <Header />
        <section className={styles.hero}>
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className={styles.metrics} aria-label="Ключевые показатели">
            {metrics.map((metric) => (
              <article className={`${styles.metric} ${styles[metric.tone ?? 'violet']}`} key={metric.label}>
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.grid}>
          <section className={styles.content}>{children}</section>
          {aside ? <aside className={styles.aside}>{aside}</aside> : null}
        </div>
      </main>
    </div>
  );
}
