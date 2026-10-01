import { useMemo } from 'react';
import { CheckCheck } from 'lucide-react';
import { formatDayHeading } from '../../../../shared/domain/dates';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { TaskRow } from '../../../tasks/ui/components/TaskRow';
import { TaskSection } from '../../../tasks/ui/components/TaskSection';
import { useTaskList } from '../../../tasks/ui/containers/useTaskList';
import { getTodayView } from '../../application/build-views';

export function TodayPage() {
  const { tasks, loaded, today, projectsById, prioritized, toggle, reschedule, open, add } = useTaskList();
  const view = useMemo(() => getTodayView(tasks, today), [tasks, today]);
  const empty = !view.overdue.length && !view.today.length;

  return (
    <div>
      <PageHeader title="Hoy" subtitle={formatDayHeading(today, today).replace('Hoy · ', '')} />
      {view.overdue.length > 0 && (
        <TaskSection title="Atrasadas" count={view.overdue.length} tone="danger">
          {prioritized(view.overdue).map(({ task: t, gap }) => (
            <TaskRow key={t.id} gapBefore={gap} task={t} today={today} project={projectsById.get(t.projectId)} onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
          ))}
        </TaskSection>
      )}
      {view.today.length > 0 && (
        <TaskSection title="Hoy" count={view.today.length}>
          {prioritized(view.today).map(({ task: t, gap }) => (
            <TaskRow key={t.id} gapBefore={gap} task={t} today={today} project={projectsById.get(t.projectId)} hideScheduled onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
          ))}
        </TaskSection>
      )}
      {empty && loaded && (
        <EmptyState
          icon={<CheckCheck size={40} />}
          title="Todo al día"
          hint="No tienes nada para hoy. Agrega una tarea o revisa lo que viene en Próximas."
          action={
            <button type="button" onClick={() => add({ scheduledFor: today })} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg">
              Añadir tarea
            </button>
          }
        />
      )}
    </div>
  );
}
