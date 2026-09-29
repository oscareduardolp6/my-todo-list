/* Caso de uso: abrir la sincronización en tiempo real. Escucha tareas,
   proyectos y preferencias y le entrega cada cambio a los handlers; devuelve
   la función que cierra las tres suscripciones. Con la caché offline de
   Firestore, los cambios hechos desde otro dispositivo llegan aquí solos. */

import type { ReaderIO } from 'fp-ts/ReaderIO';
import type { Project } from '../../features/projects/domain/project';
import type { Settings } from '../../features/settings/domain/settings';
import type { Task } from '../../features/tasks/domain/task';
import { persistenceError } from '../../shared/domain/errors';
import type { TodoError } from '../../shared/domain/errors';
import type { Unsubscribe } from '../../shared/domain/ports';
import type { Deps } from '../dependencies';

export type DataHandlers = {
  readonly onTasks: (tasks: Task[]) => void;
  readonly onProjects: (projects: Project[]) => void;
  readonly onSettings: (settings: Settings) => void;
  readonly onError: (error: TodoError) => void;
};

export const subscribeToData =
  (handlers: DataHandlers): ReaderIO<Deps, Unsubscribe> =>
  (deps) =>
  () => {
    const onError = (cause: unknown) => handlers.onError(persistenceError(cause));
    const unsubscribers = [
      deps.taskRepository.subscribe(handlers.onTasks, onError),
      deps.projectRepository.subscribe(handlers.onProjects, onError),
      deps.settingsRepository.subscribe(handlers.onSettings, onError),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
