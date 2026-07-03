import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import lotusLogo from '../../shared/assets/images/lotus-logo.png';
import authLotus from '../../shared/assets/images/authLotus.png';
import lotusSoft from '../../shared/assets/images/lotus-soft.png';
import {
  completeOnboarding,
  defaultGoals,
  defaultPractices,
  loginWithEmail,
  readAuthDraft,
  startEmailRegistration,
  startGoogleRegistration,
  writeAuthDraft,
} from '../../entities/user/model/auth';
import type { AuthGoals, AuthPractice } from '../../entities/user/model/types';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import {
  getAuthView,
  goalCards,
  loginSchema,
  nameSchema,
  practiceCards,
  registerSchema,
  viewTitles,
  type LoginForm,
  type NameForm,
  type RegisterForm,
} from './model/authPageModel';
import styles from './AuthPage.module.css';

type LineIconName = 'user' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'login' | 'shield' | 'arrow' | 'check';

function LineIcon({ name }: { name: LineIconName }) {
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

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`${styles.logoMark} ${compact ? styles.compactLogo : ''}`}>
      <img src={lotusLogo} alt="" aria-hidden="true" />
    </span>
  );
}

function FeatureIcon({ tone, icon }: { tone: 'green' | 'violet' | 'gold'; icon: 'mala' | 'book' | 'scroll' }) {
  return (
    <span className={`${styles.featureIcon} ${styles[tone]}`}>
      <Icon name={icon} />
    </span>
  );
}

function LeftPanel() {
  return (
    <section className={styles.leftPanel} aria-label="О проекте">
      <div className={styles.brand}>
        <LogoMark compact />
        <span>Садхана Бхакти</span>
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
          О дорогой ум, оставь гордость, обман и придирчивость. Давай вместе искать счастье
          в любовном служении и духовной практике.
        </blockquote>
      </figure>

      <div className={styles.teasers}>
        {practiceCards.map((practice) => (
          <article key={practice.id}>
            <FeatureIcon icon={practice.icon} tone={practice.tone} />
            <div>
              <strong>{practice.title}</strong>
              <p>{practice.description}</p>
            </div>
          </article>
        ))}
      </div>

      <img className={styles.heroLotus} src={authLotus} alt="" aria-hidden="true" />
    </section>
  );
}

function Stepper({ activeStep }: { activeStep: 1 | 2 | 3 }) {
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

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.googleButton} type="button" onClick={onClick}>
      <span className={styles.googleMark}>G</span>
      Продолжить с Google
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <small className={styles.errorText}>{message}</small> : null;
}

function DividerLotus() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <span />
      <Icon name="lotus" />
      <span />
    </div>
  );
}

function WelcomeView({ onGoogle }: { onGoogle: () => void }) {
  return (
    <>
      <LogoMark />
      <div className={styles.cardHeading}>
        <h2>Добро пожаловать <span aria-hidden="true">🌺</span></h2>
        <p>Создай аккаунт или войди, чтобы сохранить свой прогресс и продолжить Садхана Бхакти.</p>
      </div>

      <div className={styles.actionStack}>
        <Link className={styles.primaryButton} to="/auth/register">
          <LineIcon name="user" />
          Создать аккаунт
        </Link>
        <Link className={styles.outlineButton} to="/auth/login">
          <LineIcon name="login" />
          У меня уже есть аккаунт
        </Link>
        <GoogleButton onClick={onGoogle} />
      </div>

      <DividerLotus />

      <div className={styles.privacyNote}>
        <span>
          <LineIcon name="shield" />
        </span>
        <p>
          Мы уважаем твою приватность.
          <br />
          Твоё пространство практики — в безопасности и спокойствии.
        </p>
      </div>

      <div className={styles.policyLinks}>
        <a href="#terms">Условия</a>
        <span aria-hidden="true">•</span>
        <a href="#privacy">Конфиденциальность</a>
      </div>
    </>
  );
}

