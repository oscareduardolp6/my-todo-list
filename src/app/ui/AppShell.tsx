import { ProjectEditorContainer } from '../../features/projects/ui/containers/ProjectEditorContainer';
import { ProjectPage } from '../../features/projects/ui/containers/ProjectPage';
import { ProjectsPage } from '../../features/projects/ui/containers/ProjectsPage';
import { ReportsPage } from '../../features/reports/ui/containers/ReportsPage';
import { SettingsPage } from '../../features/settings/ui/containers/SettingsPage';
import { RescheduleContainer } from '../../features/tasks/ui/containers/RescheduleContainer';
import { SearchContainer } from '../../features/tasks/ui/containers/SearchContainer';
import { TaskEditorContainer } from '../../features/tasks/ui/containers/TaskEditorContainer';
import { TodayPage } from '../../features/views/ui/containers/TodayPage';
import { UpcomingPage } from '../../features/views/ui/containers/UpcomingPage';
import { WeekPage } from '../../features/views/ui/containers/WeekPage';
import { ToastStack } from '../../shared/ui/ToastStack';
import { useRoute } from '../router';
import type { Route } from '../router';
import { useAppStore } from '../store-context';
import { AddTaskFab } from './AddTaskFab';
import { SearchFab } from './SearchFab';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useApplyTheme } from './useApplyTheme';

function ActivePage({ route }: { route: Route }) {
  switch (route.name) {
    case 'today':
      return <TodayPage />;
    case 'week':
      return <WeekPage />;
    case 'upcoming':
      return <UpcomingPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'project':
      return <ProjectPage projectId={route.id} />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
  }
}

/** Un solo layout responsivo: sidebar en escritorio, barra inferior en móvil.
 *  Las hojas (editor de tarea/proyecto) y los toasts se montan siempre y cada
 *  container decide si le toca pintarse. */
export function AppShell() {
  const route = useRoute();
  const settings = useAppStore((s) => s.settings);
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  useApplyTheme(settings);

  return (
    <div className="flex h-full">
      <Sidebar route={route} />
      <main className="h-full flex-1 overflow-y-auto">
        {/* Padding inferior: que la barra y el botón flotante no tapen lo último de la lista. */}
        <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
          <ActivePage route={route} />
        </div>
      </main>
      <BottomNav route={route} />
      <SearchFab />
      <AddTaskFab route={route} />
      <TaskEditorContainer />
      <RescheduleContainer />
      <SearchContainer />
      <ProjectEditorContainer />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
