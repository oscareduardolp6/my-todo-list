import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { navigate } from '../../../../app/router';
import { useAppStore } from '../../../../app/store-context';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { countPendingByProject } from '../../../views/application/build-views';
import { withInbox } from '../../domain/project';

/** Lista de proyectos; en móvil es la puerta de entrada a ellos (no hay sidebar). */
export function ProjectsPage() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);
  const openProjectEditor = useAppStore((s) => s.openProjectEditor);
  const all = useMemo(() => withInbox(projects), [projects]);
  const counts = useMemo(() => countPendingByProject(tasks), [tasks]);

  return (
    <div>
      <PageHeader
        title="Proyectos"
        actions={
          <button
            type="button"
            onClick={() => openProjectEditor({ mode: 'new' })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg"
          >
            <Plus size={16} /> Nuevo
          </button>
        }
      />
      <ul className="overflow-hidden rounded-xl border border-border bg-surface">
        {all.map((p) => (
          <li key={p.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => navigate({ name: 'project', id: p.id })}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2"
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="flex-1">{p.name}</span>
              <span className="text-sm text-faint">{counts[p.id] ?? 0}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
