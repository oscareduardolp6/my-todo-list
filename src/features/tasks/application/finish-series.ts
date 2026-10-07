/* Caso de uso: completar definitivamente una recurrente que ya terminó. A
   diferencia de `completeTask`, no avanza a la siguiente fecha: la tarea queda
   completada y sin repetición (se conserva el historial, no se borra). El
   "Deshacer" es `restoreTask` con el snapshot previo, que recupera la regla. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { DateKey } from '../../../shared/domain/dates';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { finishSeries as finish } from '../domain/task';
import type { Task } from '../domain/task';

export const finishSeries =
  (task: Task, doneOn: DateKey): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      TE.of<TodoError, Task>(finish(task, deps.clock(), doneOn)),
      TE.chainFirst((done) => attempt(() => deps.taskRepository.save(done))),
    );
