import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, Flag, RotateCw, Trash2, X } from 'lucide-react';
import { addDays, formatShort, nextSaturday, startOfNextWeek } from '../../../../shared/domain/dates';
import type { DateKey, WeekStart } from '../../../../shared/domain/dates';
import type { Project } from '../../../projects/domain/project';
import { PRIORITIES, PRIORITY_LABELS } from '../../domain/task';
import type { NewTask, Priority, Task } from '../../domain/task';

export type TaskFormValues = Required<NewTask>;

export type TaskFormProps = {
  /** Tarea que se edita; `undefined` = alta. */
  task?: Task;
  /** Valores iniciales de un alta (proyecto o fecha según la vista desde donde se abrió). */
  defaults?: Partial<NewTask>;
  projects: readonly Project[];
  today: DateKey;
  weekStartsOn: WeekStart;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

const PRIORITY_TEXT: Record<Priority, string> = { 1: 'text-p1', 2: 'text-p2', 3: 'text-p3', 4: 'text-p4' };

const inputClass =
  'w-full rounded-lg border border-border bg-bg px-3 py-2 text-[15px] placeholder:text-faint focus:border-accent focus:outline-none';

function Label({ children }: { children: string }) {
  return <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-faint">{children}</span>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs ${
        active ? 'border-accent bg-accent text-accent-fg' : 'border-border text-muted hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  );
}

export function TaskForm({ task, defaults, projects, today, weekStartsOn, onSubmit, onCancel, onDelete }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? defaults?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? defaults?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? defaults?.priority ?? 4);
  const [projectId, setProjectId] = useState(task?.projectId ?? defaults?.projectId ?? projects[0]?.id ?? 'inbox');
  const [scheduledFor, setScheduledFor] = useState<DateKey | null>(task?.scheduledFor ?? defaults?.scheduledFor ?? null);
  const [deadline, setDeadline] = useState<DateKey | null>(task?.deadline ?? defaults?.deadline ?? null);

  const quickDates: { label: string; value: DateKey | null }[] = [
    { label: 'Hoy', value: today },
    { label: 'Mañana', value: addDays(today, 1) },
    { label: 'Fin de semana', value: nextSaturday(today) },
    { label: 'Próx. semana', value: startOfNextWeek(today, weekStartsOn) },
    { label: 'Sin fecha', value: null },
  ];

  const lateForDeadline = scheduledFor !== null && deadline !== null && scheduledFor > deadline;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, priority, projectId, scheduledFor, deadline });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          aria-label="Título"
          maxLength={500}
          className={`${inputClass} text-base font-medium`}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          aria-label="Descripción"
          rows={3}
          className={`${inputClass} mt-2 resize-y text-sm`}
        />
      </div>

      <div>
        <Label>Prioridad</Label>
        <div className="flex gap-2" role="radiogroup" aria-label="Prioridad">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={priority === p}
              onClick={() => setPriority(p)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs ${
                priority === p ? 'border-accent bg-surface-2' : 'border-border hover:bg-surface-2'
              } ${PRIORITY_TEXT[p]}`}
            >
              <Flag size={13} fill={priority === p ? 'currentColor' : 'none'} />
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label>
          <Label>Proyecto</Label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <Label>Agendada para</Label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickDates.map((q) => (
            <Chip key={q.label} active={scheduledFor === q.value} onClick={() => setScheduledFor(q.value)}>
              {q.label}
            </Chip>
          ))}
        </div>
        <div className="relative">
          <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="date"
            value={scheduledFor ?? ''}
            onChange={(e) => setScheduledFor(e.target.value || null)}
            aria-label="Fecha agendada"
            className={`${inputClass} pl-9`}
          />
        </div>
        {task && task.rescheduleCount > 0 && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-faint">
            <RotateCw size={11} /> Reagendada {task.rescheduleCount} {task.rescheduleCount === 1 ? 'vez' : 'veces'}
          </p>
        )}
      </div>

      <div>
        <Label>Fecha límite</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Flag size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="date"
              value={deadline ?? ''}
              onChange={(e) => setDeadline(e.target.value || null)}
              aria-label="Fecha límite"
              className={`${inputClass} pl-9`}
            />
          </div>
          {deadline && (
            <button
              type="button"
              onClick={() => setDeadline(null)}
              aria-label="Quitar fecha límite"
              className="rounded-lg border border-border px-3 text-muted hover:bg-surface-2"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-xs text-faint">
          {lateForDeadline && deadline ? (
            <span className="text-warn">La fecha agendada es posterior al límite ({formatShort(deadline, today)}).</span>
          ) : (
            'Reagendar nunca mueve la fecha límite.'
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Eliminar tarea"
            className="rounded-lg border border-border p-2.5 text-danger hover:bg-surface-2"
          >
            <Trash2 size={17} />
          </button>
        )}
        <div className="flex-1" />
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm text-muted hover:bg-surface-2">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-40"
        >
          {task ? 'Guardar' : 'Añadir tarea'}
        </button>
      </div>
    </form>
  );
}
