import type { StateCreator } from 'zustand';
import type { Deps } from '../../../app/dependencies';
import { runRTE } from '../../../app/run';
import type { AppStore } from '../../../app/store';
import { settle } from '../../../app/store/run-outcome';
import { createProject } from '../application/create-project';
import { deleteProject } from '../application/delete-project';
import { updateProject } from '../application/update-project';
import type { NewProject, Project, ProjectPatch } from '../domain/project';

export type ProjectsSlice = {
  /** Devuelve el proyecto creado (o `null` si falló) para poder navegar a él. */
  createProject: (input: NewProject) => Promise<Project | null>;
  editProject: (project: Project, patch: ProjectPatch) => Promise<void>;
  /** Sus tareas pasan a la bandeja de entrada. */
  removeProject: (project: Project) => Promise<void>;
};

export const createProjectsSlice =
  (deps: Deps): StateCreator<AppStore, [], [], ProjectsSlice> =>
  (_set, get) => ({
    createProject: async (input) => {
      let created: Project | null = null;
      settle<Project>(get, (p) => (created = p))(await runRTE(createProject(get().projects, input), deps));
      return created;
    },
    editProject: async (project, patch) => {
      settle<Project>(get)(await runRTE(updateProject(project, patch), deps));
    },
    removeProject: async (project) => {
      settle<void>(get, () => get().pushToast({ message: 'Proyecto eliminado', kind: 'info' }))(
        await runRTE(deleteProject(project, get().tasks), deps),
      );
    },
  });
