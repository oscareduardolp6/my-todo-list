/** Id local: Firestore acepta el id que le demos, así que basta tiempo + azar.
 *  Es la implementación por defecto del puerto `IdGenerator`; los casos de uso
 *  lo reciben inyectado para poder fijarlo en test. */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
