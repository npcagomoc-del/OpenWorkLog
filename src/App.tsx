import { lazy, useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { initializeWorkspace } from './data/workspace';
import { useWorkspace } from './data/useWorkspace';
import { Appearance } from './app/Appearance';
import { ErrorBoundary } from './app/ErrorBoundary';
import { Shell } from './app/Shell';
import { Welcome } from './app/Welcome';
import { Button, EmptyState, Notice, Spinner, ToastProvider } from './components/ui';
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const TasksPage = lazy(() => import('./features/tasks/TasksPage'));
const ProjectsPage = lazy(() => import('./features/tasks/ProjectsPage'));
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage'));
const DailyPage = lazy(() => import('./features/daily/DailyPage'));
const NotesPage = lazy(() => import('./features/notes/NotesPage'));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const DesignPage = lazy(() => import('./app/DesignPage'));
function WorkspaceApp() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');
  const workspace = useWorkspace();
  useEffect(() => {
    let active = true;
    initializeWorkspace()
      .then(() => {
        if (active) setInitialized(true);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Could not open storage on this device.',
          );
      });
    return () => {
      active = false;
    };
  }, []);
  if (error)
    return (
      <main className="error-screen">
        <h1>Your workspace could not open</h1>
        <Notice tone="error">{error}</Notice>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </main>
    );
  if (!initialized || !workspace.ready) return <Spinner />;
  return (
    <>
      <Appearance settings={workspace.settings} />
      {!workspace.settings.onboardingComplete ? (
        <Welcome />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="daily" element={<DailyPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="design" element={<DesignPage />} />
              <Route
                path="*"
                element={
                  <EmptyState
                    title="This page is not here"
                    description="Return to your dashboard to pick up where you left off."
                    action={
                      <Link className="button button--primary" to="/">
                        Go to dashboard
                      </Link>
                    }
                  />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WorkspaceApp />
      </ToastProvider>
    </ErrorBoundary>
  );
}
