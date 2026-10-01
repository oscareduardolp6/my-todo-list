---
status: implementada
priority: 4
created: 2026-09-30
implemented: 2026-10-01
plan:
---

# Agrupar por prioridad

Poder ver las listas de tareas agrupadas por prioridad (P1…P4) en lugar de una sola lista plana.

## Problema que resuelve

La prioridad hoy solo influye en el orden dentro de la lista, pero no hay forma de ver de un vistazo "qué es lo más urgente" separado del resto. Con muchas tareas es difícil distinguir dónde termina lo importante y empieza lo opcional.

## Cómo se vería

- Un selector de agrupación en las listas (por ejemplo "Sin agrupar" / "Por prioridad").
- Con "Por prioridad": secciones con encabezado (P1 Urgente, P2, P3, P4/Sin prioridad), cada una con su conteo y colapsable; las vacías no se muestran.
- Dentro de cada sección se conserva el orden actual (fecha, etc.).
- La elección se recuerda entre sesiones.

## Alcance

**Dentro:**
- Agrupación por prioridad en Bandeja, proyectos y vistas Hoy/Semana/Próximas.
- Secciones colapsables con conteo.
- Persistir la preferencia (ajustes del usuario / localStorage).

**Fuera (por ahora):**
- Otras agrupaciones (por proyecto, por fecha, por etiqueta).
- Mover una tarea entre secciones arrastrando para cambiar su prioridad.

## Criterios de aceptación

- [ ] Cuando activo "Por prioridad", entonces las tareas aparecen en secciones P1→P4 con su conteo.
- [ ] Cuando una sección no tiene tareas, entonces no se muestra.
- [ ] Cuando completo o cambio la prioridad de una tarea, entonces se mueve a la sección correcta sin recargar.
- [ ] Cuando recargo la app, entonces la agrupación elegida se mantiene.
- [ ] Las vistas Hoy/Semana/Próximas conservan su estructura por día y agrupan dentro de cada día (ver dudas).

## Impacto en la arquitectura

- `domain`/consulta pura: función `groupByPriority(tasks)` (junto a las de `tasks/domain/task.ts`), probada directo.
- `views/application/build-views`: decidir si agrupa ahí o en la UI.
- `settings`: nueva preferencia de agrupación (store + persistencia); sin cambios al modelo de tarea ni a `firestore.rules`.
- `ui`: componente de sección colapsable y selector de agrupación.

## Decisiones tomadas al implementar

- **Alcance reducido a lo que se pidió:** una opción en Ajustes ("Separar tareas por prioridad": No separar / Separar, apagada por defecto) que deja un **pequeño espacio** entre urgentes, altas, medias y normales. **Sin encabezados, sin conteos y sin secciones colapsables**; esas ideas del documento original quedan fuera.
- Aplica en Hoy, Semana (incluidas Atrasadas y cada día), Próximas y Pendientes de un proyecto. Las vistas ya ordenaban por prioridad; con la opción activa, **Atrasadas** también se ordena por prioridad (antes iba por fecha) y conserva el orden de antes dentro de cada prioridad.
- No aplica a Completadas de un proyecto ni a Reportes.
- Preferencia **global y sincronizada** (documento de Ajustes en Firestore), no por lista.
- Lógica pura en `tasks/domain/priority-groups.ts`; `useTaskList` expone `prioritized(...)` y `TaskRow` recibe `gapBefore`.

## Dudas abiertas (resueltas)

- En Hoy/Semana/Próximas, ¿se agrupa por prioridad dentro de cada día o se reemplaza la agrupación por día?
- ¿La preferencia es global o por lista/proyecto?
- ¿Se guarda en Firestore (sincronizada entre dispositivos) o solo local?
- ¿Las tareas completadas se agrupan también?
