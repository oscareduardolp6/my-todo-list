/** Atajos de teclado de la app, para mostrarlos en la hoja de ayuda. Si agregas
 *  uno nuevo, anótalo aquí. */
export type Shortcut = { readonly keys: readonly string[]; readonly label: string };

export const SHORTCUTS: readonly Shortcut[] = [
  { keys: ['/'], label: 'Buscar tareas' },
  { keys: ['Ctrl', 'K'], label: 'Buscar tareas (en Mac: ⌘ K)' },
  { keys: ['Enter'], label: 'En la búsqueda: abrir el primer resultado' },
  { keys: ['?'], label: 'Mostrar esta ayuda' },
  { keys: ['Esc'], label: 'Cerrar la hoja abierta' },
];
