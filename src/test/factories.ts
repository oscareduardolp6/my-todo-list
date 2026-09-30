import type { Task } from '../features/tasks/domain/task';

/** Tarea de prueba con valores por defecto; sobreescribe solo lo que importa. */
export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  title: 'Tarea',
  description: '',
  priority: 4,
  projectId: 'inbox',
  scheduledFor: null,
  deadline: null,
  recurrence: null,
  rescheduleCount: 0,
  completedAt: null,
  completedOn: null,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
});

/** Mediodía local del día dado: evita que un cambio de horario mueva la fecha. */
export const noon = (dateKey: string): number => new Date(`${dateKey}T12:00:00`).getTime();
