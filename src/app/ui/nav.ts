import { BarChart3, CalendarDays, CalendarRange, FolderKanban, Settings, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Route } from '../router';

export type NavItem = { readonly label: string; readonly icon: LucideIcon; readonly route: Route };

/** Vistas de tiempo: las que van arriba en el sidebar. */
export const TIME_NAV: readonly NavItem[] = [
  { label: 'Hoy', icon: Sun, route: { name: 'today' } },
  { label: 'Semana', icon: CalendarRange, route: { name: 'week' } },
  { label: 'Próximas', icon: CalendarDays, route: { name: 'upcoming' } },
];

export const REPORTS_NAV: NavItem = { label: 'Reportes', icon: BarChart3, route: { name: 'reports' } };
export const SETTINGS_NAV: NavItem = { label: 'Ajustes', icon: Settings, route: { name: 'settings' } };

/** Barra inferior (móvil): los proyectos se alcanzan desde su propia pestaña. */
export const BOTTOM_NAV: readonly NavItem[] = [
  TIME_NAV[0] as NavItem,
  TIME_NAV[1] as NavItem,
  { label: 'Proyectos', icon: FolderKanban, route: { name: 'projects' } },
  REPORTS_NAV,
  SETTINGS_NAV,
];

/** Una ruta de proyecto individual resalta la pestaña "Proyectos". */
export const isNavActive = (item: NavItem, current: Route): boolean =>
  item.route.name === current.name || (item.route.name === 'projects' && current.name === 'project');
