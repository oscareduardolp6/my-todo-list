/* Caso de uso: borrar un proyecto SIN perder tareas. Las suyas (pendientes y
   completadas, para no romper los reportes) pasan a la bandeja de entrada, y
   solo entonces se borra el proyecto. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Task } from '../../tasks/domain/task';
import { INBOX_ID } from '../domain/project';
import type { Project } from '../domain/project';

export const deleteProject =
  (project: Project, tasks: readonly Task[]): ReaderTaskEither<Deps, TodoError, void> =>
  (deps) => {
    const now = deps.clock();
    const orphans = tasks
      .filter((t) => t.projectId === project.id)
      .map((t): Task => ({ ...t, projectId: INBOX_ID, updatedAt: now }));
    return pipe(
      orphans.length ? attempt(() => deps.taskRepository.saveMany(orphans)) : TE.right<TodoError, void>(undefined),
      TE.chain(() => attempt(() => deps.projectRepository.remove(project.id))),
    );
  };
