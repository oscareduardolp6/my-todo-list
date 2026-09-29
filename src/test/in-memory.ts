/* Dobles en memoria de los repositorios, con la misma semántica de tiempo real
   que Firestore (los suscriptores reciben la lista completa tras cada cambio,
   de forma síncrona). Sirven en test y son la prueba de que el resto del código
   no sabe qué hay detrás de los puertos. */

import type { ProjectRepository } from '../features/projects/domain/ports';
import type { Project } from '../features/projects/domain/project';
import type { SettingsRepository } from '../features/settings/domain/ports';
import { DEFAULT_SETTINGS } from '../features/settings/domain/settings';
import type { Settings } from '../features/settings/domain/settings';
import type { TaskRepository } from '../features/tasks/domain/ports';
import type { Task } from '../features/tasks/domain/task';
import type { Unsubscribe } from '../shared/domain/ports';

type Entity = { readonly id: string };

const createStore = <T extends Entity>(initial: readonly T[]) => {
  const items = new Map<string, T>(initial.map((i) => [i.id, i]));
  const listeners = new Set<(items: T[]) => void>();
  const snapshot = () => [...items.values()];
  const emit = () => listeners.forEach((l) => l(snapshot()));
  return {
    snapshot,
    subscribe: (onData: (items: T[]) => void): Unsubscribe => {
      listeners.add(onData);
      onData(snapshot());
      return () => void listeners.delete(onData);
    },
    put: (item: T) => {
      items.set(item.id, item);
      emit();
    },
    putMany: (many: readonly T[]) => {
      many.forEach((i) => items.set(i.id, i));
      emit();
    },
    remove: (id: string) => {
      items.delete(id);
      emit();
    },
  };
};

export type InMemoryTaskRepository = TaskRepository & { snapshot: () => Task[] };
export const createInMemoryTaskRepository = (initial: readonly Task[] = []): InMemoryTaskRepository => {
  const store = createStore(initial);
  return {
    snapshot: store.snapshot,
    subscribe: (onData) => store.subscribe(onData),
    save: async (task) => store.put(task),
    saveMany: async (tasks) => store.putMany(tasks),
    remove: async (id) => store.remove(id),
  };
};

export type InMemoryProjectRepository = ProjectRepository & { snapshot: () => Project[] };
export const createInMemoryProjectRepository = (initial: readonly Project[] = []): InMemoryProjectRepository => {
  const store = createStore(initial);
  return {
    snapshot: store.snapshot,
    subscribe: (onData) => store.subscribe(onData),
    save: async (project) => store.put(project),
    remove: async (id) => store.remove(id),
  };
};

export type InMemorySettingsRepository = SettingsRepository & { current: () => Settings };
export const createInMemorySettingsRepository = (initial: Settings = DEFAULT_SETTINGS): InMemorySettingsRepository => {
  let value = initial;
  const listeners = new Set<(s: Settings) => void>();
  return {
    current: () => value,
    subscribe: (onData) => {
      listeners.add(onData);
      onData(value);
      return () => void listeners.delete(onData);
    },
    save: async (settings) => {
      value = settings;
      listeners.forEach((l) => l(value));
    },
  };
};
