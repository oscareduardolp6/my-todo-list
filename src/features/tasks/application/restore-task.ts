/* Caso de uso: escribir de vuelta un snapshot anterior de la tarea, tal cual.
   Es el "Deshacer" de completar y de borrar: como restaura el estado completo
   (fechas, conteo de reagendados, todo), sirve igual para ambos. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Task } from '../domain/task';

export const restoreTask =
  (snapshot: Task): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      attempt(() => deps.taskRepository.save(snapshot)),
      TE.map(() => snapshot),
    );
