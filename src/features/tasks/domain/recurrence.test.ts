import { makeTask, noon } from '../../../test/factories';
import { describeRecurrence, isRecurrence, nextOccurrence, parseRecurrence } from './recurrence';
import type { Recurrence } from './recurrence';
import { advanceTask, completeOccurrence, occurrenceId } from './task';

const rec = (over: Partial<Recurrence> = {}): Recurrence => ({
  frequency: 'weekly',
  interval: 1,
  weekdays: [],
  mode: 'fixed',
  ...over,
});

// 2026-10-05 es lunes.
describe('nextOccurrence', () => {
  it('cada lunes (fecha fija): lunes 5 → lunes 12', () => {
    expect(nextOccurrence(rec(), '2026-10-05', '2026-10-05')).toBe('2026-10-12');
  });

  it('completarla antes de tiempo no adelanta la serie', () => {
    expect(nextOccurrence(rec(), '2026-10-05', '2026-10-01')).toBe('2026-10-12');
  });

  it('atrasada: la siguiente es la próxima fecha futura, no otra atrasada', () => {
    // Agendada hace dos semanas (lunes 5), hoy es martes 20.
    expect(nextOccurrence(rec(), '2026-10-05', '2026-10-20')).toBe('2026-10-26');
  });

  it('semanal con varios días: L, X, V', () => {
    const r = rec({ weekdays: [1, 3, 5] });
    expect(nextOccurrence(r, '2026-10-05', '2026-10-05')).toBe('2026-10-07');
    expect(nextOccurrence(r, '2026-10-07', '2026-10-07')).toBe('2026-10-09');
    expect(nextOccurrence(r, '2026-10-09', '2026-10-09')).toBe('2026-10-12');
  });

  it('cada 2 semanas respeta la semana de la serie', () => {
    const r = rec({ interval: 2, weekdays: [1, 3] });
    expect(nextOccurrence(r, '2026-10-05', '2026-10-05')).toBe('2026-10-07');
    expect(nextOccurrence(r, '2026-10-07', '2026-10-07')).toBe('2026-10-19');
  });

  it('diaria cada 3 días', () => {
    expect(nextOccurrence(rec({ frequency: 'daily', interval: 3 }), '2026-10-05', '2026-10-05')).toBe('2026-10-08');
    expect(nextOccurrence(rec({ frequency: 'daily', interval: 3 }), '2026-10-05', '2026-10-10')).toBe('2026-10-11');
  });

  it('mensual el 31 cae en el último día de los meses cortos sin correrse', () => {
    const r = rec({ frequency: 'monthly' });
    expect(nextOccurrence(r, '2026-01-31', '2026-01-31')).toBe('2026-02-28');
    // Desde la ancla original, marzo vuelve a 31.
    expect(nextOccurrence(r, '2026-01-31', '2026-02-28')).toBe('2026-03-31');
    expect(nextOccurrence(r, '2026-10-31', '2026-10-31')).toBe('2026-11-30');
  });

  it('anual, incluido el 29 de febrero', () => {
    const r = rec({ frequency: 'yearly' });
    expect(nextOccurrence(r, '2026-10-05', '2026-10-05')).toBe('2027-10-05');
    expect(nextOccurrence(r, '2028-02-29', '2028-02-29')).toBe('2029-02-28');
  });

  it('después de completar: jueves + 3 días = domingo, sin importar lo agendado', () => {
    const r = rec({ frequency: 'daily', interval: 3, mode: 'afterCompletion' });
    expect(nextOccurrence(r, '2026-09-01', '2026-10-01')).toBe('2026-10-04');
  });

  it('después de completar en semanas y meses', () => {
    expect(nextOccurrence(rec({ mode: 'afterCompletion', interval: 2 }), '2026-09-01', '2026-10-01')).toBe('2026-10-15');
    expect(nextOccurrence(rec({ frequency: 'monthly', mode: 'afterCompletion' }), '2026-09-01', '2026-01-31')).toBe('2026-02-28');
  });
});

describe('Recurrence', () => {
  it('parseRecurrence tolera basura', () => {
    expect(parseRecurrence(undefined)).toBeNull();
    expect(parseRecurrence({ frequency: 'hourly', interval: 1, weekdays: [], mode: 'fixed' })).toBeNull();
    expect(parseRecurrence({ ...rec(), interval: 0 })).toBeNull();
    expect(isRecurrence(rec())).toBe(true);
  });

  it('describeRecurrence', () => {
    expect(describeRecurrence(rec())).toBe('Cada semana');
    expect(describeRecurrence(rec({ interval: 2, weekdays: [3, 1] }))).toBe('Cada 2 semanas (lun, mié)');
    expect(describeRecurrence(rec({ frequency: 'daily', interval: 3, mode: 'afterCompletion' }))).toBe('3 días después de completarla');
  });
});

describe('completar una recurrente (dominio)', () => {
  const task = makeTask({
    id: 'r',
    scheduledFor: '2026-10-05',
    deadline: '2026-10-08',
    rescheduleCount: 2,
    recurrence: rec(),
  });

  it('avanza conservando la distancia a la fecha límite y reinicia reagendados', () => {
    const next = advanceTask(task, '2026-10-05', 9);
    expect(next).toMatchObject({ scheduledFor: '2026-10-12', deadline: '2026-10-15', rescheduleCount: 0, completedAt: null });
  });

  it('deja una copia completada, sin recurrencia y con id determinista', () => {
    const { next, done } = completeOccurrence(task, noon('2026-10-06'));
    expect(done).toMatchObject({
      id: occurrenceId(task),
      recurrence: null,
      scheduledFor: '2026-10-05',
      completedOn: '2026-10-06',
    });
    expect(next.id).toBe('r');
    expect(next.scheduledFor).toBe('2026-10-12');
  });
});
