/* Proyectos (o secciones): Trabajo, Personal, Casa… La "Bandeja de entrada" es
   un proyecto virtual: siempre existe, no se guarda en Firestore y no se puede
   editar ni borrar. Una tarea sin proyecto explícito cae ahí. */

import { E } from '../../../shared/fp';
import type { Either } from 'fp-ts/Either';
import { validationError } from '../../../shared/domain/errors';
import type { TodoError } from '../../../shared/domain/errors';

export const INBOX_ID = 'inbox';

export type Project = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly order: number;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type NewProject = { readonly name: string; readonly color?: string };
export type ProjectPatch = Partial<NewProject>;

export const INBOX: Project = {
  id: INBOX_ID,
  name: 'Bandeja de entrada',
  color: '#8b93a3',
  order: -1,
  createdAt: 0,
  updatedAt: 0,
};

export const PROJECT_COLORS: readonly string[] = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b7cf6', '#ec4899', '#a16207', '#64748b',
];

export const MAX_PROJECT_NAME_LENGTH = 60;

const validateName = (name: string): TodoError | null => {
  if (!name) return validationError('El proyecto necesita un nombre');
  if (name.length > MAX_PROJECT_NAME_LENGTH) return validationError('El nombre es demasiado largo');
  return null;
};

export const createProject = (
  input: NewProject,
  ctx: { id: string; now: number; order: number },
): Either<TodoError, Project> => {
  const project: Project = {
    id: ctx.id,
    name: input.name.trim(),
    color: input.color ?? PROJECT_COLORS[5] ?? '#3b82f6',
    order: ctx.order,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
  const problem = validateName(project.name);
  return problem ? E.left(problem) : E.right(project);
};

export const patchProject = (project: Project, patch: ProjectPatch, now: number): Either<TodoError, Project> => {
  const next: Project = {
    ...project,
    name: patch.name === undefined ? project.name : patch.name.trim(),
    color: patch.color ?? project.color,
    updatedAt: now,
  };
  const problem = validateName(next.name);
  return problem ? E.left(problem) : E.right(next);
};

/** Bandeja primero y luego los del usuario por `order`. */
export const withInbox = (projects: readonly Project[]): Project[] => [INBOX, ...projects];

export const findProject = (projects: readonly Project[], id: string): Project | undefined =>
  withInbox(projects).find((p) => p.id === id);
