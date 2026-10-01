/* Lógica pura del deslizamiento de una fila (sin DOM): qué acción dispara un
   desplazamiento horizontal. Derecha = completar, izquierda = reagendar. */

export type SwipeAction = 'complete' | 'reschedule';

/** Píxeles que hay que arrastrar para que soltar ejecute la acción. */
export const SWIPE_THRESHOLD = 80;
/** Movimiento mínimo para decidir si el gesto es horizontal o es scroll. */
export const SWIPE_LOCK = 10;
/** Cuánto puede alejarse la fila de su lugar. */
export const SWIPE_MAX = 140;

/** `true` si el gesto es un arrastre horizontal (y no un scroll vertical). */
export const isHorizontalDrag = (dx: number, dy: number): boolean =>
  Math.abs(dx) >= SWIPE_LOCK && Math.abs(dx) > Math.abs(dy);

/** Desplazamiento visible: acotado a `SWIPE_MAX` y a 0 del lado cuyo gesto no existe. */
export const clampSwipe = (dx: number, allowed: { complete: boolean; reschedule: boolean }): number => {
  if (dx > 0) return allowed.complete ? Math.min(dx, SWIPE_MAX) : 0;
  return allowed.reschedule ? Math.max(dx, -SWIPE_MAX) : 0;
};

/** La acción que corresponde al soltar con el desplazamiento `dx`, si pasó el umbral. */
export const swipeAction = (dx: number): SwipeAction | null => {
  if (dx >= SWIPE_THRESHOLD) return 'complete';
  if (dx <= -SWIPE_THRESHOLD) return 'reschedule';
  return null;
};
