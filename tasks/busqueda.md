---
status: implementada
priority: 6
created: 2026-09-30
implemented: 2026-10-01
plan:
---

# Búsqueda de tareas

Poder buscar tareas por texto desde cualquier parte de la app y llegar a ellas rápido.

## Problema que resuelve

Con muchas tareas repartidas entre Bandeja, proyectos y fechas, encontrar una en particular ("¿dónde anoté lo del dentista?") obliga a recorrer listas a ojo. Además, hoy no hay forma de ver tareas ya completadas sin ir a buscarlas.

## Cómo se vería

- Un ícono/campo de búsqueda en el shell (y atajo de teclado en escritorio, p. ej. `/` o `Ctrl+K`).
- Al escribir, resultados en vivo que coinciden con el título y la descripción, sin distinguir mayúsculas ni acentos.
- Cada resultado muestra título, proyecto, fecha efectiva y prioridad; se distinguen las completadas.
- Tocar un resultado abre la tarea (editor) o navega a su lista.
- Estado vacío ("Sin resultados para …") y limpiar con un botón.

## Alcance

**Dentro:**
- Búsqueda local sobre las tareas que ya están en el store (incluidas completadas), por título y descripción.
- Normalización de acentos y mayúsculas.
- Resaltar la coincidencia en el resultado.

**Fuera (por ahora):**
- Búsqueda del lado del servidor / índices de Firestore.
- Filtros avanzados (por proyecto, prioridad, fecha) y búsquedas guardadas.
- Búsqueda difusa (tolerar errores de ortografía).

## Criterios de aceptación

- [ ] Cuando escribo "dentista", entonces aparecen las tareas cuyo título o descripción lo contienen.
- [ ] Cuando busco "camion", entonces también coincide con "camión".
- [ ] Cuando hay tareas completadas que coinciden, entonces aparecen marcadas como completadas.
- [ ] Cuando no hay coincidencias, entonces veo el estado vacío.
- [ ] Cuando completo o edito una tarea desde los resultados, entonces el resultado se actualiza sin recargar.

## Impacto en la arquitectura

- Nueva función pura `search-tasks` (consulta en `application/` o `domain/` de `tasks`, como `build-views`): recibe tareas y texto, devuelve coincidencias ordenadas; probada directo.
- Sin acceso a Firestore: lee lo que ya está en el store, así que funciona offline.
- `ui`: componente de campo + lista de resultados y un container que lee el store; el texto de búsqueda es estado de UI (no va a Firestore).
- Sin cambios al modelo de datos ni a `firestore.rules`.

## Decisiones tomadas al implementar

- **Modal (hoja "Buscar"), no ruta propia.** Se abre con `/` (si no estás escribiendo en un campo), `Ctrl/Cmd+K`, el botón "Buscar" del sidebar (escritorio) o un botón flotante (móvil).
- **Orden:** primero las que coinciden en el título, luego las que solo coinciden en la descripción; dentro de cada grupo, pendientes antes que completadas y luego el orden de siempre (prioridad, fecha, antigüedad). Varias palabras = todas deben aparecer, en cualquier orden.
- **Solo tareas**, no proyectos. Muestra hasta 50 resultados con el total; con filtrado en memoria no hizo falta índice.
- Coincidencias resaltadas; las completadas se marcan. Tocar un resultado (o Enter, que abre el primero) abre la tarea en el editor.
- Lógica pura en `tasks/domain/search.ts`; el estado abierto/cerrado vive en el slice de UI, el texto de búsqueda en el componente.

## Dudas abiertas (resueltas)

- ¿Pantalla/ruta propia o paleta tipo modal (`Ctrl+K`)?
- ¿Orden de resultados: relevancia (título antes que descripción), fecha o pendientes primero?
- ¿Incluir también proyectos en los resultados?
- ¿Con miles de tareas hace falta índice o basta el filtrado en memoria?
