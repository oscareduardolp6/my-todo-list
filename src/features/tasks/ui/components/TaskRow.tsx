import { CalendarDays, Flag, RotateCw } from 'lucide-react';
import { diffDays, formatRelative } from '../../../../shared/domain/dates';
import type { DateKey } from '../../../../shared/domain/dates';
import type { Project } from '../../../projects/domain/project';
import { PRIORITY_LABELS, isCompleted } from '../../domain/task';
import type { Priority, Task } from '../../domain/task';

const PRIORITY_COLOR: Record<Priority, string> = {
  1: 'border-p1 text-p1',
  2: 'border-p2 text-p2',
  3: 'border-p3 text-p3',
  4: 'border-p4 text-p4',
};

export type TaskCheckboxProps = { checked: boolean; priority: Priority; title: string; onToggle: () => void };

export function TaskCheckbox({ checked, priority, title, onToggle }: TaskCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`${checked ? 'Reabrir' : 'Completar'}: ${title} (prioridad ${PRIORITY_LABELS[priority].toLowerCase()})`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${PRIORITY_COLOR[priority]} ${
        checked ? 'bg-current' : 'hover:bg-surface-2'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-bg" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/** Color del chip según qué tan cerca (o pasado) está el día. */
const dueTone = (day: DateKey, today: DateKey): string => {
  const delta = diffDays(today, day);
  if (delta < 0) return 'text-danger';
  if (delta === 0) return 'text-success';
  if (delta <= 2) return 'text-warn';
  return 'text-muted';
};

export type TaskRowProps = {
  task: Task;
  today: DateKey;
  /** Si se pasa, muestra el proyecto de la tarea (útil fuera de la vista del proyecto). */
  project?: Project;
  /** Oculta el chip de fecha agendada cuando el día ya está en el encabezado de la sección. */
  hideScheduled?: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

export function TaskRow({ task, today, project, hideScheduled, onToggle, onOpen }: TaskRowProps) {
  const done = isCompleted(task);
  const showScheduled = task.scheduledFor !== null && !hideScheduled;
  return (
    <li className="group flex gap-3 border-b border-border px-1 py-3">
      <TaskCheckbox checked={done} priority={task.priority} title={task.title} onToggle={onToggle} />
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className={`text-[15px] leading-snug ${done ? 'text-faint line-through' : ''}`}>{task.title}</p>
        {task.description && <p className="mt-0.5 line-clamp-2 text-sm text-muted">{task.description}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {showScheduled && task.scheduledFor && (
            <span className={`inline-flex items-center gap-1 ${done ? 'text-faint' : dueTone(task.scheduledFor, today)}`}>
              <CalendarDays size={12} />
              {formatRelative(task.scheduledFor, today)}
            </span>
          )}
          {task.deadline && (
            <span
              title="Fecha límite"
              className={`inline-flex items-center gap-1 ${done ? 'text-faint' : dueTone(task.deadline, today)}`}
            >
              <Flag size={12} />
              Límite {formatRelative(task.deadline, today)}
            </span>
          )}
          {task.rescheduleCount > 0 && (
            <span title={`Reagendada ${task.rescheduleCount} ${task.rescheduleCount === 1 ? 'vez' : 'veces'}`} className="inline-flex items-center gap-1 text-faint">
              <RotateCw size={11} />
              {task.rescheduleCount}
            </span>
          )}
          {project && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              {project.name}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}
