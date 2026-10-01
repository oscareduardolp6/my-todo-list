import { useEffect } from 'react';
import { Sheet } from '../../shared/ui/Sheet';
import { isTyping } from '../../shared/ui/keyboard';
import { useAppStore } from '../store-context';
import { SHORTCUTS } from './shortcuts';

/** Hoja de ayuda con los atajos. Siempre montada: `?` la abre y se pinta solo si está abierta. */
export function ShortcutsContainer() {
  const open = useAppStore((s) => s.shortcutsOpen);
  const openShortcuts = useAppStore((s) => s.openShortcuts);
  const close = useAppStore((s) => s.closeShortcuts);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        openShortcuts();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openShortcuts]);

  if (!open) return null;
  return (
    <Sheet title="Atajos de teclado" onClose={close}>
      <ul className="divide-y divide-border">
        {SHORTCUTS.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span>{s.label}</span>
            <span className="flex shrink-0 gap-1">
              {s.keys.map((k) => (
                <kbd key={k} className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
