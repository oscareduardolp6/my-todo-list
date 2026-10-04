/* Implementación real de `AuthGateway` sobre Firebase Auth (Google).

   Popup en el navegador normal, redirect solo en la PWA instalada: es la misma
   decisión (y la misma razón) que en Hilo — `signInWithRedirect` en un
   navegador normal se queda pegado por el bloqueo de storage de terceros, y
   `signInWithPopup` falla en modo standalone. */

import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { AuthGateway, AuthUser } from '../domain/ports';
import { auth, googleProvider } from './firebase';

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
});

let redirectChecked = false;
function ensureRedirectChecked(onError?: (message: string) => void): void {
  if (redirectChecked) return;
  redirectChecked = true;
  void getRedirectResult(auth()).catch((e) => {
    console.error('Error al completar el login con Google:', e);
    onError?.(e instanceof Error ? e.message : String(e));
  });
}

const isStandalonePwa = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;

export const browserAuthGateway: AuthGateway = {
  signInWithGoogle: async () => {
    if (isStandalonePwa()) await signInWithRedirect(auth(), googleProvider);
    else await signInWithPopup(auth(), googleProvider);
  },
  quickCaptureConnection: () => {
    const user = auth().currentUser;
    if (!user) throw new Error('No hay sesión iniciada');
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      refreshToken: user.refreshToken,
    };
  },
  signOut: () => firebaseSignOut(auth()),
  onAuthStateChanged: (cb, onError) => {
    ensureRedirectChecked(onError);
    return onAuthStateChanged(auth(), (user) => cb(user ? toAuthUser(user) : null));
  },
};
