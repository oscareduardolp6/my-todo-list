/* Modelo de tarea y sus transiciones puras (sin IO, sin reloj: el `now` entra
   por parámetro).

   Dos fechas distintas a propósito:
   - `scheduledFor`: cuándo PIENSO hacerla. Se puede mover las veces que haga
     falta; cada cambio de una fecha ya existente suma a `rescheduleCount`.
   - `deadline`: cuándo DEBE estar hecha. Es el compromiso, no se mueve solo:
     reagendar nunca la toca.

   Ambas son opcionales y son días de calendario (`DateKey`), no instantes. */

import { E } from '../../../shared/fp';
import type { Either } from 'fp-ts/Either';
import { addDays, diffDays, isDateKey, toDateKey } from '../../../shared/domain/dates';
import type { DateKey } from '../../../shared/domain/dates';
import { validationError } from '../../../shared/domain/errors';
import type { TodoError } from '../../../shared/domain/errors';
import { INBOX_ID } from '../../projects/domain/project';
import { MAX_INTERVAL, isRecurrence, nextOccurrence } from './recurrence';
import type { Recurrence } from './recurrence';

/** 1 = urgente … 4 = normal (sin prioridad), como Todoist. */
export type Priority = 1 | 2 | 3 | 4;

export type Task = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: Priority;
  readonly projectId: string;
  readonly scheduledFor: DateKey | null;
  readonly deadline: DateKey | null;
  /** Regla de repetición; `null` = no se repite. Exige `scheduledFor`. */
  readonly recurrence: Recurrence | null;
  /** Cuántas veces se movió `scheduledFor` teniendo ya un valor. */
  readonly rescheduleCount: number;
  /** Instante de la última vez que se completó; `null` si está pendiente. */
  readonly completedAt: number | null;
  /** Día (local) en que se completó: la llave de los reportes por día. */
  readonly completedOn: DateKey | null;
  readonly createdAt: number;
  readonly updatedAt: number;
};

/** Lo que el usuario captura. Todo menos el título es opcional. */
export type NewTask = {
  readonly title: string;
  readonly description?: string;
  readonly priority?: Priority;
  readonly projectId?: string;
  readonly scheduledFor?: DateKey | null;
  readonly deadline?: DateKey | null;
  readonly recurrence?: Recurrence | null;
};

export type TaskPatch = Partial<NewTask>;

export const MAX_TITLE_LENGTH = 500;

export const PRIORITIES: readonly Priority[] = [1, 2, 3, 4];

export const isPriority = (v: unknown): v is Priority => v === 1 || v === 2 || v === 3 || v === 4;

const validateDate = (label: string, value: DateKey | null | undefined): TodoError | null =>
  value == null || isDateKey(value) ? null : validationError(`La ${label} no es una fecha válida`);

const validate = (fields: {
  title: string;
  priority: Priority;
  scheduledFor: DateKey | null;
  deadline: DateKey | null;
  recurrence: Recurrence | null;
}): TodoError | null => {
  if (!fields.title) return validationError('La tarea necesita un título');
  if (fields.title.length > MAX_TITLE_LENGTH) return validationError('El título es demasiado largo');
  if (!isPriority(fields.priority)) return validationError('La prioridad no es válida');
  if (fields.recurrence) {
    if (!isRecurrence(fields.recurrence)) return validationError(`La repetición no es válida (cada 1 a ${MAX_INTERVAL})`);
    if (fields.scheduledFor === null) return validationError('Una tarea recurrente necesita fecha agendada');
  }
  return validateDate('fecha agendada', fields.scheduledFor) ?? validateDate('fecha límite', fields.deadline);
};

