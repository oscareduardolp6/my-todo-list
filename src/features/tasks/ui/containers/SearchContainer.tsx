import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../../../app/store-context';
import { Sheet } from '../../../../shared/ui/Sheet';
import { isTyping } from '../../../../shared/ui/keyboard';
import { withInbox } from '../../../projects/domain/project';
import type { Project } from '../../../projects/domain/project';
import { queryTokens, searchTasks } from '../../domain/search';
import { SearchPanel } from '../components/SearchPanel';

const MAX_RESULTS = 50;

/** Búsqueda global. Siempre montada: escucha `/` y Ctrl/Cmd+K para abrirla y se
 *  pinta solo si está abierta. Tocar un resultado abre la tarea en el editor. */
export function SearchContainer() {
  const open = useAppStore((s) => s.searchOpen);
  const openSearch = useAppStore((s) => s.openSearch);
  const closeSearch = useAppStore((s) => s.closeSearch);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target);
      if (ctrlK || slash) {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openSearch]);

  if (!open) return null;
  return <SearchSheet onClose={closeSearch} />;
}

function SearchSheet({ onClose }: { onClose: () => void }) {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const today = useAppStore((s) => s.today);
  const openTaskEditor = useAppStore((s) => s.openTaskEditor);
  const [query, setQuery] = useState('');

  const projectsById = useMemo(() => new Map<string, Project>(withInbox(projects).map((p) => [p.id, p])), [projects]);
  const tokens = useMemo(() => queryTokens(query), [query]);
  const all = useMemo(() => searchTasks(tasks, query), [tasks, query]);
  const shown = useMemo(() => all.slice(0, MAX_RESULTS), [all]);

  return (
    <Sheet title="Buscar" onClose={onClose}>
      <SearchPanel
        query={query}
        tokens={tokens}
        results={shown}
        total={all.length}
        today={today}
        projectsById={projectsById}
        onQueryChange={setQuery}
        onPick={(task) => {
          onClose();
          openTaskEditor({ mode: 'edit', taskId: task.id });
        }}
      />
    </Sheet>
  );
}
