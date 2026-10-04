import { isLeft, isRight } from 'fp-ts/Either';
import { makeTask, noon } from '../../../test/factories';
import { compareTasks, createTask, effectiveDate, isOverdue, markCompleted, markPending, patchTask } from './task';
import type { Task } from './task';

const right = <A>(e: { _tag: string; right?: A }): A => {
  if (!isRight(e as never)) throw new Error('esperaba Right');
  return (e as { right: A }).right;
};

describe('task domain', () => {
  it('createTask normaliza y pone defaults (bandeja, prioridad normal, sin fechas)', () => {
    const task = right<Task>(createTask({ title: '  Pagar luz ' }, { id: 'a', now: 10 }));
    expect(task).toMatchObject({
      id: 'a', title: 'Pagar luz', description: '', priority: 4, projectId: 'inbox',
      scheduledFor: null, deadline: null, rescheduleCount: 0, completedAt: null,
    });
  });

  it('rechaza título vacío y fechas inválidas', () => {
    expect(isLeft(createTask({ title: '   ' }, { id: 'a', now: 1 }))).toBe(true);
    expect(isLeft(createTask({ title: 'x', deadline: '2026-13-40' }, { id: 'a', now: 1 }))).toBe(true);
  });

  describe('agendar vs. fecha límite', () => {
    const base = makeTask({ scheduledFor: '2026-10-03', deadline: '2026-10-22' });

    it('reagendar suma al conteo y NO toca la fecha límite', () => {
      const moved = right<Task>(patchTask(base, { scheduledFor: '2026-10-10' }, 5));
      expect(moved.scheduledFor).toBe('2026-10-10');
      expect(moved.deadline).toBe('2026-10-22');
      expect(moved.rescheduleCount).toBe(1);
    });

    it('quitar la agenda también cuenta como reagendar', () => {
      expect(right<Task>(patchTask(base, { scheduledFor: null }, 5)).rescheduleCount).toBe(1);
    });

    it('agendar por primera vez no cuenta', () => {
      const first = right<Task>(patchTask(makeTask({ deadline: '2026-10-22' }), { scheduledFor: '2026-10-03' }, 5));
      expect(first.rescheduleCount).toBe(0);
    });

    it('editar otro campo no cuenta como reagendar', () => {
      expect(right<Task>(patchTask(base, { title: 'Nuevo' }, 5)).rescheduleCount).toBe(0);
    });

    it('el día efectivo es la agenda y, sin ella, la fecha límite', () => {
      expect(effectiveDate(base)).toBe('2026-10-03');
      expect(effectiveDate(makeTask({ deadline: '2026-10-22' }))).toBe('2026-10-22');
      expect(effectiveDate(makeTask())).toBeNull();
    });
  });

  it('completar guarda el día indicado (puede diferir del de calendario); reabrir lo limpia', () => {
    const now = noon('2026-10-05');
    const done = markCompleted(makeTask(), now, '2026-10-04');
    expect(done).toMatchObject({ completedAt: now, completedOn: '2026-10-04' });
    expect(markPending(done, now + 1)).toMatchObject({ completedAt: null, completedOn: null });
  });

  it('isOverdue: solo pendientes con día efectivo anterior a hoy', () => {
    expect(isOverdue(makeTask({ scheduledFor: '2026-10-01' }), '2026-10-02')).toBe(true);
    expect(isOverdue(makeTask({ scheduledFor: '2026-10-02' }), '2026-10-02')).toBe(false);
    expect(isOverdue(makeTask({ scheduledFor: '2026-10-01', completedAt: 1, completedOn: '2026-10-01' }), '2026-10-02')).toBe(false);
  });

  it('compareTasks: prioridad, luego fecha (sin fecha al final), luego antigüedad', () => {
    const list = [
      makeTask({ id: 'sin', priority: 2 }),
      makeTask({ id: 'p4', priority: 4, scheduledFor: '2026-10-01' }),
      makeTask({ id: 'p2-tarde', priority: 2, scheduledFor: '2026-10-09' }),
      makeTask({ id: 'p2-pronto', priority: 2, scheduledFor: '2026-10-02' }),
    ];
    expect(list.sort(compareTasks).map((t) => t.id)).toEqual(['p2-pronto', 'p2-tarde', 'sin', 'p4']);
  });
});
