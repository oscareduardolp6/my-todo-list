/* Separación visual por prioridad (puro). No agrupa en estructuras ni agrega
   encabezados: solo ordena por prioridad y marca dónde cambia, para que la
   lista deje un pequeño espacio entre urgente, alta, media y normal. */

import type { Task } from './task';

export type PrioritizedTask = { readonly task: Task; /** `true` si abre un grupo de prioridad distinto al anterior. */ readonly gap: boolean };

/** Con `separate`, ordena por prioridad (estable: dentro de cada una se conserva el
 *  orden que traía) y marca los cambios de prioridad. Sin `separate`, la lista queda igual. */
export const prioritized = (tasks: readonly Task[], separate: boolean): PrioritizedTask[] => {
  if (!separate) return tasks.map((task) => ({ task, gap: false }));
  const sorted = [...tasks].sort((a, b) => a.priority - b.priority);
  return sorted.map((task, i) => ({ task, gap: i > 0 && task.priority !== sorted[i - 1]?.priority }));
};
