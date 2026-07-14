import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../shared/ui/Icon/Icon';
import ShrilaPrabhupada from '../../../shared/assets/images/ShrilaPrabhupada.png';
import authLotus from '../../../shared/assets/images/authLotus.png';
import authTeaserBooks from '../../../shared/assets/images/auth-teaser-books.png';
import authTeaserJapa from '../../../shared/assets/images/auth-teaser-japa.png';
import authTeaserVerses from '../../../shared/assets/images/auth-teaser-verses.png';
import lotusSoft from '../../../shared/assets/images/lotus-logo1.png';
import sadhanaBhakti from '../../../shared/assets/images/sadhanaBhakti.png';
import { practiceCards } from '../model/authPageModel';
import styles from './AuthShared.module.css';

export type LineIconName = 'user' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'login' | 'shield' | 'arrow' | 'check';

export function LineIcon({ name }: { name: LineIconName }) {
  const paths: Record<LineIconName, ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    mail: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    lock: (
      <>
        <rect x="5.5" y="10" width="13" height="10" rx="2.5" />
        <path d="M8.5 10V7.7a3.5 3.5 0 0 1 7 0V10" />
        <path d="M12 14v2.2" />
      </>
    ),
    eye: (
      <>
        <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
        <circle cx="12" cy="12" r="2.4" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m4 4 16 16" />
        <path d="M9.5 6.6A9.8 9.8 0 0 1 12 6c5.5 0 8.5 6 8.5 6a13 13 0 0 1-2.1 2.8" />
        <path d="M14.2 14.2A3 3 0 0 1 9.8 9.8" />
        <path d="M6.4 8.4A13.4 13.4 0 0 0 3.5 12s3 6 8.5 6a9.8 9.8 0 0 0 3.6-.7" />
      </>
    ),
    login: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3.5" />
        <path d="M13.5 4.5H19a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-5.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3.5 19 6v5.4c0 4.2-2.8 7.2-7 9.1-4.2-1.9-7-4.9-7-9.1V6l7-2.5Z" />
        <path d="M10 12.3 11.4 14 15 9.8" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
  };

  return (
    <svg className={styles.lineIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function LogoMark({ large = false }: { large?: boolean }) {
  return (
    <span className={`${styles.logoMark} ${large ? styles.largeLogo : ''}`}>
      <img src={ShrilaPrabhupada} alt="" aria-hidden="true" />
    </span>
  );
}

export function FeatureIcon({ tone, icon }: { tone: 'green' | 'violet' | 'gold'; icon: 'mala' | 'book' | 'scroll' }) {
  return (
    <span className={`${styles.featureIcon} ${styles[tone]}`}>
      <Icon name={icon} />
    </span>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <small className={styles.errorText}>{message}</small> : null;
}

export function DividerLotus({ spacing = 'default' }: { spacing?: 'default' | 'login' | 'register' }) {
  return (
    <div className={`${styles.divider} ${styles[`${spacing}Divider`]}`} aria-hidden="true">
      <span />
      <Icon name="lotus" />
      <span />
    </div>
  );
}

const teaserImages = [authTeaserJapa, authTeaserBooks, authTeaserVerses];

export function LeftPanel() {
  return (
    <section className={styles.leftPanel} aria-label="О проекте">
      <div className={styles.brand}>
        <img className={styles.brandImage} src={sadhanaBhakti} alt="Садхана Бхакти" />
      </div>

      <div className={styles.heroCopy}>
        <h1>
          Легкий контроль <br />
          своей <span>садханы</span>
        </h1>
        <p>
          Приложение Садхана Бхакти помогает отслеживать джапу, чтение книг, изучение стихов и ежедневный прогресс.
          Все твои достижения в одном месте, чтобы ты мог сосредоточиться на самом главном.
        </p>
      </div>

      <figure className={styles.quote}>
        <img src={lotusSoft} alt="" aria-hidden="true" />
        <span aria-hidden="true">“</span>
        <blockquote>
          Соблюдая требования к чистоте, которые я установил в Движении сознания Кришны, вы обретёте реальную
          духовную силу, необходимую для проповеди. Просто не отступайте от этих принципов, и тогда весь мир станет
          уважать вас и наша проповедническая деятельность будет успешной.
        </blockquote>
      </figure>

      <div className={styles.teasers}>
        {practiceCards.map((practice, index) => (
          <article key={practice.id}>
            <img className={styles.teaserImage} src={teaserImages[index]} alt={`${practice.title}. ${practice.description}`} />
          </article>
        ))}
      </div>

      <img className={styles.heroLotus} src={authLotus} alt="" aria-hidden="true" />
    </section>
  );
}

export function Stepper({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  const steps = [
    { step: 1, href: '/auth/onboarding/name' },
    { step: 2, href: '/auth/onboarding/practices' },
    { step: 3, href: '/auth/onboarding/goals' },
  ] as const;

  return (
    <div className={styles.stepper} aria-label={`Шаг ${activeStep} из 3`}>
      {steps.map(({ step, href }) => (
        <span className={styles.stepItem} key={step}>
          <Link
            className={step === activeStep ? styles.activeStep : ''}
            to={href}
            aria-current={step === activeStep ? 'step' : undefined}
            aria-label={`Перейти к шагу ${step}`}
          >
            {step}
          </Link>
        </span>
      ))}
    </div>
  );
}
