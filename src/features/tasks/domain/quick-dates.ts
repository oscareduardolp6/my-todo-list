import { addDays, nextSaturday, startOfNextWeek } from '../../../shared/domain/dates';
import type { DateKey, WeekStart } from '../../../shared/domain/dates';

export type QuickDate = { readonly label: string; readonly value: DateKey | null };

/** Accesos rápidos para agendar: del editor y del selector de reagendar. */
export const quickDates = (today: DateKey, weekStartsOn: WeekStart): QuickDate[] => [
  { label: 'Hoy', value: today },
  { label: 'Mañana', value: addDays(today, 1) },
  { label: 'Fin de semana', value: nextSaturday(today) },
  { label: 'Próx. semana', value: startOfNextWeek(today, weekStartsOn) },
  { label: 'Sin fecha', value: null },
];
