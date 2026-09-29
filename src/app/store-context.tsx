/* El store se crea POR MONTAJE y se entrega por contexto (ver `store/index.ts`). */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import { productionDeps } from './dependencies';
import type { Deps } from './dependencies';
import { createAppStore } from './store';
import type { AppStore, AppStoreApi } from './store';

const AppStoreContext = createContext<AppStoreApi | null>(null);

const TODAY_REFRESH_MS = 60_000;

export type AppStoreProviderProps = {
  children: ReactNode;
  /** Inyectar dependencias en test; en producción son las reales. */
  deps?: Deps;
};

export function AppStoreProvider({ children, deps = productionDeps }: AppStoreProviderProps) {
  const [store] = useState(() => createAppStore(deps));

  // Sincronización en tiempo real: vive mientras el store esté montado.
  useEffect(() => store.getState().startSync(), [store]);

  // "Hoy" cambia a medianoche aunque la PWA siga abierta, y al volver a
  // primer plano tras horas en segundo plano.
  useEffect(() => {
    const refresh = () => store.getState().refreshToday();
    const interval = setInterval(refresh, TODAY_REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [store]);

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStoreApi(): AppStoreApi {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('useAppStoreApi debe usarse dentro de <AppStoreProvider>');
  return store;
}

/** Suscripción con selector. Los selectores deben devolver referencias
 *  estables (campos del store): derivar listas nuevas va en `useMemo`. */
export function useAppStore<A>(selector: (state: AppStore) => A): A {
  return useStore(useAppStoreApi(), selector);
}
