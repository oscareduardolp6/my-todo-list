import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../test/factories';
import { matchRanges, queryTokens, searchTasks } from './search';

const ids = (tasks: { id: string }[]) => tasks.map((t) => t.id);

describe('searchTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: 'Pagar luz', description: 'Recibo del camión de agua' }),
    makeTask({ id: 'b', title: 'Camión de mudanza', priority: 4 }),
    makeTask({ id: 'c', title: 'Llamar al dentista', description: 'Pedir cita' }),
    makeTask({ id: 'd', title: 'Camión viejo', completedAt: 5, completedOn: '2026-09-01' }),
  ];

  it('ignora mayúsculas y acentos', () => {
    expect(ids(searchTasks(tasks, 'CAMION'))).toContain('b');
    expect(ids(searchTasks(tasks, 'camión'))).toContain('a');
  });

  it('busca en título y descripción; las de título van primero y, dentro de cada grupo, las pendientes antes', () => {
    expect(ids(searchTasks(tasks, 'camion'))).toEqual(['b', 'd', 'a']);
  });

  it('varias palabras: todas deben aparecer, en cualquier orden', () => {
    expect(ids(searchTasks(tasks, 'cita dentista'))).toEqual(['c']);
    expect(searchTasks(tasks, 'dentista mudanza')).toEqual([]);
  });

  it('una consulta vacía no devuelve nada', () => {
    expect(searchTasks(tasks, '   ')).toEqual([]);
  });
});

describe('matchRanges', () => {
  it('devuelve rangos sobre el texto original aunque haya acentos', () => {
    const text = 'Camión viejo';
    expect(matchRanges(text, queryTokens('camion'))).toEqual([[0, 6]]);
    expect(text.slice(0, 6)).toBe('Camión');
  });

  it('une coincidencias que se tocan o se solapan', () => {
    expect(matchRanges('abcdef', ['abc', 'cde'])).toEqual([[0, 5]]);
  });
});
