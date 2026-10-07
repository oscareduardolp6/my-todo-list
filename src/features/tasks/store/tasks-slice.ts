/* Acciones sobre tareas. Es el único lugar (junto con los demás slices) que
   corre casos de uso.

   Completar y borrar son OPTIMISTAS: el toast con "Deshacer" se publica antes
   de esperar al servidor. Con Firestore offline la escritura queda pendiente
   hasta reconectar, y esperar la confirmación dejaría sin toast (y sin
   deshacer) justo cuando no hay red. El snapshot que captura el toast es el
   estado previo completo, así que deshacer restaura fechas y conteos tal cual. */

import type { StateCreator } from 'zustand';
import { formatShort } from '../../../shared/domain/dates';
import type { DateKey } from '../../../shared/domain/dates';
import type { Deps } from '../../../app/dependencies';
import { runRTE } from '../../../app/run';
import type { AppStore } from '../../../app/store';
import { settle } from '../../../app/store/run-outcome';
import { addTask } from '../application/add-task';
import { completeTask } from '../application/complete-task';
import { deleteTask } from '../application/delete-task';
import { finishSeries } from '../application/finish-series';
import { restoreTask } from '../application/restore-task';
import { skipOccurrence } from '../application/skip-occurrence';
import { uncompleteTask } from '../application/uncomplete-task';
import { updateTask } from '../application/update-task';
import { advanceTask, isRecurring, occurrenceId } from '../domain/task';
import type { NewTask, Task, TaskPatch } from '../domain/task';

export type TasksSlice = {
  createTask: (input: NewTask) => Promise<void>;
  editTask: (task: Task, patch: TaskPatch) => Promise<void>;
  /** Cambia solo `scheduledFor` (`null` = sin fecha), con toast de deshacer. */
  rescheduleTask: (task: Task, date: DateKey | null) => void;
  /** Completa (con toast de deshacer) o reabre, según el estado actual. */
  toggleTask: (task: Task) => void;
  removeTask: (task: Task) => void;
  /** Recurrente: salta a la siguiente fecha sin marcar nada como hecho. */
  skipTask: (task: Task) => void;
  /** Recurrente que ya terminó: la completa y deja de repetirla, sin borrarla. */
  finishTaskSeries: (task: Task) => void;
  /** Restaura el snapshot y quita los documentos que la acción creó (copia histórica). */
  restoreTask: (snapshot: Task, alsoRemove?: readonly string[]) => void;
};

export const createTasksSlice =
  (deps: Deps): StateCreator<AppStore, [], [], TasksSlice> =>
  (_set, get) => ({
    createTask: async (input) => {
      settle<Task>(get, () => get().pushToast({ message: 'Tarea añadida', kind: 'info' }))(
        await runRTE(addTask(input), deps),
      );
    },

    editTask: async (task, patch) => {
      settle<Task>(get)(await runRTE(updateTask(task, patch), deps));
    },

    rescheduleTask: (task, date) => {
      if (date === task.scheduledFor) return;
      // Optimista, como completar: el toast no espera al servidor.
      get().pushToast({
        message: date ? `Reagendada · ${formatShort(date, get().today)}` : 'Fecha quitada',
        kind: 'info',
        action: { label: 'Deshacer', run: () => get().restoreTask(task) },
      });
      void runRTE(updateTask(task, { scheduledFor: date }), deps).then(settle<Task>(get));
    },

    toggleTask: (task) => {
      if (task.completedAt !== null) {
        void runRTE(uncompleteTask(task), deps).then(settle<Task>(get));
        return;
      }
      const recurring = isRecurring(task);
      const next = recurring ? advanceTask(task, get().dayNow(), deps.clock()).scheduledFor : null;
      get().pushToast({
        message: next ? `Tarea completada · se repite ${formatShort(next, get().today)}` : 'Tarea completada',
        kind: 'info',
        action: { label: 'Deshacer', run: () => get().restoreTask(task, recurring ? [occurrenceId(task)] : []) },
      });
      void runRTE(completeTask(task, get().dayNow()), deps).then(settle<Task>(get));
    },

    removeTask: (task) => {
      get().pushToast({
        message: 'Tarea eliminada',
        kind: 'info',
        action: { label: 'Deshacer', run: () => get().restoreTask(task) },
      });
      void runRTE(deleteTask(task.id), deps).then(settle<void>(get));
    },

    skipTask: (task) => {
      if (!isRecurring(task)) return;
      get().pushToast({
        message: 'Ocurrencia omitida',
        kind: 'info',
        action: { label: 'Deshacer', run: () => get().restoreTask(task) },
      });
      void runRTE(skipOccurrence(task, get().dayNow()), deps).then(settle<Task>(get));
    },

    finishTaskSeries: (task) => {
      if (!isRecurring(task)) return;
      get().pushToast({
        message: 'Tarea completada · ya no se repite',
        kind: 'info',
        action: { label: 'Deshacer', run: () => get().restoreTask(task) },
      });
      void runRTE(finishSeries(task, get().dayNow()), deps).then(settle<Task>(get));
    },

    restoreTask: (snapshot, alsoRemove) => {
      void runRTE(restoreTask(snapshot, alsoRemove), deps).then(settle<Task>(get));
    },
  });
