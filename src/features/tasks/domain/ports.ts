import type { Unsubscribe } from '../../../shared/domain/ports';
import type { Task } from './task';

/** Repositorio de tareas. `subscribe` es tiempo real: entrega la lista completa
 *  cada vez que cambia (incluidas las escrituras locales aún no confirmadas). */
export type TaskRepository = {
  subscribe: (onData: (tasks: Task[]) => void, onError: (cause: unknown) => void) => Unsubscribe;
  save: (task: Task) => Promise<void>;
  saveMany: (tasks: readonly Task[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
};
