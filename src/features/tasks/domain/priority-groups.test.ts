import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../test/factories';
import { prioritized } from './priority-groups';

const summary = (list: ReturnType<typeof prioritized>) => list.map((p) => `${p.task.id}${p.gap ? '|' : ''}`);

describe('prioritized', () => {
  const tasks = [
    makeTask({ id: 'n1', priority: 4 }),
    makeTask({ id: 'u1', priority: 1 }),
    makeTask({ id: 'a1', priority: 2 }),
    makeTask({ id: 'u2', priority: 1 }),
  ];

  it('sin separar deja la lista como viene, sin espacios', () => {
    expect(summary(prioritized(tasks, false))).toEqual(['n1', 'u1', 'a1', 'u2']);
  });

  it('separando ordena por prioridad (estable) y marca cada cambio', () => {
    expect(summary(prioritized(tasks, true))).toEqual(['u1', 'u2', 'a1|', 'n1|']);
  });

  it('una lista con una sola prioridad no tiene espacios', () => {
    expect(prioritized([makeTask({ id: 'a' }), makeTask({ id: 'b' })], true).some((p) => p.gap)).toBe(false);
  });

  it('una lista vacía da vacío', () => {
    expect(prioritized([], true)).toEqual([]);
  });
});
