import { AuthGate } from './auth-context';
import { productionDeps } from './dependencies';
import type { Deps } from './dependencies';
import { AppStoreProvider } from './store-context';
import { AppShell } from './ui/AppShell';

/** Sesión primero (`AuthGate`, que decide entre Firestore y el modo demo local),
 *  luego store + sincronización, luego la UI. */
export function App({ deps = productionDeps, demoDeps }: { deps?: Deps; demoDeps?: Deps }) {
  return (
    <AuthGate deps={deps} demoDeps={demoDeps}>
      {(effective) => (
        <AppStoreProvider deps={effective}>
          <AppShell />
        </AppStoreProvider>
      )}
    </AuthGate>
  );
}
