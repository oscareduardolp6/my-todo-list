/* Búsqueda de texto sobre tareas (puro). Sin distinguir mayúsculas ni acentos:
   "camion" encuentra "Camión". Varias palabras = todas deben aparecer (en
   cualquier orden) entre título y descripción. */

import { compareTasks, isCompleted } from './task';
import type { Task } from './task';

type Normalized = { readonly text: string; /** posición normalizada → posición en el original */ readonly origin: readonly number[] };

const MARKS = /\p{M}/gu;

/** Minúsculas sin acentos, recordando de qué posición del original viene cada carácter. */
const normalize = (original: string): Normalized => {
  let text = '';
  const origin: number[] = [];
  let i = 0;
  for (const ch of original) {
    const plain = ch.normalize('NFD').replace(MARKS, '').toLowerCase();
    for (const c of plain) {
      text += c;
      for (let k = 0; k < c.length; k++) origin.push(i);
    }
    i += ch.length;
  }
  return { text, origin };
};

/** Las palabras de la consulta, normalizadas. Vacío = no hay búsqueda. */
export const queryTokens = (query: string): string[] =>
  normalize(query)
    .text.split(/\s+/)
    .filter((t) => t.length > 0);

/** Rangos `[inicio, fin)` del texto ORIGINAL que coinciden con alguna palabra, ya unidos. */
export const matchRanges = (text: string, tokens: readonly string[]): [number, number][] => {
  if (tokens.length === 0) return [];
  const { text: norm, origin } = normalize(text);
  const raw: [number, number][] = [];
  for (const token of tokens) {
    for (let from = norm.indexOf(token); from !== -1; from = norm.indexOf(token, from + token.length)) {
      const start = origin[from] ?? 0;
      const lastChar = origin[from + token.length - 1] ?? start;
      raw.push([start, lastChar + 1]);
    }
  }
  raw.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [s, e] of raw) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
};

const hasAll = (haystack: string, tokens: readonly string[]): boolean => tokens.every((t) => haystack.includes(t));

/** Tareas que coinciden. Orden: las que coinciden en el título primero, pendientes antes que
 *  completadas, y luego el orden de siempre (prioridad, fecha, antigüedad). */
export const searchTasks = (tasks: readonly Task[], query: string): Task[] => {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const ranked: { task: Task; inTitle: boolean }[] = [];
  for (const task of tasks) {
    const title = normalize(task.title).text;
    const all = `${title} ${normalize(task.description).text}`;
    if (hasAll(all, tokens)) ranked.push({ task, inTitle: hasAll(title, tokens) });
  }
  return ranked
    .sort(
      (a, b) =>
        Number(!a.inTitle) - Number(!b.inTitle) ||
        Number(isCompleted(a.task)) - Number(isCompleted(b.task)) ||
        compareTasks(a.task, b.task),
    )
    .map((r) => r.task);
};