function LoginView({ onGoogle }: { onGoogle: () => void }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: readAuthDraft().email ?? '',
      password: '',
    },
  });

  const onSubmit = (data: LoginForm) => {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    const loginResult = loginWithEmail(result.data);

    if (!loginResult.ok) {
      setFormMessage(loginResult.message);
      return;
    }

    navigate('/');
  };

  return (
    <>
      <LogoMark />
      <div className={styles.cardHeading}>
        <h2>С возвращением <span aria-hidden="true">🌺</span></h2>
        <p>Войди, чтобы продолжить свою практику и сохранить прогресс.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className={`${styles.field} ${errors.email ? styles.invalid : ''}`}>
          <LineIcon name="mail" />
          <input type="email" placeholder="Email" {...register('email')} />
        </label>
        <FieldError message={errors.email?.message} />

        <label className={`${styles.field} ${errors.password ? styles.invalid : ''}`}>
          <LineIcon name="lock" />
          <input type={showPassword ? 'text' : 'password'} placeholder="Пароль" {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
            <LineIcon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </label>
        <FieldError message={errors.password?.message} />

        <div className={styles.formTools}>
          <label>
            <input type="checkbox" />
            <span>Запомнить меня</span>
          </label>
          <button type="button">Забыли пароль?</button>
        </div>

        {formMessage ? <p className={styles.formMessage}>{formMessage}</p> : null}

        <button className={styles.primaryButton} type="submit">
          Войти
        </button>
      </form>

      <GoogleButton onClick={onGoogle} />
      <DividerLotus />

      <p className={styles.switchLine}>
        Нет аккаунта? <Link to="/auth/register">Создать аккаунт</Link>
      </p>
    </>
  );
}

function RegisterView({ onGoogle }: { onGoogle: () => void }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      name: readAuthDraft().name ?? '',
      email: readAuthDraft().email ?? '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterForm) => {
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === 'name' || field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    startEmailRegistration(result.data);
    navigate('/auth/onboarding/name');
  };

  return (
    <>
      <LogoMark />
      <div className={styles.cardHeading}>
        <h2>Создай аккаунт</h2>
        <p>Зарегистрируйся, чтобы сохранять свой прогресс и начать Садхана Бхакти.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className={`${styles.field} ${errors.name ? styles.invalid : ''}`}>
          <LineIcon name="user" />
          <input placeholder="Имя" {...register('name')} />
        </label>
        <FieldError message={errors.name?.message} />

        <label className={`${styles.field} ${errors.email ? styles.invalid : ''}`}>
          <LineIcon name="mail" />
          <input type="email" placeholder="Email" {...register('email')} />
        </label>
        <FieldError message={errors.email?.message} />

        <label className={`${styles.field} ${errors.password ? styles.invalid : ''}`}>
          <LineIcon name="lock" />
          <input type={showPassword ? 'text' : 'password'} placeholder="Пароль" {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
            <LineIcon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </label>
        {errors.password?.message ? (
          <FieldError message={errors.password.message} />
        ) : (
          <small className={styles.hintText}>Минимум 8 символов</small>
        )}

        <button className={styles.primaryButton} type="submit">
          <Icon name="lotus" />
          Начать практику
        </button>
      </form>

      <GoogleButton onClick={onGoogle} />
      <DividerLotus />

      <div className={styles.privacyNote}>
        <span>
          <LineIcon name="shield" />
        </span>
        <p>
          Регистрируясь, ты принимаешь <a href="#terms">Условия использования</a>
          <br />и <a href="#privacy">Политику конфиденциальности</a>.
        </p>
      </div>

      <p className={styles.switchLine}>
        Уже есть аккаунт? <Link to="/auth/login">Войти</Link>
      </p>
    </>
  );
}

function NameStepView() {
  const navigate = useNavigate();
  const draft = readAuthDraft();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<NameForm>({
    defaultValues: {
      name: draft.name ?? '',
      spiritualName: draft.spiritualName ?? '',
    },
  });

  const onSubmit = (data: NameForm) => {
    const result = nameSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === 'name' || field === 'spiritualName') {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    writeAuthDraft(result.data);
    navigate('/auth/onboarding/practices');
  };

  return (
    <>
      <LogoMark />
      <Stepper activeStep={1} />
      <div className={styles.cardHeading}>
        <span>Шаг 1 из 3</span>
        <h2>Как тебя называть?</h2>
        <p>Заполни профиль, чтобы пространство практики было персональным.</p>
      </div>

      <form className={`${styles.form} ${styles.stepForm}`} onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className={`${styles.simpleField} ${errors.name ? styles.invalid : ''}`}>
          <input placeholder="Имя" {...register('name')} />
        </label>
        <FieldError message={errors.name?.message} />

        <label className={`${styles.simpleField} ${errors.spiritualName ? styles.invalid : ''}`}>
          <input placeholder="Духовное имя (необязательно)" {...register('spiritualName')} />
        </label>
        <FieldError message={errors.spiritualName?.message} />

        <div className={styles.stepActions}>
          <Link className={styles.backButton} to="/auth/register">
            Назад
          </Link>
          <button className={styles.primaryButton} type="submit">
            Продолжить
          </button>
        </div>
      </form>
    </>
  );
}

