import { CalendarDays, Check, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode, TouchEvent } from 'react';
import { SWIPE_THRESHOLD, clampSwipe, isHorizontalDrag, swipeAction } from '../../domain/swipe';

export type SwipeableRowProps = {
  /** Deslizar a la derecha. */
  onComplete: () => void;
  /** Deslizar a la izquierda; sin él ese lado no hace nada. */
  onReschedule?: () => void;
  /** La tarea ya está hecha: el gesto de la derecha la reabre. */
  done: boolean;
  children: ReactNode;
};

type Gesture = { x: number; y: number; locked: boolean };

/** Fila de lista (`<li>`) que se desliza como en Todoist: derecha completa,
 *  izquierda reagenda. Usa eventos táctiles, así que en escritorio no cambia
 *  nada; `touch-action: pan-y` deja el scroll vertical al navegador. */
export function SwipeableRow({ onComplete, onReschedule, done, children }: SwipeableRowProps) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const swiped = useRef(false);
  const allowed = { complete: true, reschedule: onReschedule !== undefined };

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
      if (!isHorizontalDrag(moveX, moveY)) {
        // Si ya predomina lo vertical es scroll: se abandona el gesto.
        if (Math.abs(moveY) > 10) gesture.current = null;
        return;
      }
      g.locked = true;
      setDragging(true);
    }
    setDx(clampSwipe(moveX, allowed));
  };

  const finish = (cancel: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    const action = g?.locked && !cancel ? swipeAction(dx) : null;
    if (g?.locked) swiped.current = true;
    setDragging(false);
    setDx(0);
    if (action === 'complete') onComplete();
    else if (action === 'reschedule') onReschedule?.();
  };

  const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1);
  const armed = Math.abs(dx) >= SWIPE_THRESHOLD;

  return (
    <li
      className="group relative overflow-hidden border-b border-border"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => finish(false)}
      onTouchCancel={() => finish(true)}
      // Tras arrastrar, el navegador puede disparar un click: que no abra la tarea.
      onClickCapture={(e) => {
        if (swiped.current) {
          swiped.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      style={{ touchAction: 'pan-y' }}
    >
      {dx !== 0 && (
        <div
          aria-hidden="true"
          data-testid="swipe-bg"
          className={`absolute inset-0 flex items-center px-5 text-sm font-medium text-white ${dx > 0 ? 'justify-start bg-success' : 'justify-end bg-accent'}`}
          style={{ opacity: 0.4 + 0.6 * progress }}
        >
          <span className={`inline-flex items-center gap-2 transition-transform ${armed ? 'scale-110' : ''}`}>
            {dx > 0 ? (
              <>
                {done ? <RotateCcw size={18} /> : <Check size={18} />} {done ? 'Reabrir' : 'Completar'}
              </>
            ) : (
              <>
                Reagendar <CalendarDays size={18} />
              </>
            )}
          </span>
        </div>
      )}
      <div
        className="relative flex gap-3 bg-bg px-1 py-3"
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform 160ms ease-out' }}
      >
        {children}
      </div>
    </li>
  );
}
