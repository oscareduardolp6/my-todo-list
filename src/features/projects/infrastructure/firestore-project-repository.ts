import { deleteDoc, onSnapshot, setDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { userCollection, userDoc } from '../../../shared/infrastructure/firestore-collection';
import { asNumber, asString } from '../../../shared/infrastructure/firestore-parse';
import type { Project } from '../domain/project';
import type { ProjectRepository } from '../domain/ports';

const COLLECTION = 'projects';

export const projectFromDoc = (id: string, data: DocumentData): Project => ({
  id,
  name: asString(data.name, '(sin nombre)'),
  color: asString(data.color, '#3b82f6'),
  order: asNumber(data.order),
  createdAt: asNumber(data.createdAt),
  updatedAt: asNumber(data.updatedAt),
});

export const firestoreProjectRepository: ProjectRepository = {
  subscribe: (onData, onError) =>
    onSnapshot(
      userCollection(COLLECTION),
      (snap) =>
        onData(
          snap.docs.map((d) => projectFromDoc(d.id, d.data())).sort((a, b) => a.order - b.order || a.createdAt - b.createdAt),
        ),
      onError,
    ),
  save: (project) => setDoc(userDoc(COLLECTION, project.id), project),
  remove: (id) => deleteDoc(userDoc(COLLECTION, id)),
};
