/* Vocabulario funcional: el único punto por el que entra fp-ts.

   Los casos de uso se ESCRIBEN como valores (Reader / ReaderIO /
   ReaderTaskEither sobre `Deps`) y se CORREN en un solo lugar: la acción del
   slice de zustand, vía `src/app/run.ts`. Estos `run*` son genéricos sobre el
   entorno `R` para que `shared/` no dependa de `Deps`, que vive en `app/`. */

export { pipe, flow, identity, constant } from 'fp-ts/function';

export * as RIO from 'fp-ts/ReaderIO';
export * as RTE from 'fp-ts/ReaderTaskEither';
export * as TE from 'fp-ts/TaskEither';
export * as E from 'fp-ts/Either';
export * as O from 'fp-ts/Option';

import type { Either } from 'fp-ts/Either';
import type { ReaderIO } from 'fp-ts/ReaderIO';
import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';

/** Aplica las dependencias y ejecuta el efecto síncrono (ids, reloj, suscripciones). */
export const runReaderIO = <R, A>(rio: ReaderIO<R, A>, deps: R): A => rio(deps)();

/** Aplica las dependencias y ejecuta el efecto asíncrono falible. */
export const runReaderTaskEither = <R, E, A>(
  rte: ReaderTaskEither<R, E, A>,
  deps: R,
): Promise<Either<E, A>> => rte(deps)();
