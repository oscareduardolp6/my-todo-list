import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export type SheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Hoja modal: se abre desde abajo en móvil y centrada en escritorio. */
export function Sheet({ title, onClose, children }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="animate-sheet-in relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-2xl lg:max-w-lg lg:rounded-2xl">
        <div className="flex items-center justify-between px-5 pb-1 pt-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-muted hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5 pt-2 pb-safe">{children}</div>
      </div>
    </div>
  );
}
