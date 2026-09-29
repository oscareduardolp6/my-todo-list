/* Enrutado por hash (`#/hoy`, `#/proyecto/abc`): sin dependencias, funciona en
   GitHub Pages y en la PWA instalada, y el botón "atrás" del teléfono navega
   entre vistas. `parseRoute`/`formatRoute` son puras y van probadas. */

import { useEffect, useState } from 'react';
import { INBOX_ID } from '../features/projects/domain/project';

export type Route =
  | { readonly name: 'today' }
  | { readonly name: 'week' }
  | { readonly name: 'upcoming' }
  | { readonly name: 'projects' }
  | { readonly name: 'project'; readonly id: string }
  | { readonly name: 'reports' }
  | { readonly name: 'settings' };

export const DEFAULT_ROUTE: Route = { name: 'today' };

export const parseRoute = (hash: string): Route => {
  const [, first = '', second = ''] = hash.replace(/^#/, '').split('/');
  switch (first) {
    case 'semana':
      return { name: 'week' };
    case 'proximas':
      return { name: 'upcoming' };
    case 'proyectos':
      return { name: 'projects' };
    case 'proyecto':
      return { name: 'project', id: decodeURIComponent(second) || INBOX_ID };
    case 'reportes':
      return { name: 'reports' };
    case 'ajustes':
      return { name: 'settings' };
    default:
      return DEFAULT_ROUTE;
  }
};

export const formatRoute = (route: Route): string => {
  switch (route.name) {
    case 'today':
      return '#/hoy';
    case 'week':
      return '#/semana';
    case 'upcoming':
      return '#/proximas';
    case 'projects':
      return '#/proyectos';
    case 'project':
      return `#/proyecto/${encodeURIComponent(route.id)}`;
    case 'reports':
      return '#/reportes';
    case 'settings':
      return '#/ajustes';
  }
};

export const isSameRoute = (a: Route, b: Route): boolean => formatRoute(a) === formatRoute(b);

export const navigate = (route: Route): void => {
  window.location.hash = formatRoute(route);
};

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parseRoute(hash);
}
