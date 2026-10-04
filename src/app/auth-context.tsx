/* Sesión de Google: la única capa que vive FUERA del store de zustand.

   Los repositorios de Firestore necesitan el `uid` de la sesión, así que ésta
   debe resolverse ANTES de montar `AppStoreProvider` (que abre las
   suscripciones); no puede ser un slice más.

   Sin sesión no hay pantalla de login: la app abre en modo demo, con
   repositorios en `localStorage` (`createDemoDeps`). Al iniciar sesión se monta
   otro store sobre Firestore; al cerrarla se vuelve al demo. */

import { Fragment, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../shared/domain/ports';
import { createDemoDeps } from './dependencies';
import type { Deps } from './dependencies';

export type AuthContextValue = {
  /** `null` = modo demo (sin cuenta, datos solo en este navegador). */
  user: AuthUser | null;
  signIn: () => void;
  signOut: () => void;
  /** Último fallo al iniciar sesión, para mostrarlo en el modo demo. */
  signInError: string | null;
};

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

export type AuthGateProps = {
  deps: Deps;
  /** Dependencias del modo demo; por defecto, las locales de `createDemoDeps`. */
  demoDeps?: Deps;
  /** Recibe las `Deps` que corresponden a la sesión (Firestore o demo). */
  children: (deps: Deps) => ReactNode;
};

export function AuthGate({ deps, demoDeps, children }: AuthGateProps) {
  const [status, setStatus] = useState<Status>({ kind: 'resolving' });
  const [signInError, setSignInError] = useState<string | null>(null);
  const demo = useMemo(() => demoDeps ?? createDemoDeps(deps), [demoDeps, deps]);

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

  const value = useMemo<AuthContextValue | null>(() => {
    if (status.kind !== 'ready' && status.kind !== 'loggedOut') return null;
    return {
      user: status.kind === 'ready' ? status.user : null,
      signIn: () => {
        setSignInError(null);
        deps.authGateway.signInWithGoogle().catch((e) => setSignInError(e instanceof Error ? e.message : String(e)));
      },
      signOut: () => void deps.authGateway.signOut(),
      signInError,
    };
  }, [status, deps, signInError]);

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

  const account = status.kind === 'ready';
  return (
    <AuthContext.Provider value={value}>
      {/* `key`: cada sesión monta su propio store; si no, React reusaría el del demo. */}
      <Fragment key={account ? status.user.uid : 'demo'}>{children(account ? deps : demo)}</Fragment>
    </AuthContext.Provider>
  );
}
