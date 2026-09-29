/* Sesión de Google: la única capa que vive FUERA del store de zustand.

   Los repositorios de Firestore necesitan el `uid` de la sesión, así que ésta
   debe resolverse ANTES de montar `AppStoreProvider` (que abre las
   suscripciones); no puede ser un slice más. */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../shared/domain/ports';
import type { Deps } from './dependencies';
import { LoginScreen } from './ui/LoginScreen';

export type AuthContextValue = { user: AuthUser; signOut: () => void };

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthGate>');
  return ctx;
}

type Status =
  | { kind: 'resolving' }
  | { kind: 'loggedOut' }
  | { kind: 'ready'; user: AuthUser }
  /** Config de Firebase ausente/inválida (falta `.env.local`, ver README.md):
   *  mejor un mensaje claro que una pantalla en blanco. */
  | { kind: 'error'; message: string };

function CenteredMessage({ children }: { children: ReactNode }) {
  return <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">{children}</div>;
}

export function AuthGate({ deps, children }: { deps: Deps; children: ReactNode }) {
  const [status, setStatus] = useState<Status>({ kind: 'resolving' });
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    try {
      return deps.authGateway.onAuthStateChanged(
        (user) => setStatus(user ? { kind: 'ready', user } : { kind: 'loggedOut' }),
        setSignInError,
      );
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : String(e) });
      return undefined;
    }
  }, [deps]);

  if (status.kind === 'resolving') return <CenteredMessage>Cargando…</CenteredMessage>;

  if (status.kind === 'error') {
    return (
      <CenteredMessage>
        <p>
          No se pudo conectar con Firebase.
          <br />
          Revisa la configuración en <code>.env.local</code> (ver README.md).
          <br />
          <span className="text-faint">{status.message}</span>
        </p>
      </CenteredMessage>
    );
  }

  if (status.kind === 'loggedOut') {
    return (
      <LoginScreen
        error={signInError}
        onSignIn={() => {
          setSignInError(null);
          deps.authGateway.signInWithGoogle().catch((e) => setSignInError(e instanceof Error ? e.message : String(e)));
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ user: status.user, signOut: () => void deps.authGateway.signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}
