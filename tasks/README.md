# Tasks

Ideas y funcionalidades que queremos agregar a la app, una por archivo. No es un backlog formal con fechas: es el lugar donde se anota la idea con suficiente contexto para que después alguien (humano o Claude) pueda armar un plan de implementación a partir de ella.

## Tasks

| Task | Prioridad | Status |
| --- | --- | --- |
| [Tareas recurrentes](tareas-recurrentes.md) | 1 | Implementada |
| [Subtareas](subtareas.md) | 2 | Pendiente |
| [Gestos en las tareas](gestos.md) | 3 | Implementada |
| [Agrupar por prioridad](agrupar-por-prioridad.md) | 4 | Implementada |
| [Respaldo de datos en archivo](respaldo-en-archivo.md) | 5 | Implementada |
| [Búsqueda de tareas](busqueda.md) | 6 | Implementada |
| [Reagendar desde la vista de lista](reagendar-desde-lista.md) | 7 | Implementada |
| [Tiempo extra al final del día](tiempo-extra-fin-de-dia.md) | 8 | Implementada |

## Formato

Cada archivo `tasks/<slug-en-kebab-case>.md` lleva un frontmatter con estas propiedades:

```yaml
---
status: pendiente   # pendiente / en-progreso / implementada / descartada
priority: 1         # entero, 1 = más urgente
created: 2026-09-29 # cuándo se anotó la idea
implemented:        # fecha en que quedó implementada (vacío mientras no)
plan:               # ruta al plan de implementación, si ya existe (p. ej. agents/plans/<slug>.md)
---
```

Debajo del frontmatter, el contenido sigue la plantilla de [_template.md](_template.md): problema que resuelve, cómo se vería, alcance (dentro / fuera), criterios de aceptación, impacto en la arquitectura y dudas abiertas. Son las secciones que después se usan para escribir el plan, así que conviene llenarlas aunque sea con una línea.

## Convención

- **Nueva idea:** se crea el archivo con `status: pendiente`, se copia la plantilla y se agrega su fila a la tabla de arriba.
- **La tabla se mantiene ordenada por prioridad** (1 primero). Si cambias `status` o `priority` en un archivo, actualiza también su fila aquí.
- **Al implementarla:** `status: implementada`, llenar `implemented` y dejar en el archivo una nota de qué se decidió distinto a lo planeado, si algo cambió.
- Una idea descartada no se borra: pasa a `descartada` con una línea de por qué, para no volver a proponerla.
