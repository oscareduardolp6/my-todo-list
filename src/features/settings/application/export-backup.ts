/* Caso de uso: descargar un respaldo con las tareas y proyectos actuales. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Project } from '../../projects/domain/project';
import type { Task } from '../../tasks/domain/task';
import { backupFileName, buildBackup, serializeBackup } from '../domain/backup';

export const exportBackup =
  (tasks: readonly Task[], projects: readonly Project[]): ReaderTaskEither<Deps, TodoError, void> =>
  (deps) => {
    const now = deps.clock();
    return attempt(async () => deps.downloadFile(backupFileName(now), serializeBackup(buildBackup(tasks, projects, now))));
  };
