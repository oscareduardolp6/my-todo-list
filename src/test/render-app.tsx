/* Monta la app real (sin AuthGate) sobre repositorios en memoria y reloj/ids
   fijos. Es el punto de entrada de los tests de integración. */

import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createDeps } from '../app/dependencies';
import type { Deps } from '../app/dependencies';
import { AppStoreProvider } from '../app/store-context';
import { AppShell } from '../app/ui/AppShell';
import { AuthContext } from '../app/auth-context';
import type { Project } from '../features/projects/domain/project';
import type { Task } from '../features/tasks/domain/task';
import {
  createInMemoryProjectRepository,
  createInMemorySettingsRepository,
  createInMemoryTaskRepository,
} from './in-memory';
import { noon } from './factories';

export const TEST_TODAY = '2026-09-29';

export const createTestDeps = (seed: { tasks?: Task[]; projects?: Project[] } = {}) => {
  let n = 0;
  const downloads: { filename: string; content: string }[] = [];
  const taskRepository = createInMemoryTaskRepository(seed.tasks);
  const projectRepository = createInMemoryProjectRepository(seed.projects);
  const settingsRepository = createInMemorySettingsRepository();
  const deps: Deps = createDeps({
    taskRepository,
    projectRepository,
    settingsRepository,
    clock: () => noon(TEST_TODAY),
    downloadFile: (filename, content) => void downloads.push({ filename, content }),
    idGenerator: (prefix = 'id') => `${prefix}_${++n}`,
  });
  return { deps, taskRepository, projectRepository, settingsRepository, downloads };
};

const auth = { user: { uid: 'u1', email: 'test@example.com', displayName: 'Test' }, signOut: () => undefined };

export const renderApp = (seed?: { tasks?: Task[]; projects?: Project[] }, hash = '#/hoy') => {
  window.location.hash = hash;
  const env = createTestDeps(seed);
  const wrap = (children: ReactNode) => <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
  const view = render(
    wrap(
      <AppStoreProvider deps={env.deps}>
        <AppShell />
      </AppStoreProvider>,
    ),
  );
  return { ...view, ...env };
};
