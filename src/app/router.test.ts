import { formatRoute, parseRoute } from './router';
import type { Route } from './router';

describe('router', () => {
  const routes: Route[] = [
    { name: 'today' },
    { name: 'week' },
    { name: 'upcoming' },
    { name: 'projects' },
    { name: 'project', id: 'proj_1' },
    { name: 'project', id: 'con espacio/y barra' },
    { name: 'reports' },
    { name: 'settings' },
  ];

  it.each(routes)('ida y vuelta: %o', (route) => {
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });

  it('cualquier hash desconocido o vacío cae en Hoy', () => {
    expect(parseRoute('')).toEqual({ name: 'today' });
    expect(parseRoute('#/nada')).toEqual({ name: 'today' });
  });

  it('un proyecto sin id apunta a la bandeja', () => {
    expect(parseRoute('#/proyecto/')).toEqual({ name: 'project', id: 'inbox' });
  });
});
