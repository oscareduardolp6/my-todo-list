import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAppStore } from '../../../../app/store-context';
import { toDateKey } from '../../../../shared/domain/dates';
import type { Backup } from '../../domain/backup';
import { BackupConfirm } from '../components/BackupConfirm';

/** `File.text()` no existe en jsdom ni en Safari viejos; `FileReader` sí. */
const readText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const button = 'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2';

export function BackupSection() {
  const downloadBackup = useAppStore((s) => s.downloadBackup);
  const readBackup = useAppStore((s) => s.readBackup);
  const restoreBackup = useAppStore((s) => s.restoreBackup);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite elegir el mismo archivo otra vez
    if (!file) return;
    setPending(readBackup(await readText(file)));
  };

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    await restoreBackup(pending);
    setBusy(false);
    setPending(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void downloadBackup()} className={button}>
          <Download size={15} /> Exportar
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} className={button}>
          <Upload size={15} /> Importar
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" aria-label="Archivo de respaldo" className="hidden" onChange={onFile} />
      </div>
      <p className="mt-2 text-xs text-faint">Exporta tus tareas y proyectos a un archivo. Al importar, los datos actuales se reemplazan por los del archivo.</p>
      {pending && (
        <BackupConfirm
          tasks={pending.tasks.length}
          projects={pending.projects.length}
          exportedAt={toDateKey(pending.exportedAt)}
          busy={busy}
          onConfirm={() => void confirm()}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
