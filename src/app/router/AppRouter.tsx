import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/useUiStore';
import { loadAuthSession, readAuthUser, subscribeToAuthUserChange } from '../../entities/user/model/auth';
import { AppShell } from '../layout/AppShell';
import styles from './AppRouter.module.css';

const DashboardPage = lazy(() =>
  import('../../pages/DashboardPage/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const ComponentsPreviewPage = lazy(() =>
  import('../../pages/ComponentsPreviewPage/ComponentsPreviewPage').then((module) => ({
    default: module.ComponentsPreviewPage,
  })),
);
const MyJapaPage = lazy(() => import('../../pages/MyJapaPage/MyJapaPage'));
const BooksPage = lazy(() => import('../../pages/BooksPage/BooksPage'));
const VersesPage = lazy(() => import('../../pages/VersesPage/VersesPage'));
const CalendarPage = lazy(() => import('../../pages/CalendarPage/CalendarPage'));
const StatisticsPage = lazy(() => import('../../pages/StatisticsPage/StatisticsPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage/ProfilePage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage/SettingsPage'));
const AuthPage = lazy(() => import('../../pages/AuthPage/AuthPage'));

const appPreviewStorageKey = 'sadhana-app-preview';

function RouteFallback() {
  return (
    <div className={styles.fallback}>
      <span />
      <p>Загрузка практики...</p>
    </div>
  );
}

function isLocalPreviewHost() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function readAppPreviewFlag() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.sessionStorage.getItem(appPreviewStorageKey) === '1';
}

function RoutedContent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const previewMode = searchParams.get('preview');
  const legacyPreview = previewMode === 'components';
  const canUseAppPreview = import.meta.env.DEV || isLocalPreviewHost();
  const requestedAppPreview = previewMode === 'app' && canUseAppPreview;
  const appPreview = requestedAppPreview || (previewMode !== 'off' && canUseAppPreview && readAppPreviewFlag());
  const [authUser, setAuthUser] = useState(() => readAuthUser());
  const [isCheckingSession, setIsCheckingSession] = useState(!legacyPreview && !appPreview);
  const setTheme = useUiStore((state) => state.setTheme);
  const isAuthRoute = location.pathname.startsWith('/auth') || location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (requestedAppPreview) {
        window.sessionStorage.setItem(appPreviewStorageKey, '1');
      } else if (previewMode === 'off') {
        window.sessionStorage.removeItem(appPreviewStorageKey);
      }
    }
  }, [previewMode, requestedAppPreview]);

  useEffect(() => {
    if (legacyPreview || appPreview) {
      setIsCheckingSession(false);
      return undefined;
    }

    let isActive = true;

    void loadAuthSession()
      .then((user) => {
        if (isActive) {
          setAuthUser(user);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [appPreview, legacyPreview]);

  useEffect(() => subscribeToAuthUserChange(() => setAuthUser(readAuthUser())), []);

  useEffect(() => {
    if (authUser?.settings.theme) {
      setTheme(authUser.settings.theme);
    }
  }, [authUser?.settings.theme, setTheme]);

  if (isCheckingSession) {
    return <RouteFallback />;
  }

  if (legacyPreview) {
    return <Navigate to="/components" replace />;
  }

  if (!appPreview && !authUser?.isOnboarded && !isAuthRoute) {
    return <Navigate to="/auth/register" replace />;
  }

  if (!appPreview && authUser?.isOnboarded && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/components" element={<ComponentsPreviewPage />} />
        <Route path="/japa" element={<MyJapaPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/verses" element={<VersesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/login" element={<AuthPage />} />
      <Route path="/auth/register" element={<AuthPage />} />
      <Route path="/auth/onboarding" element={<Navigate to="/auth/onboarding/name" replace />} />
      <Route path="/auth/onboarding/name" element={<AuthPage />} />
      <Route path="/auth/onboarding/practices" element={<AuthPage />} />
      <Route path="/auth/onboarding/goals" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <RoutedContent />
      </Suspense>
    </BrowserRouter>
  );
}
