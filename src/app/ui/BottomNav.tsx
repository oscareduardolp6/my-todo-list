import { navigate } from '../router';
import type { Route } from '../router';
import { BOTTOM_NAV, isNavActive } from './nav';

/** Barra de navegación inferior (móvil). En escritorio no se pinta. */
export function BottomNav({ route }: { route: Route }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface lg:hidden" aria-label="Navegación principal">
      {BOTTOM_NAV.map((item) => {
        const active = isNavActive(item, route);
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.route)}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${active ? 'text-accent' : 'text-muted'}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
