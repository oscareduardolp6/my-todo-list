/* Fechas "de calendario". Una fecha agendada o límite es un día, no un instante:
   se guarda como `YYYY-MM-DD` en hora local del usuario, así "22 de octubre"
   significa lo mismo en el teléfono y en la laptop, sin corrimientos por zona
   horaria. Los instantes reales (`createdAt`, `completedAt`) sí son epoch ms. */

export type DateKey = string;
export type WeekStart = 0 | 1;

const pad = (n: number): string => String(n).padStart(2, '0');

export const toDateKey = (ms: number): DateKey => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Medianoche local del día. */
export const parseDateKey = (key: DateKey): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

/** Rechaza formatos raros y días imposibles (2026-02-31). */
export const isDateKey = (value: unknown): value is DateKey =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  toDateKey(parseDateKey(value).getTime()) === value;

export const addDays = (key: DateKey, n: number): DateKey => {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d.getTime());
};

/** Días de `a` a `b` (positivo si `b` es posterior). */
export const diffDays = (a: DateKey, b: DateKey): number =>
  Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / 86_400_000);

/** 0 = domingo … 6 = sábado. */
export const weekdayOf = (key: DateKey): number => parseDateKey(key).getDay();

export const startOfWeek = (key: DateKey, weekStartsOn: WeekStart): DateKey =>
  addDays(key, -((weekdayOf(key) - weekStartsOn + 7) % 7));

/** Todos los días de `from` a `to`, ambos incluidos. */
export const eachDay = (from: DateKey, to: DateKey): DateKey[] => {
  const out: DateKey[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};

/** El sábado de esta semana (hoy si ya es sábado). */
export const nextSaturday = (today: DateKey): DateKey => addDays(today, (6 - weekdayOf(today) + 7) % 7);

/** El primer día de la semana siguiente. */
export const startOfNextWeek = (today: DateKey, weekStartsOn: WeekStart): DateKey =>
  addDays(startOfWeek(today, weekStartsOn), 7);

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-MX', opts);
const shortFmt = fmt({ day: 'numeric', month: 'short' });
const shortYearFmt = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
const weekdayShortFmt = fmt({ weekday: 'short' });
const longFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long' });

const clean = (s: string): string => s.replace(/\./g, '');
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** "22 oct" — con año si no es el actual. */
export const formatShort = (key: DateKey, today: DateKey): string => {
  const d = parseDateKey(key);
  const sameYear = key.slice(0, 4) === today.slice(0, 4);
  return clean((sameYear ? shortFmt : shortYearFmt).format(d));
};

/** Etiqueta relativa para chips: Hoy, Mañana, Ayer, "lun", o "22 oct". */
export const formatRelative = (key: DateKey, today: DateKey): string => {
  const delta = diffDays(today, key);
  if (delta === 0) return 'Hoy';
  if (delta === 1) return 'Mañana';
  if (delta === -1) return 'Ayer';
  if (delta > 1 && delta < 7) return clean(capitalize(weekdayShortFmt.format(parseDateKey(key))));
  return formatShort(key, today);
};

/** Encabezado de sección: "Lunes 5 de octubre", con Hoy/Mañana delante. */
export const formatDayHeading = (key: DateKey, today: DateKey): string => {
  const base = capitalize(longFmt.format(parseDateKey(key)).replace(',', ''));
  const delta = diffDays(today, key);
  if (delta === 0) return `Hoy · ${base}`;
  if (delta === 1) return `Mañana · ${base}`;
  return base;
};
