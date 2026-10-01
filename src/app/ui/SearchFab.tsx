import { Search } from 'lucide-react';
import { useAppStore } from '../store-context';

/** Botón de búsqueda para móvil (en escritorio está en el sidebar). */
export function SearchFab() {
  const openSearch = useAppStore((s) => s.openSearch);
  return (
    <button
      type="button"
      aria-label="Buscar tareas"
      onClick={openSearch}
      className="fixed bottom-[9.5rem] right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg lg:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Search size={20} />
    </button>
  );
}
