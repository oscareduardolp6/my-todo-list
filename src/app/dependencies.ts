/* Composition root: el único lugar donde se elige una implementación concreta
   de cada puerto. Es un record de funciones, no un contenedor de inyección: un
   test llama `createDeps({ taskRepository: enMemoria, clock: () => 0 })` y
   sobreescribe solo lo que le importa. */

import { firestoreProjectRepository } from '../features/projects/infrastructure/firestore-project-repository';
import type { ProjectRepository } from '../features/projects/domain/ports';
import { firestoreSettingsRepository } from '../features/settings/infrastructure/firestore-settings-repository';
import { createLocalSettingsRepository } from '../features/settings/infrastructure/local-settings-repository';
import type { SettingsRepository } from '../features/settings/domain/ports';
import { firestoreTaskRepository } from '../features/tasks/infrastructure/firestore-task-repository';
import type { TaskRepository } from '../features/tasks/domain/ports';
import { uid } from '../shared/domain/ids';
import type { AuthGateway, Clock, IdGenerator } from '../shared/domain/ports';
import { browserAuthGateway } from '../shared/infrastructure/auth';
import { copyText } from '../shared/infrastructure/copy-text';
import { downloadFile } from '../shared/infrastructure/download-file';
import { createLocalCollection } from '../shared/infrastructure/local-storage';
import { buildDemoData } from './demo-data';
import type { Project } from '../features/projects/domain/project';
import type { Task } from '../features/tasks/domain/task';

export type Deps = {
  readonly taskRepository: TaskRepository;
  readonly projectRepository: ProjectRepository;
  readonly settingsRepository: SettingsRepository;
  /** Sesión de Google. Vive en `Deps` para poder inyectarla en test. */
  readonly authGateway: AuthGateway;
  /** `Date.now` inyectado: vuelve deterministas los timestamps y el "hoy". */
  readonly clock: Clock;
  /** `uid` inyectado: vuelve deterministas los ids en test. */
  readonly idGenerator: IdGenerator;
  /** Entrega un archivo de texto al usuario (el respaldo). Inyectable en test. */
  readonly downloadFile: (filename: string, content: string) => void;
  /** Copia un texto al portapapeles. Inyectable en test. */
  readonly copyText: (text: string) => Promise<void>;
};

export const productionDeps: Deps = {
  taskRepository: firestoreTaskRepository,
  projectRepository: firestoreProjectRepository,
  settingsRepository: firestoreSettingsRepository,
  authGateway: browserAuthGateway,
  clock: () => Date.now(),
  idGenerator: uid,
  downloadFile,
  copyText,
};

/** Modo demo (sin sesión): los mismos casos de uso sobre `localStorage`, con
 *  datos de ejemplo la primera vez. Nada sale del navegador. */
export const createDemoDeps = (base: Deps = productionDeps): Deps => {
  let data: ReturnType<typeof buildDemoData> | null = null;
  const seed = () => (data ??= buildDemoData(base.clock()));
  return {
    ...base,
    taskRepository: createLocalCollection<Task>('todo.demo.tasks', () => seed().tasks),
    projectRepository: createLocalCollection<Project>('todo.demo.projects', () => seed().projects),
    settingsRepository: createLocalSettingsRepository('todo.demo.settings'),
  };
};

/** Las de producción con lo que se le pase encima. Pensado para tests. */
export const createDeps = (overrides: Partial<Deps> = {}): Deps => ({ ...productionDeps, ...overrides });
