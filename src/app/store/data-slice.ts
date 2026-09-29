/* Campos "de datos": lo que llega de Firestore en tiempo real. Los slices de
   `features/<f>/store/` aportan solo ACCIONES sobre estos campos. */

import type { StateCreator } from 'zustand';
import type { Project } from '../../features/projects/domain/project';
import { DEFAULT_SETTINGS } from '../../features/settings/domain/settings';
import type { Settings } from '../../features/settings/domain/settings';
import type { Task } from '../../features/tasks/domain/task';
import { messageFor } from '../../shared/domain/errors';
import type { Unsubscribe } from '../../shared/domain/ports';
import { subscribeToData } from '../application/subscribe-to-data';
import type { Deps } from '../dependencies';
import { runRIO } from '../run';
import type { AppStore } from './index';

export type DataSlice = {
  tasks: Task[];
  /** Solo los del usuario; la bandeja de entrada es virtual (`withInbox`). */
  projects: Project[];
  settings: Settings;
  /** Cada colección marca cuándo llegó su primer snapshot. */
  loaded: { tasks: boolean; projects: boolean; settings: boolean };
  syncError: string | null;
  /** Abre la sincronización en tiempo real; devuelve cómo cerrarla. */
  startSync: () => Unsubscribe;
};

export const createDataSlice =
  (deps: Deps): StateCreator<AppStore, [], [], DataSlice> =>
  (set, get) => ({
    tasks: [],
    projects: [],
    settings: DEFAULT_SETTINGS,
    loaded: { tasks: false, projects: false, settings: false },
    syncError: null,
    startSync: () =>
      runRIO(
        subscribeToData({
          onTasks: (tasks) => set((s) => ({ tasks, loaded: { ...s.loaded, tasks: true }, syncError: null })),
          onProjects: (projects) => set((s) => ({ projects, loaded: { ...s.loaded, projects: true } })),
          onSettings: (settings) => set((s) => ({ settings, loaded: { ...s.loaded, settings: true } })),
          onError: (error) => {
            set({ syncError: messageFor(error) });
            get().pushToast({ message: 'Sin conexión con el servidor. Trabajando con los datos guardados.', kind: 'error' });
          },
        }),
        deps,
      ),
  });
