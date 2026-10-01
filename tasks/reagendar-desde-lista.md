---
status: implementada
priority: 7
created: 2026-10-01
implemented: 2026-10-01
plan:
---

# Reagendar desde la vista de lista

Poder reagendar una tarea directamente desde la fila en la lista, con accesos rápidos, sin abrir el editor.

## Problema que resuelve

Reagendar es una acción muy frecuente (lo que no se hizo hoy se pasa a mañana, a la semana que entra, etc.), pero hoy implica abrir la tarea, cambiar la fecha y guardar. Eso es demasiado fricción para algo que se repite varias veces al día.

## Cómo se vería

- En cada fila de tarea, un botón/ícono de calendario (visible al pasar el cursor en escritorio y siempre visible en móvil) que abre un menú rápido de reagendado:
  - Hoy · Mañana · Este fin de semana · Próxima semana · Sin fecha
  - Elegir fecha… (selector de calendario)
- Al elegir, la tarea se mueve a su nueva posición/lista al instante, con toast de **Deshacer** (restaurando el snapshot previo).
- Reagendar cambia solo `scheduledFor` y suma a `rescheduleCount`; `deadline` no se toca nunca.
- Funciona en Bandeja, proyectos y Hoy/Semana/Próximas.

## Alcance

**Dentro:**
- Menú de accesos rápidos de fecha desde la fila de tarea.
- Reutilizar el caso de uso de reagendado existente y el mecanismo de deshacer.
- Opción para quitar la fecha agendada.

**Fuera (por ahora):**
- Reagendado masivo de varias tareas a la vez.
- Gesto de deslizar para reagendar (ver [gestos](gestos.md)).
- Sugerencias inteligentes de fecha.

## Criterios de aceptación

- [ ] Cuando elijo "Mañana" en una tarea de la lista, entonces su `scheduledFor` pasa a mañana y su `rescheduleCount` aumenta en 1.
- [ ] Cuando reagendo, entonces el `deadline` de la tarea no cambia.
- [ ] Cuando reagendo, entonces aparece el toast de Deshacer y al usarlo la tarea vuelve exactamente a como estaba.
- [ ] Cuando elijo "Elegir fecha…", entonces puedo seleccionar cualquier día en un calendario.
- [ ] Cuando la tarea cambia de día, entonces desaparece o se mueve en la vista actual sin recargar.
- [ ] Se puede usar con teclado y tiene etiquetas accesibles.

## Impacto en la arquitectura

- Casi todo `ui`: componente de menú de reagendado en `tasks/ui/components` (recibe props) y conexión en los containers de lista.
- Sin caso de uso nuevo si el reagendado actual ya cubre cambiar solo `scheduledFor`; confirmar que cubre "quitar fecha". Cálculo de fechas rápidas (mañana, próximo lunes…) como función pura en `shared/domain/dates.ts`, probada directo, usando `DateKey`.
- Sin cambios al modelo de datos ni a `firestore.rules`.

## Decisiones tomadas al implementar

- **Icono de calendario en la fila, solo en escritorio** (`lg`): aparece al pasar el cursor o al enfocarlo con teclado. En móvil no se muestra porque ya existe el gesto de deslizar a la izquierda.
- Abre la misma hoja "Reagendar" que el gesto (Hoy / Mañana / Fin de semana / Próx. semana / Sin fecha + calendario), con el mismo toast de **Deshacer**; cambia solo `scheduledFor` y no toca `deadline`.
- "Sin fecha" cuenta como reagendar (suma a `rescheduleCount`, regla existente de `patchTask`); no se ofrece en recurrentes. Las tareas completadas no muestran el icono.
- Menú propio reutilizado del gesto (`ReschedulePicker`), no un popover anclado a la fila.

## Dudas abiertas

- ¿Qué fechas rápidas se ofrecen exactamente y cuál es el inicio de la semana (lunes)?
- ¿"Sin fecha" cuenta como reagendar (suma a `rescheduleCount`)?
- ¿Menú propio o popover reutilizable que también sirva para el editor?
- ¿Se quiere el mismo acceso en las vistas Hoy/Semana/Próximas, cuya estructura depende de la fecha?
