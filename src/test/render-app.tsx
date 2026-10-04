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
import type { Settings } from '../features/settings/domain/settings';
import type { Task } from '../features/tasks/domain/task';
import {
  createInMemoryProjectRepository,
  createInMemorySettingsRepository,
  createInMemoryTaskRepository,
} from './in-memory';
import { noon } from './factories';

export const TEST_TODAY = '2026-09-29';

type Seed = {
  tasks?: Task[];
  projects?: Project[];
  settings?: Settings;
  /** Instante del reloj fijo; por defecto, mediodía de `TEST_TODAY`. */
  now?: number;
};

export const createTestDeps = (seed: Seed = {}) => {
  let n = 0;
  const downloads: { filename: string; content: string }[] = [];
  const clipboard: string[] = [];
  const taskRepository = createInMemoryTaskRepository(seed.tasks);
  const projectRepository = createInMemoryProjectRepository(seed.projects);
  const settingsRepository = createInMemorySettingsRepository(seed.settings);
  const deps: Deps = createDeps({
    taskRepository,
    projectRepository,
    settingsRepository,
    clock: () => seed.now ?? noon(TEST_TODAY),
    downloadFile: (filename, content) => void downloads.push({ filename, content }),
    idGenerator: (prefix = 'id') => `${prefix}_${++n}`,
    copyText: async (text) => void clipboard.push(text),
    authGateway: {
      signInWithGoogle: async () => undefined,
      signOut: async () => undefined,
      onAuthStateChanged: () => () => undefined,
      quickCaptureConnection: () => ({ apiKey: 'test-key', projectId: 'test-project', refreshToken: 'test-refresh' }),
    },
  });
  return { deps, taskRepository, projectRepository, settingsRepository, downloads, clipboard };
};

const auth = { user: { uid: 'u1', email: 'test@example.com', displayName: 'Test' }, signIn: () => undefined, signOut: () => undefined, signInError: null };

export const renderApp = (seed?: Seed, hash = '#/hoy') => {
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
