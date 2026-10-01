/* Composition root: el único lugar donde se elige una implementación concreta
   de cada puerto. Es un record de funciones, no un contenedor de inyección: un
   test llama `createDeps({ taskRepository: enMemoria, clock: () => 0 })` y
   sobreescribe solo lo que le importa. */

import { firestoreProjectRepository } from '../features/projects/infrastructure/firestore-project-repository';
import type { ProjectRepository } from '../features/projects/domain/ports';
import { firestoreSettingsRepository } from '../features/settings/infrastructure/firestore-settings-repository';
import type { SettingsRepository } from '../features/settings/domain/ports';
import { firestoreTaskRepository } from '../features/tasks/infrastructure/firestore-task-repository';
import type { TaskRepository } from '../features/tasks/domain/ports';
import { uid } from '../shared/domain/ids';
import type { AuthGateway, Clock, IdGenerator } from '../shared/domain/ports';
import { browserAuthGateway } from '../shared/infrastructure/auth';
import { downloadFile } from '../shared/infrastructure/download-file';

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
};

export const productionDeps: Deps = {
  taskRepository: firestoreTaskRepository,
  projectRepository: firestoreProjectRepository,
  settingsRepository: firestoreSettingsRepository,
  authGateway: browserAuthGateway,
  clock: () => Date.now(),
  idGenerator: uid,
  downloadFile,
};

/** Las de producción con lo que se le pase encima. Pensado para tests. */
export const createDeps = (overrides: Partial<Deps> = {}): Deps => ({ ...productionDeps, ...overrides });
