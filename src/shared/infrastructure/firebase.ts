/* Inicialización perezosa del SDK de Firebase, con la misma config
   (`VITE_FIREBASE_*`) que Hilo. La config no es secreta: identifica el
   proyecto, no autoriza nada; lo protegen las reglas de `firestore.rules`.

   `auth()`/`db()` son perezosos para que importar este archivo en test no
   inicialice el SDK: ahí `Deps` siempre se sobreescribe con dobles en memoria. */

import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | null = null;
function app(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }
  return firebaseApp;
}

let authInstance: Auth | null = null;
export function auth(): Auth {
  if (!authInstance) authInstance = getAuth(app());
  return authInstance;
}

/* Caché persistente en IndexedDB: es lo que hace la app offline-first. Las
   escrituras se aplican al instante en local (los listeners reciben el cambio
   antes de que llegue el servidor) y se suben solas al volver la conexión.
   `persistentMultipleTabManager` permite tener la PWA y una pestaña abiertas. */
let dbInstance: Firestore | null = null;
export function db(): Firestore {
  if (!dbInstance) {
    dbInstance = initializeFirestore(app(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  }
  return dbInstance;
}

/** Devuelve el uid de la sesión o lanza: los repositorios lo resuelven en cada
 *  llamada, así que nunca se construyen con un uid fijo. */
export function currentUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('No hay sesión iniciada');
  return uid;
}

export const googleProvider = new GoogleAuthProvider();
