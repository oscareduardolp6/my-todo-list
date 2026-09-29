/* Caso de uso: cambiar preferencias (tema, acento, inicio de semana). */

import type { ReaderTaskEither } from 'fp-ts/ReaderTaskEither';
import type { Deps } from '../../../app/dependencies';
import type { TodoError } from '../../../shared/domain/errors';
import { pipe, TE } from '../../../shared/fp';
import { attempt } from '../../../shared/infrastructure/persist';
import type { Settings, SettingsPatch } from '../domain/settings';

export const updateSettings =
  (current: Settings, patch: SettingsPatch): ReaderTaskEither<Deps, TodoError, Settings> =>
  (deps) => {
    const next: Settings = { ...current, ...patch };
    return pipe(
      attempt(() => deps.settingsRepository.save(next)),
      TE.map(() => next),
    );
  };
