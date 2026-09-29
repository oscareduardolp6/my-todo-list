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

export type AuthGateway = {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (cb: (user: AuthUser | null) => void, onError?: (message: string) => void) => Unsubscribe;
};
