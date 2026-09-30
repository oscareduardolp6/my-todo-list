/* Caso de uso: escribir de vuelta un snapshot anterior de la tarea, tal cual.
   Es el "Deshacer" de completar, omitir y borrar: como restaura el estado
   completo (fechas, conteo de reagendados, todo), sirve igual para todos.

   `alsoRemove` son documentos que la acción original creó y hay que quitar
   (la copia histórica al completar una recurrente), para no dejar duplicados.
   Todo se lanza junto y se espera junto: offline, una escritura no resuelve
   hasta reconectar y no debe frenar a las demás. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Task } from '../domain/task';

export const restoreTask =
  (snapshot: Task, alsoRemove: readonly string[] = []): ReaderTaskEither<Deps, TodoError, Task> =>
  (deps) =>
    pipe(
      attempt(() =>
        Promise.all([...alsoRemove.map((id) => deps.taskRepository.remove(id)), deps.taskRepository.save(snapshot)]),
      ),
      TE.map(() => snapshot),
    );
