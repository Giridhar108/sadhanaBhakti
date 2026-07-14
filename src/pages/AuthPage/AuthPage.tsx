import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  completeOnboarding,
  defaultGoals,
  defaultPractices,
  loginWithEmail,
  readAuthDraft,
  startEmailRegistration,
  writeAuthDraft,
} from '../../entities/user/model/auth';
import type { AuthGoals, AuthPractice } from '../../entities/user/model/types';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import {
  DividerLotus,
  FeatureIcon,
  FieldError,
  LeftPanel,
  LineIcon,
  LogoMark,
  Stepper,
} from './components/AuthShared';
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

function WelcomeView() {
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

function LoginView() {
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

  const onSubmit = async (data: LoginForm) => {
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

    const loginResult = await loginWithEmail(result.data);

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

      <DividerLotus />

      <p className={styles.switchLine}>
        Нет аккаунта? <Link to="/auth/register">Создать аккаунт</Link>
      </p>
    </>
  );
}

function RegisterView() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');
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
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field === 'name' || field === 'email' || field === 'password' || field === 'confirmPassword') {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    const registerResult = await startEmailRegistration(result.data);

    if (!registerResult.ok) {
      setFormMessage(registerResult.message);
      return;
    }

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

        <label className={`${styles.field} ${errors.confirmPassword ? styles.invalid : ''}`}>
          <LineIcon name="lock" />
          <input type={showPassword ? 'text' : 'password'} placeholder="Повтори пароль" {...register('confirmPassword')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}>
            <LineIcon name={showPassword ? 'eyeOff' : 'eye'} />
          </button>
        </label>
        <FieldError message={errors.confirmPassword?.message} />

        {formMessage ? <p className={styles.formMessage}>{formMessage}</p> : null}

        <button className={styles.primaryButton} type="submit">
          <Icon name="lotus" />
          Начать практику
        </button>
      </form>

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
  const [formMessage, setFormMessage] = useState('');

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
    void completeOnboarding().then((result) => {
      if (!result.ok) {
        setFormMessage(result.message);
        return;
      }

      navigate('/');
    });
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

      {formMessage ? <p className={styles.formMessage}>{formMessage}</p> : null}

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

  return (
    <main className={`${styles.page} auth-page`}>
      <LeftPanel />

      <section className={`${styles.card} ${styles[view]}`} aria-label="Регистрация и вход">
        {view === 'welcome' ? <WelcomeView /> : null}
        {view === 'login' ? <LoginView /> : null}
        {view === 'register' ? <RegisterView /> : null}
        {view === 'name' ? <NameStepView /> : null}
        {view === 'practices' ? <PracticeStepView /> : null}
        {view === 'goals' ? <GoalStepView /> : null}
      </section>
    </main>
  );
}
