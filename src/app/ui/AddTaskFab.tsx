import { Plus } from 'lucide-react';
import type { Route } from '../router';
import { useAppStore } from '../store-context';

/** Botón flotante de añadir tarea (móvil y escritorio), como en Todoist. */
export function AddTaskFab({ route }: { route: Route }) {
  const today = useAppStore((s) => s.today);
  const openTaskEditor = useAppStore((s) => s.openTaskEditor);

  return (
    <button
      type="button"
      aria-label="Añadir tarea"
      onClick={() => openTaskEditor({ mode: 'new', defaults: route.name === 'project' ? { projectId: route.id } : route.name === 'today' ? { scheduledFor: today } : {} })}
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg lg:bottom-8 lg:right-8"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Plus size={26} />
    </button>
  );
}
