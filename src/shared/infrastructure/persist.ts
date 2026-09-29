import { TE } from '../fp';
import { persistenceError } from '../domain/errors';
import type { TodoError } from '../domain/errors';

/** Envuelve una escritura a un repositorio: si lanza, el fallo entra al canal
 *  de error tipado en vez de escaparse como excepción. */
export const attempt = <A>(write: () => Promise<A>): TE.TaskEither<TodoError, A> =>
  TE.tryCatch(write, persistenceError);
