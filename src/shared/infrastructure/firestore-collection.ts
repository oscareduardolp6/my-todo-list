/* Piezas comunes de los repositorios de Firestore. Todo cuelga de
   `todo/{uid}/…`, un árbol propio dentro del proyecto compartido con Hilo. */

import { collection, doc } from 'firebase/firestore';
import { currentUid, db } from './firebase';

export const userCollection = (name: string) => collection(db(), 'todo', currentUid(), name);

export const userDoc = (collectionName: string, id: string) => doc(db(), 'todo', currentUid(), collectionName, id);
