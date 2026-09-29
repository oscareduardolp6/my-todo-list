import { AuthGate } from './auth-context';
import { productionDeps } from './dependencies';
import type { Deps } from './dependencies';
import { AppStoreProvider } from './store-context';
import { AppShell } from './ui/AppShell';

/** Sesión primero (`AuthGate`), luego store + sincronización, luego la UI. */
export function App({ deps = productionDeps }: { deps?: Deps }) {
  return (
    <AuthGate deps={deps}>
      <AppStoreProvider deps={deps}>
        <AppShell />
      </AppStoreProvider>
    </AuthGate>
  );
}
