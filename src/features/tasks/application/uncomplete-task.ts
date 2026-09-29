/* Caso de uso: volver a abrir una tarea completada (desde la lista de completadas). */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { markPending } from '../domain/task';
import type { Task } from '../domain/task';

export const uncompleteTask =
  (task: Task): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.of<TodoError, Task>(markPending(task, deps.clock())),
      TE.chainFirst((open) => attempt(() => deps.taskRepository.save(open))),
    );
