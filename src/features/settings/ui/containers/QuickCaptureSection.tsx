import { Zap } from 'lucide-react';
import { useAppStore } from '../../../../app/store-context';

export function QuickCaptureSection() {
  const copy = useAppStore((s) => s.copyQuickCaptureConnection);

  return (
    <>
      <button
        type="button"
        onClick={() => void copy()}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2"
      >
        <Zap size={15} /> Copiar conexión
      </button>
      <p className="mt-2 text-xs text-faint">
        Para crear tareas desde Raycast: copia la conexión y ejecuta “Configurar Tareas”. Es un secreto que da acceso a tus datos: no la compartas.
      </p>
    </>
  );
}
