import type { StateCreator } from 'zustand';
import type { Deps } from '../../../app/dependencies';
import { runRTE } from '../../../app/run';
import type { AppStore } from '../../../app/store';
import { settle } from '../../../app/store/run-outcome';
import { updateSettings } from '../application/update-settings';
import type { Settings, SettingsPatch } from '../domain/settings';

export type SettingsSlice = {
  changeSettings: (patch: SettingsPatch) => void;
};

export const createSettingsSlice =
  (deps: Deps): StateCreator<AppStore, [], [], SettingsSlice> =>
  (set, get) => ({
    changeSettings: (patch) => {
      // Optimista: el tema se ve al instante, sin esperar al servidor.
      set((s) => ({ settings: { ...s.settings, ...patch } }));
      void runRTE(updateSettings(get().settings, patch), deps).then(settle<Settings>(get));
    },
  });
