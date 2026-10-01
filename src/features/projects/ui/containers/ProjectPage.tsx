import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Pencil } from 'lucide-react';
import { useAppStore } from '../../../../app/store-context';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { getProjectView } from '../../../views/application/build-views';
import { TaskRow } from '../../../tasks/ui/components/TaskRow';
import { TaskSection } from '../../../tasks/ui/components/TaskSection';
import { useTaskList } from '../../../tasks/ui/containers/useTaskList';
import { INBOX_ID } from '../../domain/project';

export function ProjectPage({ projectId }: { projectId: string }) {
  const { tasks, loaded, today, projectsById, prioritized, toggle, reschedule, open, add } = useTaskList();
  const openProjectEditor = useAppStore((s) => s.openProjectEditor);
  const [showDone, setShowDone] = useState(false);
  const project = projectsById.get(projectId);
  const view = useMemo(() => getProjectView(tasks, projectId), [tasks, projectId]);

  if (!project) {
    // Solo pasa si el proyecto se borró (aquí o en otro dispositivo) o el hash es inválido.
    return loaded ? (
      <EmptyState icon={<FolderOpen size={40} />} title="Este proyecto ya no existe" hint="Elige otro desde el menú." />
    ) : null;
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        subtitle={`${view.open.length} pendientes`}
        actions={
          projectId !== INBOX_ID && (
            <button
              type="button"
              aria-label="Editar proyecto"
              onClick={() => openProjectEditor({ mode: 'edit', projectId })}
              className="rounded-lg border border-border p-2 text-muted hover:bg-surface-2"
            >
              <Pencil size={16} />
            </button>
          )
        }
      />
      <TaskSection title="Pendientes" count={view.open.length}>
        {prioritized(view.open).map(({ task: t, gap }) => (
          <TaskRow key={t.id} gapBefore={gap} task={t} today={today} onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
        ))}
        {!view.open.length && loaded && <li className="py-6 text-center text-sm text-muted">Nada pendiente aquí.</li>}
      </TaskSection>
      <button type="button" onClick={() => add({ projectId })} className="mb-6 text-sm font-medium text-accent">
        + Añadir tarea
      </button>
      {view.done.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowDone((v) => !v)} className="mb-1 flex items-center gap-1 text-sm text-muted">
            {showDone ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            Completadas ({view.done.length})
          </button>
          {showDone && (
            <ul>
              {view.done.map((t) => (
                <TaskRow key={t.id} task={t} today={today} onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
