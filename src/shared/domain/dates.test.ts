import { addDays, diffDays, eachDay, formatRelative, isDateKey, nextSaturday, startOfWeek, toDateKey, toDayKey } from './dates';

describe('dates', () => {
  it('toDateKey usa la fecha local', () => {
    expect(toDateKey(new Date(2026, 9, 3, 23, 59).getTime())).toBe('2026-10-03');
  });

  it('isDateKey rechaza formatos raros y días imposibles', () => {
    expect(isDateKey('2026-10-22')).toBe(true);
    expect(isDateKey('2026-02-31')).toBe(false);
    expect(isDateKey('22/10/2026')).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });

  it('addDays cruza mes y año', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('diffDays es firmado', () => {
    expect(diffDays('2026-10-03', '2026-10-22')).toBe(19);
    expect(diffDays('2026-10-22', '2026-10-03')).toBe(-19);
  });

  it('startOfWeek respeta el inicio configurado', () => {
    // 2026-09-30 es miércoles
    expect(startOfWeek('2026-09-30', 1)).toBe('2026-09-28');
    expect(startOfWeek('2026-09-30', 0)).toBe('2026-09-27');
    expect(startOfWeek('2026-09-28', 1)).toBe('2026-09-28');
  });

  it('eachDay incluye ambos extremos', () => {
    expect(eachDay('2026-10-01', '2026-10-03')).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
  });

  it('nextSaturday devuelve hoy si ya es sábado', () => {
    expect(nextSaturday('2026-09-30')).toBe('2026-10-03');
    expect(nextSaturday('2026-10-03')).toBe('2026-10-03');
  });

  it('formatRelative', () => {
    expect(formatRelative('2026-09-29', '2026-09-29')).toBe('Hoy');
    expect(formatRelative('2026-09-30', '2026-09-29')).toBe('Mañana');
    expect(formatRelative('2026-09-28', '2026-09-29')).toBe('Ayer');
    expect(formatRelative('2026-10-22', '2026-09-29')).toBe('22 oct');
  });
});

describe('toDayKey (el día arranca a una hora distinta de medianoche)', () => {
  const at = (h: number, m = 0) => new Date(2026, 9, 3, h, m).getTime();

  it('antes de la hora de inicio todavía es el día anterior', () => {
    expect(toDayKey(at(1, 30), 3)).toBe('2026-10-02');
    expect(toDayKey(at(2, 59), 3)).toBe('2026-10-02');
  });

  it('a partir de la hora de inicio ya es el día nuevo', () => {
    expect(toDayKey(at(3), 3)).toBe('2026-10-03');
    expect(toDayKey(at(23, 59), 3)).toBe('2026-10-03');
  });

  it('con 0 equivale a toDateKey', () => {
    expect(toDayKey(at(0, 5), 0)).toBe(toDateKey(at(0, 5)));
  });
});
