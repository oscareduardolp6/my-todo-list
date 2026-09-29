/* Caso de uso: crear un proyecto. Va al final de la lista. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import { createProject as buildProject } from '../domain/project';
import type { NewProject, Project } from '../domain/project';

export const createProject =
  (existing: readonly Project[], input: NewProject): ReaderTaskEither<Deps, TodoError, Project> =>
  (deps) =>
    pipe(
      TE.fromEither(
        buildProject(input, {
          id: deps.idGenerator('proj'),
          now: deps.clock(),
          order: existing.reduce((max, p) => Math.max(max, p.order), -1) + 1,
        }),
      ),
      TE.chainFirst((project) => attempt(() => deps.projectRepository.save(project))),
    );
