/* Caso de uso: marcar una tarea como hecha. Registra el instante y el DÍA en
   que se hizo (`completedOn`), que es lo que alimenta los reportes.

   Una recurrente no queda "completada" en la lista: avanza a su siguiente
   fecha y la ocurrencia cerrada se guarda como copia completada (mismo batch,
   así nunca queda una sin la otra). Devuelve la tarea vigente. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { completeOccurrence, isRecurring, markCompleted } from '../domain/task';
import type { Task } from '../domain/task';

export const completeTask =
  (task: Task): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) => {
    const now = deps.clock();
    if (isRecurring(task)) {
      const { next, done } = completeOccurrence(task, now);
      return pipe(
        attempt(() => deps.taskRepository.saveMany([done, next])),
        TE.map(() => next),
      );
    }
    return pipe(
      TE.of<TodoError, Task>(markCompleted(task, now)),
      TE.chainFirst((done) => attempt(() => deps.taskRepository.save(done))),
    );
  };
