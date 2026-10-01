import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, Flag, Repeat, RotateCw, SkipForward, Trash2, X } from 'lucide-react';
import { addDays, formatShort } from '../../../../shared/domain/dates';
import type { DateKey, WeekStart } from '../../../../shared/domain/dates';
import type { Project } from '../../../projects/domain/project';
import { quickDates } from '../../domain/quick-dates';
import { MAX_INTERVAL } from '../../domain/recurrence';
import type { Recurrence, RecurrenceFrequency, RecurrenceMode } from '../../domain/recurrence';
import { PRIORITIES, PRIORITY_LABELS, isRecurring } from '../../domain/task';
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
  /** Solo en recurrentes: saltar esta ocurrencia sin borrar la serie. */
  onSkip?: () => void;
};

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency | 'none'; label: string }[] = [
  { value: 'none', label: 'No se repite' },
  { value: 'daily', label: 'Días' },
  { value: 'weekly', label: 'Semanas' },
  { value: 'monthly', label: 'Meses' },
  { value: 'yearly', label: 'Años' },
];

/** Lunes primero; el valor es el día de la semana (0 = domingo). */
const WEEKDAY_CHIPS: { value: number; label: string }[] = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];
const WEEKDAY_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

export function TaskForm({ task, defaults, projects, today, weekStartsOn, onSubmit, onCancel, onDelete, onSkip }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? defaults?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? defaults?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? defaults?.priority ?? 4);
  const [projectId, setProjectId] = useState(task?.projectId ?? defaults?.projectId ?? projects[0]?.id ?? 'inbox');
  const [scheduledFor, setScheduledFor] = useState<DateKey | null>(task?.scheduledFor ?? defaults?.scheduledFor ?? null);
  const [deadline, setDeadline] = useState<DateKey | null>(task?.deadline ?? defaults?.deadline ?? null);

  const initialRecurrence = task ? task.recurrence : (defaults?.recurrence ?? null);
  const [frequency, setFrequency] = useState<RecurrenceFrequency | 'none'>(initialRecurrence?.frequency ?? 'none');
  const [interval, setInterval] = useState(String(initialRecurrence?.interval ?? 1));
  const [weekdays, setWeekdays] = useState<readonly number[]>(initialRecurrence?.weekdays ?? []);
  const [mode, setMode] = useState<RecurrenceMode>(initialRecurrence?.mode ?? 'fixed');

  const intervalNumber = Number(interval);
  const intervalValid = Number.isInteger(intervalNumber) && intervalNumber >= 1 && intervalNumber <= MAX_INTERVAL;
  const repeats = frequency !== 'none';
  const recurrence: Recurrence | null = repeats
    ? {
        frequency,
        interval: intervalValid ? intervalNumber : 1,
        weekdays: frequency === 'weekly' && mode === 'fixed' ? weekdays : [],
        mode,
      }
    : null;
  const needsDate = repeats && scheduledFor === null;
  const canSubmit = title.trim() !== '' && !needsDate && (!repeats || intervalValid);

  const toggleWeekday = (day: number) =>
    setWeekdays((cur) => (cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day]));


  const lateForDeadline = scheduledFor !== null && deadline !== null && scheduledFor > deadline;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title, description, priority, projectId, scheduledFor, deadline, recurrence });
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
          {quickDates(today, weekStartsOn).map((q) => (
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
        <Label>Repetir</Label>
        <div className="flex items-center gap-2">
          {repeats && <span className="text-sm text-muted">Cada</span>}
          {repeats && (
            <input
              type="number"
              min={1}
              max={MAX_INTERVAL}
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              aria-label="Cada cuántas unidades"
              className={`${inputClass} w-20`}
            />
          )}
          <div className="relative flex-1">
            <Repeat size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency | 'none')}
              aria-label="Repetir"
              className={`${inputClass} pl-9`}
            >
              {FREQUENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {repeats && (
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex gap-1.5" role="group" aria-label="Modo de repetición">
              <Chip active={mode === 'fixed'} onClick={() => setMode('fixed')}>
                Fecha fija
              </Chip>
              <Chip active={mode === 'afterCompletion'} onClick={() => setMode('afterCompletion')}>
                Después de completar
              </Chip>
            </div>
            {frequency === 'weekly' && mode === 'fixed' && (
              <div className="flex gap-1.5" role="group" aria-label="Días de la semana">
                {WEEKDAY_CHIPS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={weekdays.includes(d.value)}
                    aria-label={WEEKDAY_FULL[d.value]}
                    onClick={() => toggleWeekday(d.value)}
                    className={`h-8 w-8 rounded-full border text-xs ${
                      weekdays.includes(d.value)
                        ? 'border-accent bg-accent text-accent-fg'
                        : 'border-border text-muted hover:bg-surface-2'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-faint">
              {needsDate ? (
                <span className="text-warn">Una tarea recurrente necesita fecha agendada.</span>
              ) : mode === 'fixed' ? (
                'La siguiente sale del calendario, sin importar cuándo la completes.'
              ) : (
                'La siguiente se cuenta desde el día en que la completes.'
              )}
            </p>
          </div>
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
        {onSkip && task && isRecurring(task) && (
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs text-muted hover:bg-surface-2"
          >
            <SkipForward size={14} /> Omitir esta vez
          </button>
        )}
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
          disabled={!canSubmit}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-40"
        >
          {task ? 'Guardar' : 'Añadir tarea'}
        </button>
      </div>
    </form>
  );
}
