/* Caso de uso: duplicar una tarea. El id de la copia lo elige el llamador para
   poder ofrecer "Deshacer" (borrarla) sin esperar a que el servidor confirme. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { duplicateTask as copyOf } from '../domain/task';
import type { Task } from '../domain/task';

export const duplicateTask =
  (task: Task, id: string): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.fromEither(copyOf(task, { id, now: deps.clock() })),
      TE.chainFirst((copy) => attempt(() => deps.taskRepository.save(copy))),
    );
