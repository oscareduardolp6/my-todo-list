/* Caso de uso: renombrar / recolorear un proyecto. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { patchProject } from '../domain/project';
import type { Project, ProjectPatch } from '../domain/project';

export const updateProject =
  (project: Project, patch: ProjectPatch): ReaderTaskEither<Deps, TodoError, Project> =>
  (deps) =>
    pipe(
      TE.fromEither(patchProject(project, patch, deps.clock())),
      TE.chainFirst((next) => attempt(() => deps.projectRepository.save(next))),
    );
