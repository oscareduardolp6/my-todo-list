/* Caso de uso: editar una tarea. Reagendar es solo un caso particular: cambiar
   `scheduledFor` suma a `rescheduleCount` y jamás toca `deadline`. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { patchTask } from '../domain/task';
import type { Task, TaskPatch } from '../domain/task';

export const updateTask =
  (task: Task, patch: TaskPatch): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.fromEither(patchTask(task, patch, deps.clock())),
      TE.chainFirst((next) => attempt(() => deps.taskRepository.save(next))),
    );
