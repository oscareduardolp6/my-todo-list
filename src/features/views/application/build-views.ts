/* Casos de uso de lectura: qué tareas ver hoy, esta semana, próximamente y por
   proyecto. Son funciones puras sobre la lista de tareas — el "hoy" entra por
   parámetro para que sean deterministas.

   Regla central: una tarea "toca" el día de su fecha agendada; si no tiene
   agenda, el de su fecha límite. Así una tarea agendada el 3 con límite el 22
   aparece el 3 (y en atrasadas si no se hizo), y en cuanto la reagendas al 10
   se mueve al 10 — pero su límite del 22 sigue registrado y visible. */

import { addDays, eachDay, startOfWeek } from '../../../shared/domain/dates';
import type { DateKey, WeekStart } from '../../../shared/domain/dates';
import { compareTasks, effectiveDate, isCompleted } from '../../tasks/domain/task';
import type { Task } from '../../tasks/domain/task';

export type DayGroup = { readonly date: DateKey; readonly tasks: Task[] };

const pending = (tasks: readonly Task[]): Task[] => tasks.filter((t) => !isCompleted(t));

const byDay = (tasks: readonly Task[], days: readonly DateKey[]): DayGroup[] =>
  days.map((date) => ({
    date,
    tasks: tasks.filter((t) => effectiveDate(t) === date).sort(compareTasks),
  }));

/** Las de días anteriores a hoy, de la más vieja a la más nueva. */
const overdueOf = (tasks: readonly Task[], today: DateKey): Task[] =>
  pending(tasks)
    .filter((t) => {
      const day = effectiveDate(t);
      return day !== null && day < today;
    })
    .sort((a, b) => (effectiveDate(a) ?? '').localeCompare(effectiveDate(b) ?? '') || compareTasks(a, b));

export type TodayView = { readonly overdue: Task[]; readonly today: Task[] };

export const getTodayView = (tasks: readonly Task[], today: DateKey): TodayView => ({
  overdue: overdueOf(tasks, today),
  today: pending(tasks)
    .filter((t) => effectiveDate(t) === today)
    .sort(compareTasks),
});

export type WeekView = {
  readonly weekStart: DateKey;
  readonly weekEnd: DateKey;
  /** Solo en la semana actual: lo atrasado de días previos a hoy. */
  readonly overdue: Task[];
  readonly days: DayGroup[];
};

/** `offset`: 0 = esta semana, 1 = la siguiente, -1 = la anterior. */
export const getWeekView = (
  tasks: readonly Task[],
  today: DateKey,
  weekStartsOn: WeekStart,
  offset = 0,
): WeekView => {
  const weekStart = addDays(startOfWeek(today, weekStartsOn), offset * 7);
  const weekEnd = addDays(weekStart, 6);
  return {
    weekStart,
    weekEnd,
    overdue: offset === 0 ? overdueOf(tasks, today) : [],
    days: byDay(pending(tasks), eachDay(weekStart, weekEnd)),
  };
};

/** Todo lo agendado después de hoy, agrupado por día (solo días con tareas). */
export const getUpcomingView = (tasks: readonly Task[], today: DateKey): DayGroup[] => {
  const future = pending(tasks).filter((t) => {
    const day = effectiveDate(t);
    return day !== null && day > today;
  });
  const days = [...new Set(future.map((t) => effectiveDate(t) as DateKey))].sort();
  return byDay(future, days);
};

export type ProjectView = { readonly open: Task[]; readonly done: Task[] };

export const getProjectView = (tasks: readonly Task[], projectId: string): ProjectView => {
  const inProject = tasks.filter((t) => t.projectId === projectId);
  return {
    open: pending(inProject).sort(compareTasks),
    done: inProject
      .filter(isCompleted)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
  };
};

/** Pendientes por proyecto, para los contadores de la navegación. */
export const countPendingByProject = (tasks: readonly Task[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const t of pending(tasks)) counts[t.projectId] = (counts[t.projectId] ?? 0) + 1;
  return counts;
};
