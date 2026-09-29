/* Caso de uso de lectura: el reporte de qué tareas se resolvieron qué días.

   Se apoya en `completedOn` (el día local en que se marcó como hecha), no en
   la fecha agendada: lo que cuenta es cuándo se HIZO, aunque se haya movido
   diez veces antes. */

import { addDays, diffDays, eachDay } from '../../../shared/domain/dates';
import type { DateKey } from '../../../shared/domain/dates';
import type { Task } from '../../tasks/domain/task';

export type ReportPreset = '7d' | '30d' | 'month' | 'custom';

export type DateRange = { readonly from: DateKey; readonly to: DateKey };

export type ReportDay = { readonly date: DateKey; readonly tasks: Task[] };

export type CompletionReport = {
  readonly range: DateRange;
  readonly total: number;
  readonly averagePerDay: number;
  /** Días del rango con al menos una tarea completada. */
  readonly activeDays: number;
  /** Completadas que tenían fecha límite / de esas, cuántas se hicieron a tiempo. */
  readonly withDeadline: number;
  readonly onTime: number;
  readonly byProject: { readonly projectId: string; readonly count: number }[];
  /** Todos los días del rango, del más viejo al más nuevo (los vacíos incluidos). */
  readonly days: ReportDay[];
};

/** Tope para que un rango absurdo no genere miles de días. */
export const MAX_RANGE_DAYS = 366;

export const rangeFor = (preset: Exclude<ReportPreset, 'custom'>, today: DateKey): DateRange => {
  switch (preset) {
    case '7d':
      return { from: addDays(today, -6), to: today };
    case '30d':
      return { from: addDays(today, -29), to: today };
    case 'month':
      return { from: `${today.slice(0, 7)}-01`, to: today };
  }
};

/** Ordena los extremos y recorta a `MAX_RANGE_DAYS`. */
export const normalizeRange = (range: DateRange): DateRange => {
  const [from, to] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from];
  return diffDays(from, to) >= MAX_RANGE_DAYS ? { from: addDays(to, -(MAX_RANGE_DAYS - 1)), to } : { from, to };
};

export const buildCompletionReport = (tasks: readonly Task[], rawRange: DateRange): CompletionReport => {
  const range = normalizeRange(rawRange);
  const done = tasks.filter(
    (t): t is Task & { completedOn: DateKey } =>
      t.completedOn !== null && t.completedOn >= range.from && t.completedOn <= range.to,
  );

  const days: ReportDay[] = eachDay(range.from, range.to).map((date) => ({
    date,
    tasks: done.filter((t) => t.completedOn === date).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
  }));

  const withDeadline = done.filter((t) => t.deadline !== null);
  const counts = new Map<string, number>();
  for (const t of done) counts.set(t.projectId, (counts.get(t.projectId) ?? 0) + 1);

  return {
    range,
    total: done.length,
    averagePerDay: days.length ? done.length / days.length : 0,
    activeDays: days.filter((d) => d.tasks.length > 0).length,
    withDeadline: withDeadline.length,
    onTime: withDeadline.filter((t) => t.deadline !== null && t.completedOn <= t.deadline).length,
    byProject: [...counts.entries()]
      .map(([projectId, count]) => ({ projectId, count }))
      .sort((a, b) => b.count - a.count),
    days,
  };
};
