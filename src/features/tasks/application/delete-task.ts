/* Caso de uso: borrar una tarea. El llamador conserva el snapshot para poder
   deshacer con `restoreTask`. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { attempt } from '../../../shared/infrastructure/persist';

export const deleteTask =
  (id: string): ReaderTaskEither<Deps, TodoError, void> =>
  (deps) =>
    attempt(() => deps.taskRepository.remove(id));
