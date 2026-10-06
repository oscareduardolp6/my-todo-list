import { useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';

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

/** Desplazamiento horizontal (px) a partir del cual soltar el toast lo descarta. */
const SWIPE_DISMISS_PX = 80;

function ToastItem({ toast, onDismiss, durationMs }: { toast: ToastView; onDismiss: (id: string) => void; durationMs: number }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.action ? durationMs : Math.min(durationMs, 4000));
    return () => clearTimeout(timer);
  }, [toast.id, toast.action, durationMs, onDismiss]);

  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ x: number; y: number; locked: boolean } | null>(null);
  const swiped = useRef(false);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    gesture.current = { x: t.clientX, y: t.clientY, locked: false };
    swiped.current = false;
  };

  const onTouchMove = (e: TouchEvent) => {
    const g = gesture.current;
    const t = e.touches[0];
    if (!g || !t) return;
    const moveX = t.clientX - g.x;
    const moveY = t.clientY - g.y;
    if (!g.locked) {
      if (Math.abs(moveX) < 10 || Math.abs(moveX) <= Math.abs(moveY)) {
        // Si predomina lo vertical es scroll: se abandona el gesto.
        if (Math.abs(moveY) > 10) gesture.current = null;
        return;
      }
      g.locked = true;
      setDragging(true);
    }
    setDx(moveX);
  };

  const finish = (cancel: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    if (g?.locked) swiped.current = true;
    setDragging(false);
    setDx(0);
    if (g?.locked && !cancel && Math.abs(dx) >= SWIPE_DISMISS_PX) onDismiss(toast.id);
  };

  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      className={`animate-toast-in pointer-events-auto flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${
        toast.kind === 'error' ? 'border-danger bg-surface text-danger' : 'border-border bg-surface-2 text-fg'
      }`}
      style={{
        touchAction: 'pan-y',
        transform: `translateX(${dx}px)`,
        opacity: 1 - Math.min(Math.abs(dx) / (SWIPE_DISMISS_PX * 2), 0.6),
        transition: dragging ? 'none' : 'transform 160ms ease-out, opacity 160ms ease-out',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => finish(false)}
      onTouchCancel={() => finish(true)}
      onClick={(e) => {
        // Tras arrastrar, el navegador puede disparar un click; el botón de acción ya se descarta solo.
        if (swiped.current) {
          swiped.current = false;
          return;
        }
        if ((e.target as HTMLElement).closest('button')) return;
        onDismiss(toast.id);
      }}
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
