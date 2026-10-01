import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatDayHeading, formatShort } from '../../../../shared/domain/dates';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { TaskRow } from '../../../tasks/ui/components/TaskRow';
import { TaskSection } from '../../../tasks/ui/components/TaskSection';
import { useTaskList } from '../../../tasks/ui/containers/useTaskList';
import { getWeekView } from '../../application/build-views';

export function WeekPage() {
  const { tasks, today, weekStartsOn, projectsById, prioritized, toggle, reschedule, open, add } = useTaskList();
  const [offset, setOffset] = useState(0);
  const view = useMemo(() => getWeekView(tasks, today, weekStartsOn, offset), [tasks, today, weekStartsOn, offset]);

  const navButton = 'rounded-lg border border-border p-2 text-muted hover:bg-surface-2';

  return (
    <div>
      <PageHeader
        title="Semana"
        subtitle={`${formatShort(view.weekStart, today)} – ${formatShort(view.weekEnd, today)}`}
        actions={
          <>
            <button type="button" aria-label="Semana anterior" onClick={() => setOffset((o) => o - 1)} className={navButton}>
              <ChevronLeft size={16} />
            </button>
            {offset !== 0 && (
              <button type="button" onClick={() => setOffset(0)} className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface-2">
                Esta semana
              </button>
            )}
            <button type="button" aria-label="Semana siguiente" onClick={() => setOffset((o) => o + 1)} className={navButton}>
              <ChevronRight size={16} />
            </button>
          </>
        }
      />
      {view.overdue.length > 0 && (
        <TaskSection title="Atrasadas" count={view.overdue.length} tone="danger">
          {prioritized(view.overdue).map(({ task: t, gap }) => (
            <TaskRow key={t.id} gapBefore={gap} task={t} today={today} project={projectsById.get(t.projectId)} onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
          ))}
        </TaskSection>
      )}
      {view.days.map((day) => (
        <TaskSection
          key={day.date}
          title={formatDayHeading(day.date, today)}
          count={day.tasks.length || undefined}
          action={
            <button
              type="button"
              aria-label={`Añadir tarea el ${day.date}`}
              onClick={() => add({ scheduledFor: day.date })}
              className="rounded-md p-1 text-faint hover:bg-surface-2 hover:text-fg"
            >
              <Plus size={15} />
            </button>
          }
        >
          {prioritized(day.tasks).map(({ task: t, gap }) => (
            <TaskRow key={t.id} gapBefore={gap} task={t} today={today} project={projectsById.get(t.projectId)} hideScheduled onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
          ))}
          {!day.tasks.length && <li className="py-2 text-xs text-faint">Sin tareas</li>}
        </TaskSection>
      ))}
    </div>
  );
}
