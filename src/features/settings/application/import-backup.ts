/* Caso de uso: restaurar un respaldo REEMPLAZANDO todo. Lo que hay y no viene
   en el archivo se borra; lo del archivo se escribe tal cual (mismos ids).

   Primero se escribe y solo después se borra: si algo falla a la mitad quedan
   sobrando datos viejos, nunca faltan los del respaldo. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Project } from '../../projects/domain/project';
import type { Task } from '../../tasks/domain/task';
import type { Backup } from '../domain/backup';

const missingFrom = (current: readonly { id: string }[], kept: readonly { id: string }[]): string[] => {
  const keep = new Set(kept.map((i) => i.id));
  return current.filter((i) => !keep.has(i.id)).map((i) => i.id);
};

export const importBackup =
  (backup: Backup, currentTasks: readonly Task[], currentProjects: readonly Project[]): ReaderTaskEither<Deps, TodoError, Backup> =>
  (deps) =>
    pipe(
      attempt(() =>
        Promise.all([
          deps.taskRepository.saveMany(backup.tasks),
          ...backup.projects.map((p) => deps.projectRepository.save(p)),
        ]),
      ),
      TE.chain(() =>
        attempt(() =>
          Promise.all([
            ...missingFrom(currentTasks, backup.tasks).map((id) => deps.taskRepository.remove(id)),
            ...missingFrom(currentProjects, backup.projects).map((id) => deps.projectRepository.remove(id)),
          ]),
        ),
      ),
      TE.map(() => backup),
    );
