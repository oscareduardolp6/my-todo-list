/* Estado efímero de la interfaz: hoja abierta, toasts y "hoy". Nada de esto se
   persiste ni se sincroniza. */

import type { StateCreator } from 'zustand';
import { toDateKey } from '../../shared/domain/dates';
import type { DateKey } from '../../shared/domain/dates';
import type { NewTask } from '../../features/tasks/domain/task';
import type { Deps } from '../dependencies';
import type { AppStore } from './index';

export type Toast = {
  readonly id: string;
  readonly message: string;
  readonly kind: 'info' | 'error';
  /** Acción opcional del toast; hoy solo "Deshacer". */
  readonly action?: { readonly label: string; readonly run: () => void };
};

export type TaskEditorState =
  | { readonly mode: 'new'; readonly defaults: Partial<NewTask> }
  | { readonly mode: 'edit'; readonly taskId: string };

export type ProjectEditorState = { readonly mode: 'new' } | { readonly mode: 'edit'; readonly projectId: string };

export type UiSlice = {
  /** El día de hoy (local). Se refresca solo: una PWA puede quedar abierta días. */
  today: DateKey;
  toasts: Toast[];
  taskEditor: TaskEditorState | null;
  projectEditor: ProjectEditorState | null;
  /** Tarea cuyo selector de fecha (reagendar) está abierto. */
  rescheduleTaskId: string | null;
  searchOpen: boolean;
  shortcutsOpen: boolean;
  refreshToday: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  openTaskEditor: (state: TaskEditorState) => void;
  closeTaskEditor: () => void;
  openProjectEditor: (state: ProjectEditorState) => void;
  closeProjectEditor: () => void;
  openReschedule: (taskId: string) => void;
  closeReschedule: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
};

const MAX_TOASTS = 3;

export const createUiSlice =
  (deps: Deps): StateCreator<AppStore, [], [], UiSlice> =>
  (set, get) => ({
    today: toDateKey(deps.clock()),
    toasts: [],
    taskEditor: null,
    projectEditor: null,
    rescheduleTaskId: null,
    searchOpen: false,
    shortcutsOpen: false,
    refreshToday: () => {
      const today = toDateKey(deps.clock());
      if (today !== get().today) set({ today });
    },
    pushToast: (toast) =>
      set((s) => ({ toasts: [...s.toasts, { ...toast, id: deps.idGenerator('toast') }].slice(-MAX_TOASTS) })),
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    openTaskEditor: (taskEditor) => set({ taskEditor }),
    closeTaskEditor: () => set({ taskEditor: null }),
    openProjectEditor: (projectEditor) => set({ projectEditor }),
    closeProjectEditor: () => set({ projectEditor: null }),
    openReschedule: (rescheduleTaskId) => set({ rescheduleTaskId }),
    closeReschedule: () => set({ rescheduleTaskId: null }),
    openSearch: () => set({ searchOpen: true }),
    closeSearch: () => set({ searchOpen: false }),
    openShortcuts: () => set({ shortcutsOpen: true }),
    closeShortcuts: () => set({ shortcutsOpen: false }),
  });
