/* El store, compuesto por slices.

   `createStore` VANILLA, no `create`: el store se construye por montaje y se
   entrega por contexto (ver `store-context.tsx`), no como singleton de módulo,
   para que cada test arranque limpio y las dependencias se inyecten al
   construirlo. Las slices de `app/store/` aportan CAMPOS; las de
   `features/<f>/store/` aportan ACCIONES. */

import { createStore } from 'zustand/vanilla';
import { createProjectsSlice } from '../../features/projects/store/projects-slice';
import type { ProjectsSlice } from '../../features/projects/store/projects-slice';
import { createSettingsSlice } from '../../features/settings/store/settings-slice';
import type { SettingsSlice } from '../../features/settings/store/settings-slice';
import { createTasksSlice } from '../../features/tasks/store/tasks-slice';
import type { TasksSlice } from '../../features/tasks/store/tasks-slice';
import type { Deps } from '../dependencies';
import { createDataSlice } from './data-slice';
import type { DataSlice } from './data-slice';
import { createUiSlice } from './ui-slice';
import type { UiSlice } from './ui-slice';

export type AppStore = DataSlice & UiSlice & TasksSlice & ProjectsSlice & SettingsSlice;

export type AppStoreApi = ReturnType<typeof createAppStore>;

export const createAppStore = (deps: Deps) =>
  createStore<AppStore>()((...args) => ({
    ...createDataSlice(deps)(...args),
    ...createUiSlice(deps)(...args),
    ...createTasksSlice(deps)(...args),
    ...createProjectsSlice(deps)(...args),
    ...createSettingsSlice(deps)(...args),
  }));

export type { DataSlice, UiSlice, TasksSlice, ProjectsSlice, SettingsSlice };
