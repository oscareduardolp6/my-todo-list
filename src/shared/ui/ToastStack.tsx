import { useEffect } from 'react';

export type ToastView = {
  id: string;
  message: string;
  kind: 'info' | 'error';
  action?: { label: string; run: () => void };
};

export type ToastStackProps = {
  toasts: readonly ToastView[];
  onDismiss: (id: string) => void;
  /** Las acciones (Deshacer) necesitan tiempo para ser alcanzadas. */
  durationMs?: number;
};

function ToastItem({ toast, onDismiss, durationMs }: { toast: ToastView; onDismiss: (id: string) => void; durationMs: number }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.action ? durationMs : Math.min(durationMs, 4000));
    return () => clearTimeout(timer);
  }, [toast.id, toast.action, durationMs, onDismiss]);

  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className={`animate-toast-in pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
        toast.kind === 'error' ? 'border-danger bg-surface text-danger' : 'border-border bg-surface-2 text-fg'
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.run();
            onDismiss(toast.id);
          }}
          className="rounded-md px-2 py-1 font-semibold text-accent hover:bg-surface"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

/** Pila de toasts: encima de la barra inferior en móvil, abajo al centro en escritorio. */
export function ToastStack({ toasts, onDismiss, durationMs = 6000 }: ToastStackProps) {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="w-full max-w-sm">
          <ToastItem toast={t} onDismiss={onDismiss} durationMs={durationMs} />
        </div>
      ))}
    </div>
  );
}