export const createTask = (input: NewTask, ctx: { id: string; now: number }): Either<TodoError, Task> => {
  const task: Task = {
    id: ctx.id,
    title: input.title.trim(),
    description: (input.description ?? '').trim(),
    priority: input.priority ?? 4,
    projectId: input.projectId ?? INBOX_ID,
    scheduledFor: input.scheduledFor ?? null,
    deadline: input.deadline ?? null,
    recurrence: input.recurrence ?? null,
    rescheduleCount: 0,
    completedAt: null,
    completedOn: null,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
  const problem = validate(task);
  return problem ? E.left(problem) : E.right(task);
};

/** Aplica un cambio parcial. Si `scheduledFor` cambia de un valor a otro (o se
 *  quita), cuenta como reagendado. Asignar la primera fecha no cuenta. */
export const patchTask = (task: Task, patch: TaskPatch, now: number): Either<TodoError, Task> => {
  const scheduledFor = patch.scheduledFor === undefined ? task.scheduledFor : patch.scheduledFor;
  const rescheduled = task.scheduledFor !== null && scheduledFor !== task.scheduledFor;
  const next: Task = {
    ...task,
    title: patch.title === undefined ? task.title : patch.title.trim(),
    description: patch.description === undefined ? task.description : patch.description.trim(),
    priority: patch.priority ?? task.priority,
    projectId: patch.projectId ?? task.projectId,
    scheduledFor,
    deadline: patch.deadline === undefined ? task.deadline : patch.deadline,
    recurrence: patch.recurrence === undefined ? task.recurrence : patch.recurrence,
    rescheduleCount: task.rescheduleCount + (rescheduled ? 1 : 0),
    updatedAt: now,
  };
  const problem = validate(next);
  return problem ? E.left(problem) : E.right(next);
};

export const markCompleted = (task: Task, now: number): Task => ({
  ...task,
  completedAt: now,
  completedOn: toDateKey(now),
  updatedAt: now,
});

/** Recurrente y con fecha desde la cual calcular la siguiente. */
export const isRecurring = (task: Task): boolean => task.recurrence !== null && task.scheduledFor !== null;

/** Id de la copia histórica de una ocurrencia. Es determinista (serie + fecha
 *  agendada) para que dos dispositivos que completan la misma ocurrencia casi a
 *  la vez escriban el mismo documento en vez de duplicarla. */
export const occurrenceId = (task: Task): string => `${task.id}_${task.scheduledFor ?? 'sin-fecha'}`;

/** Mueve una recurrente a su siguiente ocurrencia: fecha agendada nueva, misma
 *  distancia hasta la fecha límite y conteo de reagendados en cero. */
export const advanceTask = (task: Task, doneOn: DateKey, now: number): Task => {
  if (!task.recurrence || !task.scheduledFor) return task;
  const scheduledFor = nextOccurrence(task.recurrence, task.scheduledFor, doneOn);
  const gap = task.deadline ? diffDays(task.scheduledFor, task.deadline) : null;
  return {
    ...task,
    scheduledFor,
    deadline: gap === null ? null : addDays(scheduledFor, gap),
    rescheduleCount: 0,
    updatedAt: now,
  };
};

/** Completar una recurrente: la tarea avanza y la ocurrencia cerrada queda como
 *  copia completada sin recurrencia (de ahí leen los reportes). */
export const completeOccurrence = (task: Task, now: number): { next: Task; done: Task } => ({
  next: advanceTask(task, toDateKey(now), now),
  done: { ...markCompleted(task, now), id: occurrenceId(task), recurrence: null },
});

export const markPending = (task: Task, now: number): Task => ({
  ...task,
  completedAt: null,
  completedOn: null,
  updatedAt: now,
});

export const isCompleted = (task: Task): boolean => task.completedAt !== null;

/** El día en que la tarea "toca": la agendada, o si no tiene, la límite. */
export const effectiveDate = (task: Task): DateKey | null => task.scheduledFor ?? task.deadline;

/** Pendiente y con día efectivo anterior a hoy. */
export const isOverdue = (task: Task, today: DateKey): boolean => {
  const day = effectiveDate(task);
  return !isCompleted(task) && day !== null && day < today;
};

/** Prioridad (1 primero), luego día efectivo (las sin fecha al final), luego antigüedad. */
export const compareTasks = (a: Task, b: Task): number => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  const da = effectiveDate(a);
  const db = effectiveDate(b);
  if (da !== db) {
    if (da === null) return 1;
    if (db === null) return -1;
    return da < db ? -1 : 1;
  }
  return a.createdAt - b.createdAt;
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'Urgente',
  2: 'Alta',
  3: 'Media',
  4: 'Normal',
};
