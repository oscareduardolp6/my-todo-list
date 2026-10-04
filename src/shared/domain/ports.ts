/* Puertos compartidos. Los de cada feature (repositorios) viven en su propio
   `domain/ports.ts`; aquí solo lo que usan varias. */

export type Clock = () => number;
export type IdGenerator = (prefix?: string) => string;
export type Unsubscribe = () => void;

export type AuthUser = {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
};

/** Lo que otra herramienta (el comando de Raycast) necesita para escribir como el
 *  usuario: la config pública de Firebase y el refresh token de su sesión. */
export type QuickCaptureConnection = {
  readonly apiKey: string;
  readonly projectId: string;
  readonly refreshToken: string;
};

export type AuthGateway = {
  signInWithGoogle: () => Promise<void>;
  /** La conexión de la sesión actual; lanza si no hay sesión. */
  quickCaptureConnection: () => QuickCaptureConnection;
  signOut: () => Promise<void>;
  onAuthStateChanged: (cb: (user: AuthUser | null) => void, onError?: (message: string) => void) => Unsubscribe;
};
