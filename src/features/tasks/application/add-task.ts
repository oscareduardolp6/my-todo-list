/* Caso de uso: crear una tarea. Valida, le asigna id y sello de tiempo y la guarda. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { createTask } from '../domain/task';
import type { NewTask, Task } from '../domain/task';

export const addTask =
  (input: NewTask): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.fromEither(createTask(input, { id: deps.idGenerator('task'), now: deps.clock() })),
      TE.chainFirst((task) => attempt(() => deps.taskRepository.save(task))),
    );