function PracticeStepView() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AuthPractice[]>(() => readAuthDraft().practices ?? defaultPractices);

  const togglePractice = (practice: AuthPractice) => {
    setSelected((current) =>
      current.includes(practice)
        ? current.filter((item) => item !== practice)
        : [...current, practice],
    );
  };

  const onContinue = () => {
    writeAuthDraft({ practices: selected });
    navigate('/auth/onboarding/goals');
  };

  return (
    <>
      <LogoMark />
      <Stepper activeStep={2} />
      <div className={styles.cardHeading}>
        <span>Шаг 2 из 3</span>
        <h2>Что хочешь отслеживать?</h2>
        <p>Выбери практики, которые будут на твоём главном экране.</p>
      </div>

      <div className={styles.practiceList}>
        {practiceCards.map((practice) => {
          const isSelected = selected.includes(practice.id);

          return (
            <button
              className={`${styles.practiceOption} ${isSelected ? styles.selectedPractice : ''}`}
              type="button"
              key={practice.id}
              onClick={() => togglePractice(practice.id)}
            >
              <FeatureIcon icon={practice.icon} tone={practice.tone} />
              <span>
                <strong>{practice.title}</strong>
                <small>{practice.description}</small>
              </span>
              <i aria-hidden="true">
                <LineIcon name="check" />
              </i>
            </button>
          );
        })}
      </div>

      <div className={styles.stepActions}>
        <Link className={styles.backButton} to="/auth/onboarding/name">
          Назад
        </Link>
        <button className={styles.primaryButton} type="button" onClick={onContinue} disabled={selected.length === 0}>
          Продолжить
        </button>
      </div>
    </>
  );
}

function GoalStepView() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<AuthGoals>(() => readAuthDraft().goals ?? defaultGoals);

  const changeGoal = (key: keyof AuthGoals, delta: number, min: number, max: number) => {
    setGoals((current) => {
      const nextValue = Math.min(max, Math.max(min, current[key] + delta));

      return {
        ...current,
        [key]: nextValue,
      };
    });
  };

  const finishOnboarding = (nextGoals: AuthGoals) => {
    writeAuthDraft({ goals: nextGoals });
    completeOnboarding();
    navigate('/');
  };

  return (
    <>
      <LogoMark />
      <Stepper activeStep={3} />
      <div className={styles.cardHeading}>
        <span>Шаг 3 из 3</span>
        <h2>Поставь мягкие цели</h2>
        <p>Ты всегда сможешь изменить их позже в настройках практики.</p>
      </div>

      <div className={styles.goalList}>
        {goalCards.map((goal) => (
          <article className={styles.goalOption} key={goal.key}>
            <FeatureIcon icon={goal.icon} tone={goal.tone} />
            <div className={styles.goalTitle}>
              <strong>{goal.title}</strong>
              <span>{goal.label}</span>
            </div>
            <button type="button" onClick={() => changeGoal(goal.key, -goal.step, goal.min, goal.max)} aria-label={`Уменьшить ${goal.title}`}>
              −
            </button>
            <div className={styles.goalValue}>
              <strong>{goals[goal.key]}</strong>
              <span>{goal.unit}</span>
            </div>
            <button type="button" onClick={() => changeGoal(goal.key, goal.step, goal.min, goal.max)} aria-label={`Увеличить ${goal.title}`}>
              +
            </button>
          </article>
        ))}
      </div>

      <div className={styles.finishActions}>
        <button className={styles.skipButton} type="button" onClick={() => finishOnboarding(defaultGoals)}>
          Настрою позже
        </button>
        <button className={styles.primaryButton} type="button" onClick={() => finishOnboarding(goals)}>
          Перейти к практике
          <LineIcon name="arrow" />
        </button>
      </div>
    </>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const view = useMemo(() => getAuthView(location.pathname), [location.pathname]);

  useDocumentTitle(viewTitles[view]);

  const onGoogle = () => {
    startGoogleRegistration();
    navigate('/auth/onboarding/name');
  };

  return (
    <main className={`${styles.page} auth-page`}>
      <LeftPanel />

      <section className={`${styles.card} ${styles[view]}`} aria-label="Регистрация и вход">
        {view === 'welcome' ? <WelcomeView onGoogle={onGoogle} /> : null}
        {view === 'login' ? <LoginView onGoogle={onGoogle} /> : null}
        {view === 'register' ? <RegisterView onGoogle={onGoogle} /> : null}
        {view === 'name' ? <NameStepView /> : null}
        {view === 'practices' ? <PracticeStepView /> : null}
        {view === 'goals' ? <GoalStepView /> : null}
      </section>
    </main>
  );
}
