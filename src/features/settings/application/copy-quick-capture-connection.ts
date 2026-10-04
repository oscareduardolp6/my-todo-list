/* Caso de uso: copiar al portapapeles la conexión para la captura rápida desde
   Raycast. Contiene el refresh token de la sesión, o sea que es un secreto: se
   copia, nunca se muestra ni se guarda. */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { attempt } from '../../../shared/infrastructure/persist';

export const copyQuickCaptureConnection =
  (): ReaderTaskEither<Deps, TodoError, void> =>
  (deps) =>
    attempt(() => deps.copyText(JSON.stringify(deps.authGateway.quickCaptureConnection())));
