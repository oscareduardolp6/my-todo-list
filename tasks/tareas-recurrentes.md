---
status: pendiente
priority: 1
created: 2026-09-29
implemented:
plan:
---

# Tareas recurrentes

Poder marcar una tarea como recurrente ("cada lunes", "cada 15 del mes", "3 días después de completarla") para que al completarla vuelva a aparecer sola en su siguiente fecha.

## Problema que resuelve

Hay pendientes que se repiten toda la vida (pagar la renta, sacar la basura, revisión semanal) y hoy hay que recrearlos a mano cada vez. Es la funcionalidad de Todoist que más se echaría de menos al migrar.

## Cómo se vería

- En el formulario de tarea, junto a la fecha agendada, un selector "Repetir": no se repite (default), cada día, cada semana (eligiendo días), cada mes, cada año, o personalizado (cada N días/semanas/meses).
- Dos modos:
  - **Fecha fija** ("cada lunes"): la siguiente ocurrencia sale del calendario, sin importar cuándo se completó.
  - **Después de completar** ("3 días después de hacerla"): la siguiente se cuenta desde el día en que se completó.
- Al completar una recurrente sale el toast con **Deshacer** de siempre; la tarea desaparece de Hoy y reaparece en su siguiente fecha.
- La fila muestra un ícono de repetición.
- Requiere fecha agendada: una tarea recurrente sin fecha no tiene de dónde calcular la siguiente.

## Alcance

**Dentro:**
- Regla de recurrencia en la tarea (frecuencia, intervalo, días de la semana, modo fijo / después de completar).
- Cálculo de la siguiente fecha como lógica pura de dominio.
- Completar una recurrente registra la ocurrencia en el historial (los reportes deben seguir mostrando "qué se hizo qué día") y genera la siguiente.
- Deshacer revierte las dos cosas: la ocurrencia completada y la siguiente generada.
- Poder terminar la serie (quitar la recurrencia) o borrar solo la ocurrencia actual.

**Fuera (por ahora):**
- Fin de serie automático ("hasta el 31 de diciembre", "10 veces").
- Recurrencia por horas o con hora del día (la app maneja días, no horas).
- Entrada en lenguaje natural ("cada lunes"): idea aparte.
- Ocurrencias futuras precalculadas y visibles en Semana / Próximas más allá de la siguiente.

## Criterios de aceptación

- [ ] Cuando completo una tarea "cada lunes" agendada para el lunes 5, entonces aparece agendada para el lunes 12 y la del 5 queda en el reporte del día en que la completé.
- [ ] Cuando completo una tarea "3 días después de completar" un jueves, entonces la siguiente queda para el domingo, sin importar la fecha agendada original.
- [ ] Cuando completo una recurrente con la fecha atrasada (agendada hace 2 semanas), entonces la siguiente es la próxima fecha **futura** de la serie, no una también atrasada.
- [ ] Cuando doy Deshacer al completarla, entonces la tarea vuelve a su fecha original y desaparece la siguiente ocurrencia (sin duplicados).
- [ ] Si la recurrente tiene fecha límite, la siguiente conserva la misma distancia entre agendada y límite.
- [ ] Completar la misma recurrente desde dos dispositivos casi a la vez no deja ocurrencias duplicadas.

## Impacto en la arquitectura

- **Dominio (`tasks`):** nuevo tipo `Recurrence` en `Task` (nullable) y función pura `nextOccurrence(recurrence, scheduledFor, completedOn)`. Sigue usando `DateKey`: nada de horas ni zonas.
- **Casos de uso:** `completeTask` se bifurca (una recurrente no queda "completada" en la lista); nuevo caso de uso para terminar la serie. `restoreTask` (el Deshacer) hoy restaura un solo documento: tendrá que restaurar también la ocurrencia generada, probablemente guardando su id en el snapshot del toast.
- **Historial / reportes:** los reportes se basan en `completedOn` de tareas. Si la recurrente solo "avanza su fecha", se pierde el historial. Dos caminos (ver dudas): (a) al completar se escribe un documento-copia ya completado y la tarea original avanza, o (b) un log de completados aparte. El reporte no debería enterarse de la diferencia.
- **Firestore:** campo nuevo en `tasks/{id}`; `taskFromDoc` debe tolerar documentos sin él. Sin cambios a `firestore.rules`.
- **UI:** selector de repetición en `TaskForm`, ícono en `TaskRow`, ajuste del texto del toast.

## Dudas abiertas

- **¿Avanzar la misma tarea o crear una nueva por ocurrencia?** Avanzar mantiene un solo documento (y descripción y demás continúan); crear una nueva hace trivial el historial. Recomendación inicial: la tarea avanza y la completada se archiva como copia, pero hay que validarlo contra el Deshacer y la concurrencia.
- **Concurrencia entre dispositivos:** dos completados simultáneos deberían converger a una sola ocurrencia siguiente. Quizá un id determinista de la ocurrencia (serie + fecha) o una transacción de Firestore.
- ¿`rescheduleCount` se reinicia con cada ocurrencia? Probablemente sí.
- ¿Qué pasa con "cada mes el día 31" en meses de 30 días? Definir la regla (último día del mes).
- ¿Editar una recurrente cambia solo esta ocurrencia o toda la serie?
