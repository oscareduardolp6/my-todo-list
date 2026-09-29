import type { Unsubscribe } from '../../../shared/domain/ports';
import type { Project } from './project';

export type ProjectRepository = {
  subscribe: (onData: (projects: Project[]) => void, onError: (cause: unknown) => void) => Unsubscribe;
  save: (project: Project) => Promise<void>;
  remove: (id: string) => Promise<void>;
};
