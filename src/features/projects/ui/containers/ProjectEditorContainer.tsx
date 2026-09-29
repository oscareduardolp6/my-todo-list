import { navigate } from '../../../../app/router';
import { useAppStore } from '../../../../app/store-context';
import { Sheet } from '../../../../shared/ui/Sheet';
import { ProjectForm } from '../components/ProjectForm';

/** Hoja de alta/edición de proyecto. Siempre montada; se pinta si hay editor abierto. */
export function ProjectEditorContainer() {
  const editor = useAppStore((s) => s.projectEditor);
  const projects = useAppStore((s) => s.projects);
  const close = useAppStore((s) => s.closeProjectEditor);
  const createProject = useAppStore((s) => s.createProject);
  const editProject = useAppStore((s) => s.editProject);
  const removeProject = useAppStore((s) => s.removeProject);

  if (!editor) return null;
  const project = editor.mode === 'edit' ? projects.find((p) => p.id === editor.projectId) : undefined;
  if (editor.mode === 'edit' && !project) return null;

  return (
    <Sheet title={project ? 'Editar proyecto' : 'Nuevo proyecto'} onClose={close}>
      <ProjectForm
        key={project?.id ?? 'new'}
        project={project}
        onCancel={close}
        onSubmit={async (values) => {
          close();
          if (project) await editProject(project, values);
          else {
            const created = await createProject(values);
            if (created) navigate({ name: 'project', id: created.id });
          }
        }}
        onDelete={
          project
            ? async () => {
                close();
                navigate({ name: 'projects' });
                await removeProject(project);
              }
            : undefined
        }
      />
    </Sheet>
  );
}
