/* Caso de uso: omitir la ocurrencia actual de una recurrente ("borrar solo
   esta"). Avanza a la siguiente fecha sin registrar nada como hecho. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import { toDateKey } from '../../../shared/domain/dates';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { advanceTask } from '../domain/task';
import type { Task } from '../domain/task';

export const skipOccurrence =
  (task: Task): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) => {
    const now = deps.clock();
    return pipe(
      TE.of<TodoError, Task>(advanceTask(task, toDateKey(now), now)),
      TE.chainFirst((next) => attempt(() => deps.taskRepository.save(next))),
    );
  };
