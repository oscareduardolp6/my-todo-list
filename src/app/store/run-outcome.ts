import type { Either } from 'fp-ts/Either';
import { messageFor } from '../../shared/domain/errors';
import type { TodoError } from '../../shared/domain/errors';
import { E, pipe } from '../../shared/fp';
import type { AppStore } from './index';

/** El único `match` del `Either`: los slices lo usan para convertir un fallo en
 *  toast de error y un éxito en el callback opcional. */
export const settle =
  <A>(get: () => AppStore, onSuccess?: (value: A) => void) =>
  (result: Either<TodoError, A>): void =>
    pipe(
      result,
      E.match(
        (error) => get().pushToast({ message: messageFor(error), kind: 'error' }),
        (value) => onSuccess?.(value),
      ),
    );
