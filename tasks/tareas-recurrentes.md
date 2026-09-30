---
status: implementada
priority: 1
created: 2026-09-29
implemented: 2026-09-29
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

- [x] Cuando completo una tarea "cada lunes" agendada para el lunes 5, entonces aparece agendada para el lunes 12 y la del 5 queda en el reporte del día en que la completé.
- [x] Cuando completo una tarea "3 días después de completar" un jueves, entonces la siguiente queda para el domingo, sin importar la fecha agendada original.
- [x] Cuando completo una recurrente con la fecha atrasada (agendada hace 2 semanas), entonces la siguiente es la próxima fecha **futura** de la serie, no una también atrasada.
- [x] Cuando doy Deshacer al completarla, entonces la tarea vuelve a su fecha original y desaparece la siguiente ocurrencia (sin duplicados).
- [x] Si la recurrente tiene fecha límite, la siguiente conserva la misma distancia entre agendada y límite.
- [x] Completar la misma recurrente desde dos dispositivos casi a la vez no deja ocurrencias duplicadas.

## Impacto en la arquitectura

- **Dominio (`tasks`):** nuevo tipo `Recurrence` en `Task` (nullable) y función pura `nextOccurrence(recurrence, scheduledFor, completedOn)`. Sigue usando `DateKey`: nada de horas ni zonas.
- **Casos de uso:** `completeTask` se bifurca (una recurrente no queda "completada" en la lista); nuevo caso de uso para terminar la serie. `restoreTask` (el Deshacer) hoy restaura un solo documento: tendrá que restaurar también la ocurrencia generada, probablemente guardando su id en el snapshot del toast.
- **Historial / reportes:** los reportes se basan en `completedOn` de tareas. Si la recurrente solo "avanza su fecha", se pierde el historial. Dos caminos (ver dudas): (a) al completar se escribe un documento-copia ya completado y la tarea original avanza, o (b) un log de completados aparte. El reporte no debería enterarse de la diferencia.
- **Firestore:** campo nuevo en `tasks/{id}`; `taskFromDoc` debe tolerar documentos sin él. Sin cambios a `firestore.rules`.
- **UI:** selector de repetición en `TaskForm`, ícono en `TaskRow`, ajuste del texto del toast.

## Decisiones tomadas

- **La misma tarea avanza** y cada ocurrencia cerrada se archiva como copia ya completada (sin recurrencia) con id determinista `<idSerie>_<fechaAgendada>`. Se escriben juntas con `saveMany`. Los reportes no cambian: leen `completedOn`.
- **Concurrencia:** dos dispositivos que completan la misma ocurrencia escriben el mismo documento-copia y calculan la misma siguiente fecha, así que convergen (no hay test con dos clientes reales).
- **Deshacer** restaura el snapshot de la tarea y borra la copia de esa ocurrencia (`restoreTask(snapshot, alsoRemove)`).
- **`rescheduleCount` se reinicia** en cada ocurrencia.
- **Día 31 en meses cortos:** cae en el último día del mes, calculado siempre desde la fecha ancla (31 ene → 28 feb → 31 mar).
- **Editar cambia toda la serie** (es un solo documento). "Omitir esta vez" salta la ocurrencia actual sin borrar la serie; "Eliminar" borra la serie completa; poner "No se repite" la termina conservando la tarea.
