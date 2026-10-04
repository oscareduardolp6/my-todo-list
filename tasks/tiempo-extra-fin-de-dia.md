---
status: implementada
priority: 8
created: 2026-10-04
implemented: 2026-10-04
plan:
---

# Tiempo extra al final del día

Un ajuste para que el día no cambie a medianoche sino a una hora posterior (p. ej. 3:00 a. m.), y así poder terminar tareas de noche sin que ya cuenten como atrasadas.

## Problema que resuelve

Quien trabaja de noche ve cómo, pasadas las 12, todo lo del día pasa a "Atrasadas" y lo que completa de madrugada se registra en los reportes como del día siguiente, aunque para él sigue siendo la misma jornada.

## Cómo se vería

- Ajustes → "El día termina a las": Medianoche (por defecto), 1:00 … 6:00 a. m.
- Con 3:00 a. m. activo, entre las 0:00 y las 3:00 "hoy" sigue siendo el día anterior: sus tareas siguen en Hoy y no en Atrasadas.
- Lo que se completa en ese lapso se registra (`completedOn`) en el día anterior, así que los reportes lo muestran ahí. Los reportes avisan con una nota cuando el tiempo extra está activo.

## Alcance

**Dentro:**
- Ajuste `dayStartHour` (0–6), sincronizado en el documento de Ajustes.
- "Hoy" del store, Atrasadas, rangos de reportes, `completedOn` y avance de recurrentes usan el día ajustado.

**Fuera (por ahora):**
- Recalcular `completedOn` de tareas ya completadas al cambiar el ajuste (queda el día con que se guardaron).
- Horas distintas por día de la semana.

## Criterios de aceptación

- [x] Cuando son las 1:30 a. m. y el corte es 3:00 a. m., entonces una tarea de ayer sigue en Hoy y no en Atrasadas.
- [x] Cuando completo una tarea en ese lapso, entonces `completedOn` es el día anterior.
- [x] Cuando el ajuste está activo, entonces Reportes lo menciona.

## Impacto en la arquitectura

- `shared/domain/dates.ts`: `toDayKey(ms, dayStartHour)`.
- `settings`: campo `dayStartHour` (+ parseo en Firestore, sin cambios a `firestore.rules`).
- `ui-slice`: `dayNow()` y `today` dependen del ajuste; se recalculan al cargar/cambiar ajustes.
- `tasks`: `markCompleted`, `completeOccurrence`, `completeTask` y `skipOccurrence` reciben el día (`doneOn`) en vez de derivarlo de `now`.

## Decisiones tomadas al implementar

- El día se desplaza restando horas al instante, sin tocar `DateKey` ni el modelo de tarea.
- `completedOn` se guarda al completar, así que cambiar el ajuste después no reubica tareas ya completadas.
- Rango 0–6 h: suficiente para "terminar la noche" sin permitir días raros.
