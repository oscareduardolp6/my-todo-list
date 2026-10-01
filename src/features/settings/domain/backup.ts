/* Respaldo de datos en archivo: formato, armado y lectura estricta (puro, sin IO).

   El archivo es un JSON versionado con las tareas y los proyectos del usuario.
   La Bandeja de entrada es virtual y no se guarda; las preferencias de Ajustes
   tampoco entran. Al leer NO se es tolerante como con Firestore: un archivo
   dañado se rechaza completo antes de tocar un solo dato. */

import { E } from '../../../shared/fp';
import type { Either } from 'fp-ts/Either';
import { isDateKey, toDateKey } from '../../../shared/domain/dates';
import { validationError } from '../../../shared/domain/errors';
import type { TodoError } from '../../../shared/domain/errors';
import { INBOX_ID } from '../../projects/domain/project';
import type { Project } from '../../projects/domain/project';
import { isRecurrence } from '../../tasks/domain/recurrence';
import { isPriority } from '../../tasks/domain/task';
import type { Task } from '../../tasks/domain/task';

export const BACKUP_APP = 'my-todo-list';
export const BACKUP_VERSION = 1;

export type Backup = {
  readonly app: typeof BACKUP_APP;
  readonly version: typeof BACKUP_VERSION;
  /** Instante (epoch ms) en que se exportó. */
  readonly exportedAt: number;
  readonly tasks: readonly Task[];
  readonly projects: readonly Project[];
};

export const buildBackup = (tasks: readonly Task[], projects: readonly Project[], now: number): Backup => ({
  app: BACKUP_APP,
  version: BACKUP_VERSION,
  exportedAt: now,
  tasks,
  projects,
});

export const serializeBackup = (backup: Backup): string => JSON.stringify(backup, null, 2);

/** `todo-respaldo-2026-09-30.json` */
export const backupFileName = (now: number): string => `todo-respaldo-${toDateKey(now)}.json`;

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string';
const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const dateOrNull = (v: unknown): boolean => v === null || isDateKey(v);

const toProject = (v: unknown): Project | null =>
  isObject(v) && isNonEmpty(v.id) && isNonEmpty(v.name) && isText(v.color) && isNum(v.order) && isNum(v.createdAt) && isNum(v.updatedAt)
    ? { id: v.id, name: v.name, color: v.color, order: v.order, createdAt: v.createdAt, updatedAt: v.updatedAt }
    : null;

const toTask = (v: unknown): Task | null => {
  if (!isObject(v)) return null;
  const completedAt = v.completedAt;
  const ok =
    isNonEmpty(v.id) &&
    isNonEmpty(v.title) &&
    isText(v.description) &&
    isPriority(v.priority) &&
    isNonEmpty(v.projectId) &&
    dateOrNull(v.scheduledFor) &&
    dateOrNull(v.deadline) &&
    (v.recurrence === null || isRecurrence(v.recurrence)) &&
    isNum(v.rescheduleCount) &&
    (completedAt === null || isNum(completedAt)) &&
    dateOrNull(v.completedOn) &&
    (completedAt !== null || v.completedOn === null) &&
    isNum(v.createdAt) &&
    isNum(v.updatedAt);
  if (!ok) return null;
  return {
    id: v.id as string,
    title: v.title as string,
    description: v.description as string,
    priority: v.priority as Task['priority'],
    projectId: v.projectId as string,
    scheduledFor: v.scheduledFor as Task['scheduledFor'],
    deadline: v.deadline as Task['deadline'],
    recurrence: v.recurrence as Task['recurrence'],
    rescheduleCount: v.rescheduleCount as number,
    completedAt: completedAt as number | null,
    completedOn: v.completedOn as Task['completedOn'],
    createdAt: v.createdAt as number,
    updatedAt: v.updatedAt as number,
  };
};

const parseAll = <A>(items: unknown, read: (v: unknown) => A | null): A[] | null => {
  if (!Array.isArray(items)) return null;
  const out: A[] = [];
  for (const item of items) {
    const parsed = read(item);
    if (parsed === null) return null;
    out.push(parsed);
  }
  return out;
};

const unique = (items: readonly { id: string }[]): boolean => new Set(items.map((i) => i.id)).size === items.length;

const invalid = (): Either<TodoError, Backup> => E.left(validationError('El archivo no es un respaldo válido'));

/** Lee el texto de un respaldo. Todo o nada: ante la primera irregularidad se
 *  rechaza el archivo. Una tarea cuyo proyecto no viene en el archivo pasa a la
 *  bandeja, igual que al borrar un proyecto. */
export const parseBackup = (text: string): Either<TodoError, Backup> => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return invalid();
  }
  if (!isObject(raw) || raw.app !== BACKUP_APP || !isNum(raw.version) || !isNum(raw.exportedAt)) return invalid();
  if (raw.version !== BACKUP_VERSION) {
    return E.left(validationError('El respaldo es de una versión que esta app no entiende'));
  }
  const tasks = parseAll(raw.tasks, toTask);
  const projects = parseAll(raw.projects, toProject);
  if (!tasks || !projects || !unique(tasks) || !unique(projects)) return invalid();

  const userProjects = projects.filter((p) => p.id !== INBOX_ID);
  const known = new Set(userProjects.map((p) => p.id));
  return E.right({
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: raw.exportedAt,
    tasks: tasks.map((t) => (t.projectId === INBOX_ID || known.has(t.projectId) ? t : { ...t, projectId: INBOX_ID })),
    projects: userProjects,
  });
};
