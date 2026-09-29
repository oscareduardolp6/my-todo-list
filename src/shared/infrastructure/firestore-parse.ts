/* Lectores defensivos para lo que llega de Firestore: un documento editado a
   mano o de una versión anterior no debe tumbar la app. */

export const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);

export const asNumber = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

export const asNullableNumber = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;
