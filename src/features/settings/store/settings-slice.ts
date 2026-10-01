import type { StateCreator } from 'zustand';
import type { Deps } from '../../../app/dependencies';
import { runRTE } from '../../../app/run';
import type { AppStore } from '../../../app/store';
import { settle } from '../../../app/store/run-outcome';
import { exportBackup } from '../application/export-backup';
import { importBackup } from '../application/import-backup';
import { updateSettings } from '../application/update-settings';
import { parseBackup } from '../domain/backup';
import type { Backup } from '../domain/backup';
import type { Settings, SettingsPatch } from '../domain/settings';

export type SettingsSlice = {
  changeSettings: (patch: SettingsPatch) => void;
  /** Descarga un respaldo (tareas y proyectos) como archivo JSON. */
  downloadBackup: () => Promise<void>;
  /** Valida el texto de un archivo; devuelve el respaldo (o `null` con un toast de error). */
  readBackup: (text: string) => Backup | null;
  /** Reemplaza TODOS los datos por los del respaldo. */
  restoreBackup: (backup: Backup) => Promise<void>;
};

export const createSettingsSlice =
  (deps: Deps): StateCreator<AppStore, [], [], SettingsSlice> =>
  (set, get) => ({
    changeSettings: (patch) => {
      // Optimista: el tema se ve al instante, sin esperar al servidor.
      set((s) => ({ settings: { ...s.settings, ...patch } }));
      void runRTE(updateSettings(get().settings, patch), deps).then(settle<Settings>(get));
    },
    downloadBackup: async () => {
      const { tasks, projects } = get();
      settle<void>(get, () => get().pushToast({ message: 'Respaldo descargado', kind: 'info' }))(
        await runRTE(exportBackup(tasks, projects), deps),
      );
    },
    readBackup: (text) => {
      let backup: Backup | null = null;
      settle<Backup>(get, (b) => (backup = b))(parseBackup(text));
      return backup;
    },
    restoreBackup: async (backup) => {
      const { tasks, projects } = get();
      settle<Backup>(get, () => get().pushToast({ message: 'Respaldo restaurado', kind: 'info' }))(
        await runRTE(importBackup(backup, tasks, projects), deps),
      );
    },
  });
