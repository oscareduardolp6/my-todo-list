import { Plus } from 'lucide-react';
import { navigate } from '../router';
import type { Route } from '../router';
import { useAppStore } from '../store-context';
import { BOTTOM_NAV, isNavActive } from './nav';

/** Barra inferior + botón flotante de añadir (móvil). En escritorio no se pinta. */
export function BottomNav({ route }: { route: Route }) {
  const today = useAppStore((s) => s.today);
  const openTaskEditor = useAppStore((s) => s.openTaskEditor);

  return (
    <>
      <button
        type="button"
        aria-label="Añadir tarea"
        onClick={() => openTaskEditor({ mode: 'new', defaults: route.name === 'project' ? { projectId: route.id } : route.name === 'today' ? { scheduledFor: today } : {} })}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg lg:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus size={26} />
      </button>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface lg:hidden" aria-label="Navegación principal">
        {BOTTOM_NAV.map((item) => {
          const active = isNavActive(item, route);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.route)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${active ? 'text-accent' : 'text-muted'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
