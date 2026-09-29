import type { Unsubscribe } from '../../../shared/domain/ports';
import type { Settings } from './settings';

export type SettingsRepository = {
  /** Si el usuario nunca guardó preferencias, entrega `DEFAULT_SETTINGS`. */
  subscribe: (onData: (settings: Settings) => void, onError: (cause: unknown) => void) => Unsubscribe;
  save: (settings: Settings) => Promise<void>;
};
