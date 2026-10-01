/* Hook compartido por las vistas de tareas (Hoy, Semana, Próximas, Proyecto):
   junta lo que toda lista necesita del store — el "hoy", los proyectos por id
   y las acciones de una fila — para que cada página solo decida QUÉ tareas
   mostrar. */

import { useMemo } from 'react';
import { useAppStore } from '../../../../app/store-context';
import { withInbox } from '../../../projects/domain/project';
import type { Project } from '../../../projects/domain/project';
import type { NewTask, Task } from '../../domain/task';

export function useTaskList() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const loaded = useAppStore((s) => s.loaded.tasks);
  const today = useAppStore((s) => s.today);
  const weekStartsOn = useAppStore((s) => s.settings.weekStartsOn);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const openTaskEditor = useAppStore((s) => s.openTaskEditor);
  const openReschedule = useAppStore((s) => s.openReschedule);

  const projectsById = useMemo(() => new Map<string, Project>(withInbox(projects).map((p) => [p.id, p])), [projects]);

  return {
    tasks,
    loaded,
    today,
    weekStartsOn,
    projectsById,
    toggle: toggleTask,
    reschedule: (task: Task) => openReschedule(task.id),
    open: (task: Task) => openTaskEditor({ mode: 'edit', taskId: task.id }),
    add: (defaults: Partial<NewTask> = {}) => openTaskEditor({ mode: 'new', defaults }),
  };
}
