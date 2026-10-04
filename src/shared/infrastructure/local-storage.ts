/* Almacenamiento local para el modo demo (sin cuenta): un valor JSON guardado en
   `localStorage` bajo una llave, con las mismas garantías de tiempo real que los
   repositorios de Firestore (los suscriptores reciben el valor completo tras cada
   cambio, también el hecho desde otra pestaña).

   Si `localStorage` no está disponible (modo privado, cuota llena) la app sigue
   funcionando: el valor vive en memoria y solo se pierde al recargar. */

import type { Unsubscribe } from '../domain/ports';

export type LocalValue<T> = {
  get: () => T;
  set: (value: T) => void;
  subscribe: (onData: (value: T) => void) => Unsubscribe;
};

const browserStorage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** `initial` se usa (y se persiste) la primera vez, y si lo guardado está
 *  corrupto o no pasa `isValid`. */
export const createLocalValue = <T>(
  key: string,
  initial: () => T,
  isValid: (raw: unknown) => raw is T,
  storage: Storage | null = browserStorage(),
): LocalValue<T> => {
  const listeners = new Set<(value: T) => void>();
  let current: { value: T } | null = null;

  const persist = (value: T) => {
    try {
      storage?.setItem(key, JSON.stringify(value));
    } catch {
      // Cuota llena o storage bloqueado: queda en memoria.
    }
  };

  const load = (): T => {
    if (current) return current.value;
    let value: T | undefined;
    try {
      const raw = storage?.getItem(key);
      if (raw != null) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) value = parsed;
      }
    } catch {
      // JSON corrupto: se vuelve a sembrar.
    }
    if (value === undefined) {
      value = initial();
      persist(value);
    }
    current = { value };
    return value;
  };

  const emit = () => {
    const value = load();
    listeners.forEach((l) => l(value));
  };

  // Otra pestaña escribió: se descarta la copia en memoria y se relee.
  const onStorage = (e: StorageEvent) => {
    if (e.storageArea !== storage || (e.key !== null && e.key !== key)) return;
    current = null;
    emit();
  };

  return {
    get: load,
    set: (value) => {
      current = { value };
      persist(value);
      emit();
    },
    subscribe: (onData) => {
      if (listeners.size === 0) window.addEventListener('storage', onStorage);
      listeners.add(onData);
      onData(load());
      return () => {
        listeners.delete(onData);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
      };
    },
  };
};

type Entity = { readonly id: string };

/** Colección de entidades con `id` (tareas, proyectos) sobre un `LocalValue`.
 *  Cumple `TaskRepository` y `ProjectRepository` tal cual. */
export const createLocalCollection = <T extends Entity>(key: string, seed: () => readonly T[] = () => []) => {
  const store = createLocalValue<readonly T[]>(key, seed, (raw): raw is readonly T[] => Array.isArray(raw));
  const upsert = (items: readonly T[]) => {
    const byId = new Map(store.get().map((i) => [i.id, i]));
    items.forEach((i) => byId.set(i.id, i));
    store.set([...byId.values()]);
  };
  return {
    subscribe: (onData: (items: T[]) => void, _onError?: (cause: unknown) => void): Unsubscribe =>
      store.subscribe((items) => onData([...items])),
    save: async (item: T) => upsert([item]),
    saveMany: async (items: readonly T[]) => upsert(items),
    remove: async (id: string) => store.set(store.get().filter((i) => i.id !== id)),
  };
};
