/* Datos de ejemplo del modo demo: lo que ve alguien que abre la app por primera
   vez sin cuenta. Todo es relativo a "hoy" para que Hoy, Semana, Próximas y los
   reportes se vean con contenido sin importar cuándo se abra. */

import type { Project } from '../features/projects/domain/project';
import type { Priority, Task } from '../features/tasks/domain/task';
import { addDays, toDateKey } from '../shared/domain/dates';
import type { Recurrence } from '../features/tasks/domain/recurrence';

const WORK = 'demo_p_trabajo';
const PERSONAL = 'demo_p_personal';
const HOME = 'demo_p_casa';

const weekly: Recurrence = { frequency: 'weekly', interval: 1, weekdays: [], mode: 'fixed' };
const daily: Recurrence = { frequency: 'daily', interval: 1, weekdays: [], mode: 'fixed' };

export const buildDemoData = (now: number): { tasks: Task[]; projects: Project[] } => {
  const today = toDateKey(now);
  let n = 0;

  const projects: Project[] = [
    { id: WORK, name: 'Trabajo', color: '#3b82f6', order: 0, createdAt: now, updatedAt: now },
    { id: PERSONAL, name: 'Personal', color: '#8b7cf6', order: 1, createdAt: now, updatedAt: now },
    { id: HOME, name: 'Casa', color: '#22c55e', order: 2, createdAt: now, updatedAt: now },
  ];

  const pending = (
    title: string,
    projectId: string,
    priority: Priority,
    scheduledOffset: number | null,
    extra: Partial<Task> = {},
  ): Task => ({
    id: `demo_t_${++n}`,
    title,
    description: '',
    priority,
    projectId,
    scheduledFor: scheduledOffset === null ? null : addDays(today, scheduledOffset),
    deadline: null,
    recurrence: null,
    rescheduleCount: 0,
    completedAt: null,
    completedOn: null,
    createdAt: now - n * 1000,
    updatedAt: now - n * 1000,
    ...extra,
  });

  /** Completada hace `daysAgo` días (para que los reportes tengan historia). */
  const done = (title: string, projectId: string, priority: Priority, daysAgo: number, extra: Partial<Task> = {}): Task => {
    const completedOn = addDays(today, -daysAgo);
    const completedAt = now - daysAgo * 86_400_000;
    return pending(title, projectId, priority, -daysAgo, { completedAt, completedOn, ...extra });
  };

  const tasks: Task[] = [
    pending('Enviar la cotización al cliente', WORK, 2, -2, { rescheduleCount: 2, deadline: addDays(today, 3) }),
    pending('Preparar la demo del sprint', WORK, 1, 0, { description: 'Mostrar el flujo de reagendado y los reportes.' }),
    pending('Revisar los pull requests pendientes', WORK, 2, 0),
    pending('Standup diario', WORK, 3, 0, { recurrence: daily }),
    pending('Comprar despensa', HOME, 3, 0),
    pending('Llamar a mamá', PERSONAL, 3, 0),
    pending('Sacar la basura', HOME, 4, 1, { recurrence: weekly }),
    pending('Escribir el reporte semanal', WORK, 2, 2, { deadline: addDays(today, 4) }),
    pending('Cita con el dentista', PERSONAL, 1, 4),
    pending('Pagar la renta', HOME, 1, 6, { deadline: addDays(today, 8) }),
    pending('Planear el viaje de diciembre', PERSONAL, 4, 12),
    pending('Leer un capítulo del libro', PERSONAL, 4, null),
    pending('Idea: probar la app desde el celular (se instala como PWA)', PERSONAL, 4, null),

    done('Responder correos', WORK, 3, 1),
    done('Hacer ejercicio', PERSONAL, 3, 1),
    done('Cerrar el ticket de login', WORK, 2, 2),
    done('Lavar la ropa', HOME, 4, 2),
    done('Actualizar el CV', PERSONAL, 3, 3),
    done('Revisar el presupuesto del mes', PERSONAL, 2, 4, { deadline: addDays(today, -4) }),
    done('Desplegar la versión nueva', WORK, 1, 5),
    done('Limpiar la cocina', HOME, 4, 6),
  ];

  return { tasks, projects };
};
