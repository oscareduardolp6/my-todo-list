---
status: pendiente
priority: 3
created: 2026-09-30
implemented:
plan:
---

# Gestos en las tareas

Poder hacer las acciones más comunes sobre una tarea con gestos táctiles (deslizar), sin abrir el editor ni buscar botones.

## Problema que resuelve

En el celular (la app es PWA) completar o reagendar una tarea obliga a apuntar a un checkbox pequeño o abrir el editor. Las acciones frecuentes deberían estar a un dedo de distancia, como en Todoist.

## Cómo se vería

- Deslizar una tarea a la derecha: completarla (con el toast de **Deshacer** de siempre).
- Deslizar a la izquierda: revela acciones rápidas (reagendar a mañana / elegir fecha, borrar).
- Mientras se desliza, el fondo muestra el color e ícono de la acción y al soltar pasado el umbral se ejecuta; si no llega al umbral, la tarea regresa a su lugar.
- En escritorio el comportamiento actual no cambia (los gestos son solo táctiles).

## Alcance

**Dentro:**
- Deslizar horizontal sobre las filas de tarea en las listas (Bandeja, proyectos, Hoy/Semana/Próximas).
- Acciones: completar, reagendar, borrar, reutilizando los casos de uso existentes (`restoreTask` para deshacer).
- Que el gesto no choque con el scroll vertical ni con el gesto de "atrás" del navegador.

**Fuera (por ahora):**
- Reordenar tareas arrastrando.
- Gestos de navegación entre vistas (deslizar entre Hoy/Semana).
- Pull-to-refresh.

## Criterios de aceptación

- [ ] Cuando deslizo una tarea a la derecha pasado el umbral, entonces se completa y aparece el toast de Deshacer.
- [ ] Cuando deslizo a la izquierda, entonces veo las acciones de reagendar y borrar.
- [ ] Cuando suelto antes del umbral, entonces la tarea vuelve a su posición sin ejecutar nada.
- [ ] Cuando hago scroll vertical sobre una tarea, entonces no se dispara ningún gesto.
- [ ] Las acciones por gesto tienen alternativa accesible (teclado / botones) y no rompen los flujos actuales.

## Impacto en la arquitectura

- Solo `ui`: un componente (p. ej. `shared/ui/swipeable`) que maneja pointer events y recibe callbacks por props; los containers de `tasks`/`views` lo conectan a las acciones del store existentes. Sin casos de uso ni modelo nuevos.
- Tests de UI con `renderApp` simulando pointer events; la lógica del umbral/dirección conviene extraerla como función pura y probarla directo.

## Dudas abiertas

- ¿Librería (p. ej. `@use-gesture/react`) o implementación propia con pointer events? Recomendación inicial: propia, para no sumar dependencia.
- ¿Qué hace exactamente el deslizar a la izquierda: acciones reveladas o ejecutar "reagendar a mañana" directo?
- ¿Borrar por gesto necesita confirmación o basta el Deshacer?
- ¿Se quieren también gestos en Hoy/Semana/Próximas, que son de solo lectura en cuanto a estructura pero sí permiten completar?
