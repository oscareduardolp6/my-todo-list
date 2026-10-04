import { INBOX_ID } from '../features/projects/domain/project';
import { getTodayView } from '../features/views/application/build-views';
import { toDateKey } from '../shared/domain/dates';
import { noon } from '../test/factories';
import { buildDemoData } from './demo-data';

describe('buildDemoData', () => {
  const now = noon('2026-09-29');
  const { tasks, projects } = buildDemoData(now);

  it('ids únicos y cada tarea apunta a un proyecto existente (o a la bandeja)', () => {
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
    const ids = new Set([INBOX_ID, ...projects.map((p) => p.id)]);
    expect(tasks.every((t) => ids.has(t.projectId))).toBe(true);
  });

  it('Hoy trae atrasadas y tareas del día; hay historia completada para los reportes', () => {
    const today = getTodayView(tasks, toDateKey(now));
    expect(today.overdue.length).toBeGreaterThan(0);
    expect(today.today.length).toBeGreaterThan(0);
    expect(tasks.filter((t) => t.completedOn !== null).length).toBeGreaterThan(3);
  });

  it('las recurrentes tienen fecha agendada', () => {
    expect(tasks.filter((t) => t.recurrence).every((t) => t.scheduledFor !== null)).toBe(true);
  });
});
