/* La frontera entre fp-ts y React: los runners ya ligados a `Deps`.

   REGLA DE ARQUITECTURA: solo pueden llamarse desde un slice de zustand. Un
   caso de uso es un valor puro hasta que alguien lo corre; si un componente lo
   corriera tendríamos dos modelos de efectos compitiendo. Ningún componente
   debe importar este módulo. */

import type { Either } from 'fp-ts/Either';
import type { ReaderIO } from 'fp-ts/ReaderIO';
import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { TodoError } from '../shared/domain/errors';
import { runReaderIO, runReaderTaskEither } from '../shared/fp';
import type { Deps } from './dependencies';

/** Caso de uso síncrono con efecto (ids, reloj, suscripciones). */
export const runRIO = <A>(rio: ReaderIO<Deps, A>, deps: Deps): A => runReaderIO(rio, deps);

/** Caso de uso asíncrono y falible: el `Either` se resuelve en el slice. */
export const runRTE = <A>(rte: ReaderTaskEither<Deps, TodoError, A>, deps: Deps): Promise<Either<TodoError, A>> =>
  runReaderTaskEither(rte, deps);
