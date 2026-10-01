import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { formatDayHeading } from '../../../../shared/domain/dates';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { TaskRow } from '../../../tasks/ui/components/TaskRow';
import { TaskSection } from '../../../tasks/ui/components/TaskSection';
import { useTaskList } from '../../../tasks/ui/containers/useTaskList';
import { getUpcomingView } from '../../application/build-views';

export function UpcomingPage() {
  const { tasks, loaded, today, projectsById, prioritized, toggle, reschedule, open } = useTaskList();
  const groups = useMemo(() => getUpcomingView(tasks, today), [tasks, today]);

  return (
    <div>
      <PageHeader title="Próximas" subtitle="Todo lo que viene, día por día" />
      {groups.map((g) => (
        <TaskSection key={g.date} title={formatDayHeading(g.date, today)} count={g.tasks.length}>
          {prioritized(g.tasks).map(({ task: t, gap }) => (
            <TaskRow key={t.id} gapBefore={gap} task={t} today={today} project={projectsById.get(t.projectId)} hideScheduled onToggle={() => toggle(t)} onOpen={() => open(t)} onReschedule={() => reschedule(t)} />
          ))}
        </TaskSection>
      ))}
      {!groups.length && loaded && (
        <EmptyState icon={<CalendarClock size={40} />} title="Nada agendado" hint="Las tareas con fecha agendada o fecha límite futura aparecen aquí." />
      )}
    </div>
  );
}
