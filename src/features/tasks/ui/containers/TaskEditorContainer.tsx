import { useAppStore } from '../../../../app/store-context';
import { Sheet } from '../../../../shared/ui/Sheet';
import { withInbox } from '../../../projects/domain/project';
import { TaskForm } from '../components/TaskForm';
import type { TaskFormValues } from '../components/TaskForm';
import { useMemo } from 'react';

/** La hoja de alta/edición de tarea. Siempre montada: se pinta solo si hay un editor abierto. */
export function TaskEditorContainer() {
  const editor = useAppStore((s) => s.taskEditor);
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const weekStartsOn = useAppStore((s) => s.settings.weekStartsOn);
  const today = useAppStore((s) => s.today);
  const close = useAppStore((s) => s.closeTaskEditor);
  const createTask = useAppStore((s) => s.createTask);
  const editTask = useAppStore((s) => s.editTask);
  const removeTask = useAppStore((s) => s.removeTask);
  const allProjects = useMemo(() => withInbox(projects), [projects]);

  if (!editor) return null;
  const task = editor.mode === 'edit' ? tasks.find((t) => t.id === editor.taskId) : undefined;
  // La tarea pudo borrarse desde otro dispositivo mientras la editaba.
  if (editor.mode === 'edit' && !task) return null;

  const submit = (values: TaskFormValues) => {
    if (task) void editTask(task, values);
    else void createTask(values);
    close();
  };

  return (
    <Sheet title={task ? 'Editar tarea' : 'Nueva tarea'} onClose={close}>
      <TaskForm
        key={task?.id ?? 'new'}
        task={task}
        defaults={editor.mode === 'new' ? editor.defaults : undefined}
        projects={allProjects}
        today={today}
        weekStartsOn={weekStartsOn}
        onSubmit={submit}
        onCancel={close}
        onDelete={
          task
            ? () => {
                removeTask(task);
                close();
              }
            : undefined
        }
      />
    </Sheet>
  );
}
