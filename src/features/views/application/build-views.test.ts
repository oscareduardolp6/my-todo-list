import { makeTask } from '../../../test/factories';
import { countPendingByProject, getProjectView, getTodayView, getUpcomingView, getWeekView } from './build-views';

const TODAY = '2026-09-30'; // miércoles

describe('build-views', () => {
  const tasks = [
    makeTask({ id: 'vieja', scheduledFor: '2026-09-28' }),
    makeTask({ id: 'hoy', scheduledFor: TODAY, priority: 1 }),
    makeTask({ id: 'limite-hoy', deadline: TODAY }),
    makeTask({ id: 'manana', scheduledFor: '2026-10-01' }),
    makeTask({ id: 'agendada-antes-del-limite', scheduledFor: '2026-10-03', deadline: '2026-10-22' }),
    makeTask({ id: 'lejana', scheduledFor: '2026-11-20' }),
    makeTask({ id: 'sin-fecha' }),
    makeTask({ id: 'hecha', scheduledFor: TODAY, completedAt: 1, completedOn: TODAY }),
  ];

  it('Hoy: atrasadas aparte, y las de hoy (agendadas o con límite hoy) por prioridad', () => {
    const view = getTodayView(tasks, TODAY);
    expect(view.overdue.map((t) => t.id)).toEqual(['vieja']);
    expect(view.today.map((t) => t.id)).toEqual(['hoy', 'limite-hoy']);
  });

  it('Semana: 7 días desde el inicio configurado, con los días vacíos incluidos', () => {
    const view = getWeekView(tasks, TODAY, 1);
    expect(view.weekStart).toBe('2026-09-28');
    expect(view.weekEnd).toBe('2026-10-04');
    expect(view.days).toHaveLength(7);
    expect(view.days.find((d) => d.date === '2026-10-01')?.tasks.map((t) => t.id)).toEqual(['manana']);
    expect(view.days.find((d) => d.date === '2026-10-03')?.tasks.map((t) => t.id)).toEqual(['agendada-antes-del-limite']);
    expect(view.overdue.map((t) => t.id)).toEqual(['vieja']);
  });

  it('Semana siguiente: sin atrasadas', () => {
    const view = getWeekView(tasks, TODAY, 1, 1);
    expect(view.weekStart).toBe('2026-10-05');
    expect(view.overdue).toEqual([]);
  });

  it('Próximas: solo días futuros con tareas, en orden', () => {
    expect(getUpcomingView(tasks, TODAY).map((g) => g.date)).toEqual(['2026-10-01', '2026-10-03', '2026-11-20']);
  });

  it('una tarea reagendada cambia de día pero conserva su límite', () => {
    const moved = tasks.map((t) => (t.id === 'agendada-antes-del-limite' ? { ...t, scheduledFor: '2026-10-10' } : t));
    const upcoming = getUpcomingView(moved, TODAY);
    const group = upcoming.find((g) => g.date === '2026-10-10');
    expect(group?.tasks[0]).toMatchObject({ id: 'agendada-antes-del-limite', deadline: '2026-10-22' });
  });

  it('Proyecto: pendientes y completadas por separado', () => {
    const view = getProjectView(tasks, 'inbox');
    expect(view.done.map((t) => t.id)).toEqual(['hecha']);
    expect(view.open).toHaveLength(7);
  });

  it('cuenta pendientes por proyecto', () => {
    const counts = countPendingByProject([...tasks, makeTask({ id: 'w', projectId: 'work' })]);
    expect(counts).toEqual({ inbox: 7, work: 1 });
  });
});
