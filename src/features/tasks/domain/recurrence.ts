/* Regla de recurrencia y cálculo de la siguiente fecha (puro, sin IO).

   Dos modos:
   - `fixed`: la serie sale del calendario ("cada lunes", "cada 15"). La
     siguiente ocurrencia es la primera POSTERIOR a hoy y a la fecha agendada,
     así una tarea atrasada no genera otra atrasada.
   - `afterCompletion`: se cuenta desde el día en que se completó
     ("3 días después de hacerla"); la fecha agendada original no importa.

   Todo trabaja con `DateKey` (días de calendario), nunca con horas. */

import { addDays, addMonths, diffDays, startOfWeek, weekdayOf } from '../../../shared/domain/dates';
import type { DateKey } from '../../../shared/domain/dates';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurrenceMode = 'fixed' | 'afterCompletion';

export type Recurrence = {
  readonly frequency: RecurrenceFrequency;
  /** Cada cuántas unidades (cada 2 semanas → 2). Entero ≥ 1. */
  readonly interval: number;
  /** Solo `weekly` + `fixed`: días de la semana (0 = domingo … 6 = sábado).
   *  Vacío = el día de la semana de la fecha agendada. */
  readonly weekdays: readonly number[];
  readonly mode: RecurrenceMode;
};

export const MAX_INTERVAL = 999;

export const FREQUENCIES: readonly RecurrenceFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export const isRecurrence = (v: unknown): v is Recurrence => {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    FREQUENCIES.includes(r.frequency as RecurrenceFrequency) &&
    Number.isInteger(r.interval) &&
    (r.interval as number) >= 1 &&
    (r.interval as number) <= MAX_INTERVAL &&
    Array.isArray(r.weekdays) &&
    r.weekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    (r.mode === 'fixed' || r.mode === 'afterCompletion')
  );
};

/** Lee un valor de Firestore; cualquier cosa rara equivale a "no se repite". */
export const parseRecurrence = (v: unknown): Recurrence | null => (isRecurrence(v) ? v : null);

const monthsPerStep = (r: Recurrence): number => (r.frequency === 'yearly' ? 12 : 1) * r.interval;

const afterCompletion = (r: Recurrence, completedOn: DateKey): DateKey => {
  switch (r.frequency) {
    case 'daily':
      return addDays(completedOn, r.interval);
    case 'weekly':
      return addDays(completedOn, 7 * r.interval);
    default:
      return addMonths(completedOn, monthsPerStep(r));
  }
};

const fixed = (r: Recurrence, anchor: DateKey, bound: DateKey): DateKey => {
  switch (r.frequency) {
    case 'daily':
      return addDays(anchor, (Math.floor(diffDays(anchor, bound) / r.interval) + 1) * r.interval);
    case 'weekly': {
      const weekdays = r.weekdays.length > 0 ? r.weekdays : [weekdayOf(anchor)];
      const firstWeek = startOfWeek(anchor, 1);
      for (let d = addDays(bound, 1); ; d = addDays(d, 1)) {
        const weeksApart = diffDays(firstWeek, startOfWeek(d, 1)) / 7;
        if (weekdays.includes(weekdayOf(d)) && weeksApart % r.interval === 0) return d;
      }
    }
    default: {
      const step = monthsPerStep(r);
      let next = addMonths(anchor, step);
      for (let k = 2; next <= bound; k++) next = addMonths(anchor, k * step);
      return next;
    }
  }
};

/** La siguiente fecha agendada de la serie. `scheduledFor` es la ocurrencia que
 *  se acaba de cerrar y `completedOn` el día en que se cerró. */
export const nextOccurrence = (r: Recurrence, scheduledFor: DateKey, completedOn: DateKey): DateKey =>
  r.mode === 'afterCompletion'
    ? afterCompletion(r, completedOn)
    : fixed(r, scheduledFor, completedOn > scheduledFor ? completedOn : scheduledFor);

const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const UNITS: Record<RecurrenceFrequency, [string, string]> = {
  daily: ['día', 'días'],
  weekly: ['semana', 'semanas'],
  monthly: ['mes', 'meses'],
  yearly: ['año', 'años'],
};

/** "Cada semana (lun, mié)", "3 días después de completarla"… */
export const describeRecurrence = (r: Recurrence): string => {
  const [one, many] = UNITS[r.frequency];
  if (r.mode === 'afterCompletion') {
    return `${r.interval} ${r.interval === 1 ? one : many} después de completarla`;
  }
  const base = r.interval === 1 ? `Cada ${one}` : `Cada ${r.interval} ${many}`;
  if (r.frequency !== 'weekly' || r.weekdays.length === 0) return base;
  const days = [...r.weekdays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  return `${base} (${days.map((d) => (WEEKDAY_NAMES[d] ?? '').slice(0, 3)).join(', ')})`;
};
