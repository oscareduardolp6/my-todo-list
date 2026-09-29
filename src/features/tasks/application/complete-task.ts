/* Caso de uso: marcar una tarea como hecha. Registra el instante y el DÍA en
   que se hizo (`completedOn`), que es lo que alimenta los reportes. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { markCompleted } from '../domain/task';
import type { Task } from '../domain/task';

export const completeTask =
  (task: Task): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.of<TodoError, Task>(markCompleted(task, deps.clock())),
      TE.chainFirst((done) => attempt(() => deps.taskRepository.save(done))),
    );
