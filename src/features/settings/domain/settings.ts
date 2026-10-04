/* Preferencias del usuario. Se sincronizan con Firestore como todo lo demás,
   y el tema además se cachea en localStorage para pintarlo antes del login. */

import type { WeekStart } from '../../../shared/domain/dates';

export type Theme = 'dark' | 'light' | 'system';

export type AccentOption = { readonly id: string; readonly label: string; readonly color: string };

export const ACCENTS: readonly AccentOption[] = [
  { id: 'violet', label: 'Violeta', color: '#8b7cf6' },
  { id: 'blue', label: 'Azul', color: '#4f9cf9' },
  { id: 'teal', label: 'Turquesa', color: '#2dd4bf' },
  { id: 'green', label: 'Verde', color: '#4ade80' },
  { id: 'orange', label: 'Naranja', color: '#fb923c' },
  { id: 'pink', label: 'Rosa', color: '#f472b6' },
];

export type Settings = {
  readonly theme: Theme;
  readonly accent: string;
  /** 1 = la semana empieza en lunes, 0 = en domingo. */
  readonly weekStartsOn: WeekStart;
  /** Deja un espacio entre las tareas de distinta prioridad (urgente, alta, media, normal). */
  readonly separateByPriority: boolean;
  /** Hora (0–6) a la que arranca el día. Con 3, "hoy" sigue siendo ayer hasta las 3:00 a. m.:
   *  las tareas no pasan a atrasadas antes y lo que se complete cuenta para el día anterior. */
  readonly dayStartHour: DayStartHour;
};

export const DAY_START_HOURS = [0, 1, 2, 3, 4, 5, 6] as const;
export type DayStartHour = (typeof DAY_START_HOURS)[number];

export const isDayStartHour = (v: unknown): v is DayStartHour => DAY_START_HOURS.some((h) => h === v);

/** "medianoche", "3:00 a. m.". */
export const dayStartLabel = (hour: DayStartHour): string => (hour === 0 ? 'medianoche' : `${hour}:00 a. m.`);

/** Oscuro por defecto. */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accent: 'violet',
  weekStartsOn: 1,
  separateByPriority: false,
  dayStartHour: 0,
};

export type SettingsPatch = Partial<Settings>;

export const accentColor = (id: string): string =>
  (ACCENTS.find((a) => a.id === id) ?? ACCENTS[0])?.color ?? '#8b7cf6';

export const isTheme = (v: unknown): v is Theme => v === 'dark' || v === 'light' || v === 'system';
