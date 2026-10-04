import { createLocalValue } from '../../../shared/infrastructure/local-storage';
import { DEFAULT_SETTINGS, isDayStartHour, isTheme } from '../domain/settings';
import type { Settings } from '../domain/settings';
import type { SettingsRepository } from '../domain/ports';

const isRecord = (raw: unknown): raw is Record<string, unknown> => typeof raw === 'object' && raw !== null && !Array.isArray(raw);

/** Lo guardado puede venir de una versión anterior o editado a mano: cada campo
 *  inválido cae a su valor por defecto. */
const toSettings = (raw: Record<string, unknown>): Settings => ({
  theme: isTheme(raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
  accent: typeof raw.accent === 'string' ? raw.accent : DEFAULT_SETTINGS.accent,
  weekStartsOn: raw.weekStartsOn === 0 ? 0 : 1,
  separateByPriority: raw.separateByPriority === true,
  dayStartHour: isDayStartHour(raw.dayStartHour) ? raw.dayStartHour : DEFAULT_SETTINGS.dayStartHour,
});

/** Preferencias del modo demo: un único valor en `localStorage`. */
export const createLocalSettingsRepository = (key: string): SettingsRepository => {
  const store = createLocalValue<Record<string, unknown>>(key, () => ({ ...DEFAULT_SETTINGS }), isRecord);
  return {
    subscribe: (onData) => store.subscribe((raw) => onData(toSettings(raw))),
    save: async (settings) => store.set({ ...settings }),
  };
};
