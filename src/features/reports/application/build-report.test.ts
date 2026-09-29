import { makeTask } from '../../../test/factories';
import { buildCompletionReport, normalizeRange, rangeFor } from './build-report';

const done = (id: string, on: string, extra = {}) =>
  makeTask({ id, completedOn: on, completedAt: new Date(`${on}T12:00:00`).getTime(), ...extra });

describe('buildCompletionReport', () => {
  const range = { from: '2026-09-28', to: '2026-10-04' };

  it('agrupa por el día en que se HIZO, con los días vacíos incluidos', () => {
    const report = buildCompletionReport(
      [
        done('a', '2026-09-29', { scheduledFor: '2026-09-20' }),
        done('b', '2026-09-29'),
        done('c', '2026-10-01'),
        done('fuera', '2026-10-09'),
        makeTask({ id: 'pendiente', scheduledFor: '2026-09-29' }),
      ],
      range,
    );
    expect(report.days).toHaveLength(7);
    expect(report.total).toBe(3);
    expect(report.activeDays).toBe(2);
    expect(report.days.find((d) => d.date === '2026-09-29')?.tasks).toHaveLength(2);
    expect(report.days.find((d) => d.date === '2026-09-30')?.tasks).toEqual([]);
    expect(report.averagePerDay).toBeCloseTo(3 / 7);
  });

  it('mide cuántas con fecha límite se cumplieron a tiempo', () => {
    const report = buildCompletionReport(
      [
        done('a-tiempo', '2026-09-29', { deadline: '2026-10-22' }),
        done('justo', '2026-09-30', { deadline: '2026-09-30' }),
        done('tarde', '2026-10-01', { deadline: '2026-09-30' }),
        done('sin-limite', '2026-10-01'),
      ],
      range,
    );
    expect(report.withDeadline).toBe(3);
    expect(report.onTime).toBe(2);
  });

  it('desglosa por proyecto, de más a menos', () => {
    const report = buildCompletionReport(
      [done('1', '2026-09-29', { projectId: 'work' }), done('2', '2026-09-29', { projectId: 'work' }), done('3', '2026-09-29')],
      range,
    );
    expect(report.byProject).toEqual([
      { projectId: 'work', count: 2 },
      { projectId: 'inbox', count: 1 },
    ]);
  });

  it('presets de rango', () => {
    expect(rangeFor('7d', '2026-09-30')).toEqual({ from: '2026-09-24', to: '2026-09-30' });
    expect(rangeFor('month', '2026-09-30')).toEqual({ from: '2026-09-01', to: '2026-09-30' });
  });

  it('normaliza extremos invertidos y recorta rangos enormes', () => {
    expect(normalizeRange({ from: '2026-10-04', to: '2026-09-28' })).toEqual(range);
    const huge = normalizeRange({ from: '2000-01-01', to: '2026-09-30' });
    expect(huge.to).toBe('2026-09-30');
    expect(buildCompletionReport([], huge).days).toHaveLength(366);
  });
});
