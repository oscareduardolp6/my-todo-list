import { Sheet } from '../../../../shared/ui/Sheet';

export type BackupConfirmProps = {
  tasks: number;
  projects: number;
  exportedAt: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Resumen del archivo elegido y confirmación de que reemplaza todo. */
export function BackupConfirm({ tasks, projects, exportedAt, busy, onConfirm, onCancel }: BackupConfirmProps) {
  return (
    <Sheet title="Restaurar respaldo" onClose={onCancel}>
      <p className="text-sm">
        El archivo tiene {plural(tasks, 'tarea', 'tareas')} y {plural(projects, 'proyecto', 'proyectos')} (exportado el {exportedAt}).
      </p>
      <p className="mt-3 rounded-lg border border-border bg-surface-2 p-3 text-sm text-muted">
        Esto <strong>reemplaza todo</strong>: las tareas y proyectos que tienes ahora y no estén en el archivo se borrarán.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2">
          Cancelar
        </button>
        <button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-black/80 disabled:opacity-50">
          Reemplazar todo
        </button>
      </div>
    </Sheet>
  );
}
