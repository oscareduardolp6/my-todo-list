import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check } from 'lucide-react';
import { PROJECT_COLORS } from '../../domain/project';
import type { Project } from '../../domain/project';

export type ProjectFormProps = {
  project?: Project;
  onSubmit: (values: { name: string; color: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function ProjectForm({ project, onSubmit, onCancel, onDelete }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [color, setColor] = useState(project?.color ?? PROJECT_COLORS[5] ?? '#3b82f6');
  // El borrado pide una segunda confirmación dentro de la misma hoja.
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit({ name, color });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre (Trabajo, Casa, …)"
        aria-label="Nombre del proyecto"
        maxLength={60}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-base focus:border-accent focus:outline-none"
      />
      <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2.5">
        {PROJECT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={color === c}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: c }}
          >
            {color === c && <Check size={16} className="text-white" />}
          </button>
        ))}
      </div>

      {confirmingDelete && (
        <p className="rounded-lg border border-danger p-3 text-sm text-danger">
          Se eliminará el proyecto. Sus tareas no se pierden: pasan a la Bandeja de entrada.
        </p>
      )}

      <div className="flex items-center gap-2">
        {onDelete &&
          (confirmingDelete ? (
            <button type="button" onClick={onDelete} className="rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white">
              Sí, eliminar
            </button>
          ) : (
            <button type="button" onClick={() => setConfirmingDelete(true)} className="rounded-lg border border-border px-4 py-2.5 text-sm text-danger hover:bg-surface-2">
              Eliminar
            </button>
          ))}
        <div className="flex-1" />
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2.5 text-sm text-muted hover:bg-surface-2">
          Cancelar
        </button>
        <button type="submit" disabled={!name.trim()} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg disabled:opacity-40">
          {project ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}
