import { CalendarDays, Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { formatRelative } from '../../../../shared/domain/dates';
import type { DateKey } from '../../../../shared/domain/dates';
import type { Project } from '../../../projects/domain/project';
import { matchRanges } from '../../domain/search';
import { isCompleted } from '../../domain/task';
import type { Task } from '../../domain/task';

export type SearchPanelProps = {
  query: string;
  tokens: readonly string[];
  results: readonly Task[];
  /** Cuántas coincidencias hay en total (puede ser más que las mostradas). */
  total: number;
  today: DateKey;
  projectsById: ReadonlyMap<string, Project>;
  onQueryChange: (query: string) => void;
  onPick: (task: Task) => void;
};

/** Resalta las coincidencias dentro del texto original. */
function Highlight({ text, tokens }: { text: string; tokens: readonly string[] }) {
  const ranges = matchRanges(text, tokens);
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([s, e], i) => {
    if (s > cursor) parts.push(text.slice(cursor, s));
    parts.push(
      <mark key={i} className="rounded bg-transparent font-semibold text-accent">
        {text.slice(s, e)}
      </mark>,
    );
    cursor = e;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export function SearchPanel({ query, tokens, results, total, today, projectsById, onQueryChange, onPick }: SearchPanelProps) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            const first = results[0];
            if (e.key !== 'Enter') return;
            // Sin esto el Enter sigue su curso en el editor que se abre y lo envía como formulario.
            e.preventDefault();
            if (first) onPick(first);
          }}
          placeholder="Buscar tareas…"
          aria-label="Buscar tareas"
          className="w-full rounded-lg border border-border bg-surface-2 py-2.5 pl-9 pr-9 text-sm"
        />
        {query && (
          <button type="button" aria-label="Limpiar búsqueda" onClick={() => onQueryChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-faint hover:text-fg">
            <X size={15} />
          </button>
        )}
      </div>

      {tokens.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Escribe para buscar por título o descripción.</p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Sin resultados para «{query.trim()}»</p>
      ) : (
        <>
          <p className="mb-1 text-xs text-faint" role="status">
            {total} {total === 1 ? 'resultado' : 'resultados'}
            {total > results.length && ` · mostrando ${results.length}`}
          </p>
          <ul className="max-h-[55dvh] overflow-y-auto">
            {results.map((t) => {
              const done = isCompleted(t);
              const project = projectsById.get(t.projectId);
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => onPick(t)} className="w-full border-b border-border px-1 py-2.5 text-left hover:bg-surface-2">
                    <p className={`text-[15px] leading-snug ${done ? 'text-faint line-through' : ''}`}>
                      <Highlight text={t.title} tokens={tokens} />
                    </p>
                    {t.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                        <Highlight text={t.description} tokens={tokens} />
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      {done && <span className="text-faint">Completada</span>}
                      {t.scheduledFor && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatRelative(t.scheduledFor, today)}
                        </span>
                      )}
                      {project && (
                        <span className="ml-auto inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
