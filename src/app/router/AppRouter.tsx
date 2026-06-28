import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

function RouteFallback() {
  return (
    <div className={styles.fallback}>
      <span />
      <p>Загрузка практики...</p>
    </div>
  );
}

function RoutedContent() {
  const location = useLocation();
  const legacyPreview = new URLSearchParams(location.search).get('preview') === 'components';

  if (legacyPreview) {
    return <ComponentsPreviewPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/components" element={<ComponentsPreviewPage />} />
      <Route path="/japa" element={<MyJapaPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/verses" element={<VersesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
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
