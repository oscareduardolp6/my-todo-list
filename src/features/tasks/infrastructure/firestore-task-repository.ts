/* `TaskRepository` sobre Firestore: un documento por tarea en
   `todo/{uid}/tasks/{id}`. Un documento por tarea (y no un blob como en Hilo)
   hace que dos dispositivos que editan tareas distintas no se pisen.

   Las promesas de escritura de Firestore solo resuelven cuando el SERVIDOR
   confirma, o sea que sin conexión se quedan pendientes. La UI no depende de
   ellas: los listeners ya reflejan la escritura local al instante. */

import { deleteDoc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { isDateKey } from '../../../shared/domain/dates';
import { db } from '../../../shared/infrastructure/firebase';
import { userCollection, userDoc } from '../../../shared/infrastructure/firestore-collection';
import { asNullableNumber, asNumber, asString } from '../../../shared/infrastructure/firestore-parse';
import { INBOX_ID } from '../../projects/domain/project';
import { isPriority } from '../domain/task';
import type { Task } from '../domain/task';
import type { TaskRepository } from '../domain/ports';

const COLLECTION = 'tasks';

const dateOrNull = (v: unknown) => (isDateKey(v) ? v : null);

export const taskFromDoc = (id: string, data: DocumentData): Task => {
  const completedAt = asNullableNumber(data.completedAt);
  return {
    id,
    title: asString(data.title, '(sin título)'),
    description: asString(data.description),
    priority: isPriority(data.priority) ? data.priority : 4,
    projectId: asString(data.projectId, INBOX_ID),
    scheduledFor: dateOrNull(data.scheduledFor),
    deadline: dateOrNull(data.deadline),
    rescheduleCount: asNumber(data.rescheduleCount),
    completedAt,
    completedOn: completedAt === null ? null : dateOrNull(data.completedOn),
    createdAt: asNumber(data.createdAt),
    updatedAt: asNumber(data.updatedAt),
  };
};

export const firestoreTaskRepository: TaskRepository = {
  subscribe: (onData, onError) =>
    onSnapshot(
      userCollection(COLLECTION),
      (snap) => onData(snap.docs.map((d) => taskFromDoc(d.id, d.data()))),
      onError,
    ),
  save: (task) => setDoc(userDoc(COLLECTION, task.id), task),
  saveMany: (tasks) => {
    const batch = writeBatch(db());
    for (const task of tasks) batch.set(userDoc(COLLECTION, task.id), task);
    return batch.commit();
  },
  remove: (id) => deleteDoc(userDoc(COLLECTION, id)),
};
