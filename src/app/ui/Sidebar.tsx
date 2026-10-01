import { useMemo } from 'react';
import { Keyboard, Plus, Search } from 'lucide-react';
import { navigate } from '../router';
import type { Route } from '../router';
import { useAppStore } from '../store-context';
import { countPendingByProject, getTodayView } from '../../features/views/application/build-views';
import { withInbox } from '../../features/projects/domain/project';
import { REPORTS_NAV, SETTINGS_NAV, TIME_NAV, isNavActive } from './nav';
import type { NavItem } from './nav';

const linkClass = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
    active ? 'bg-surface-2 font-medium text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'
  }`;

/** Navegación de escritorio (≥ 1024px). En móvil se usa `BottomNav`. */
export function Sidebar({ route }: { route: Route }) {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const today = useAppStore((s) => s.today);
  const openProjectEditor = useAppStore((s) => s.openProjectEditor);
  const openSearch = useAppStore((s) => s.openSearch);
  const openShortcuts = useAppStore((s) => s.openShortcuts);

  const counts = useMemo(() => countPendingByProject(tasks), [tasks]);
  const todayView = useMemo(() => getTodayView(tasks, today), [tasks, today]);
  const todayCount = todayView.overdue.length + todayView.today.length;
  const all = useMemo(() => withInbox(projects), [projects]);

  const renderNav = (item: NavItem, badge?: number) => (
    <button key={item.label} type="button" onClick={() => navigate(item.route)} className={linkClass(isNavActive(item, route))} aria-current={isNavActive(item, route) ? 'page' : undefined}>
      <item.icon size={17} />
      <span className="flex-1 text-left">{item.label}</span>
      {badge ? <span className="text-xs text-faint">{badge}</span> : null}
    </button>
  );

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-surface p-3 lg:flex">
      <button type="button" onClick={openSearch} className={`${linkClass(false)} mb-2`}>
        <Search size={17} />
        <span className="flex-1 text-left">Buscar</span>
        <kbd className="rounded border border-border px-1.5 text-[10px] text-faint">/</kbd>
      </button>
      {TIME_NAV.map((item) => renderNav(item, item.route.name === 'today' ? todayCount : undefined))}

      <div className="mb-1 mt-5 flex items-center justify-between px-3">
        <span className="text-xs font-medium uppercase tracking-wide text-faint">Proyectos</span>
        <button type="button" aria-label="Nuevo proyecto" onClick={() => openProjectEditor({ mode: 'new' })} className="rounded p-1 text-faint hover:bg-surface-2 hover:text-fg">
          <Plus size={14} />
        </button>
      </div>
      {all.map((p) => {
        const active = route.name === 'project' && route.id === p.id;
        return (
          <button key={p.id} type="button" onClick={() => navigate({ name: 'project', id: p.id })} className={linkClass(active)} aria-current={active ? 'page' : undefined}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="flex-1 truncate text-left">{p.name}</span>
            {counts[p.id] ? <span className="text-xs text-faint">{counts[p.id]}</span> : null}
          </button>
        );
      })}

      <div className="mt-auto flex flex-col gap-1 pt-4">
        <button type="button" onClick={openShortcuts} className={linkClass(false)}>
          <Keyboard size={17} />
          <span className="flex-1 text-left">Atajos de teclado</span>
          <kbd className="rounded border border-border px-1.5 text-[10px] text-faint">?</kbd>
        </button>
        {renderNav(REPORTS_NAV)}
        {renderNav(SETTINGS_NAV)}
      </div>
    </aside>
  );
}
