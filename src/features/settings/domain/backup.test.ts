import { describe, expect, it } from 'vitest';
import { E } from '../../../shared/fp';
import { makeTask, noon } from '../../../test/factories';
import { backupFileName, buildBackup, parseBackup, serializeBackup } from './backup';

const project = { id: 'work', name: 'Trabajo', color: '#3b82f6', order: 0, createdAt: 1, updatedAt: 1 };

const roundTrip = (json: string) => parseBackup(json);
const raw = (over: Record<string, unknown> = {}) => ({ ...buildBackup([], [], 5), ...over });

describe('respaldo', () => {
  it('exportar y leer devuelve exactamente lo mismo', () => {
    const tasks = [
      makeTask({
        id: 'a', title: 'Pagar luz', priority: 1, projectId: 'work', scheduledFor: '2026-10-01', deadline: '2026-10-05',
        recurrence: { frequency: 'weekly', interval: 2, weekdays: [1, 3], mode: 'fixed' }, rescheduleCount: 3,
        completedAt: noon('2026-09-28'), completedOn: '2026-09-28',
      }),
      makeTask({ id: 'b' }),
    ];
    const result = roundTrip(serializeBackup(buildBackup(tasks, [project], 5)));
    expect(result).toEqual(E.right(buildBackup(tasks, [project], 5)));
  });

  it('nombra el archivo con la fecha local', () => {
    expect(backupFileName(noon('2026-09-30'))).toBe('todo-respaldo-2026-09-30.json');
  });

  it.each([
    ['no es JSON', 'esto no es json'],
    ['es de otra app', JSON.stringify(raw({ app: 'hilo' }))],
    ['una tarea sin título', JSON.stringify(raw({ tasks: [makeTask({ title: '' })] }))],
    ['una prioridad inválida', JSON.stringify(raw({ tasks: [{ ...makeTask(), priority: 9 }] }))],
    ['una fecha imposible', JSON.stringify(raw({ tasks: [makeTask({ scheduledFor: '2026-02-31' })] }))],
    ['una recurrencia rota', JSON.stringify(raw({ tasks: [{ ...makeTask(), recurrence: { frequency: 'hourly' } }] }))],
    ['ids repetidos', JSON.stringify(raw({ tasks: [makeTask({ id: 'x' }), makeTask({ id: 'x' })] }))],
    ['tasks no es lista', JSON.stringify(raw({ tasks: 'hola' }))],
  ])('rechaza el archivo si %s', (_label, text) => {
    expect(E.isLeft(parseBackup(text))).toBe(true);
  });

  it('rechaza una versión desconocida con un mensaje propio', () => {
    const result = parseBackup(JSON.stringify(raw({ version: 2 })));
    expect(result).toEqual(E.left({ _tag: 'ValidationError', message: 'El respaldo es de una versión que esta app no entiende' }));
  });

  it('ignora la bandeja si viene en proyectos y manda a ella las tareas de proyectos que faltan', () => {
    const text = JSON.stringify(
      raw({
        projects: [{ ...project, id: 'inbox' }, project],
        tasks: [makeTask({ id: 'a', projectId: 'work' }), makeTask({ id: 'b', projectId: 'borrado' })],
      }),
    );
    const result = parseBackup(text);
    if (!E.isRight(result)) throw new Error('debía ser válido');
    expect(result.right.projects.map((p) => p.id)).toEqual(['work']);
    expect(result.right.tasks.map((t) => t.projectId)).toEqual(['work', 'inbox']);
  });
});
