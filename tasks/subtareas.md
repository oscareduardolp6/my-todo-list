---
status: pendiente
priority: 2
created: 2026-09-29
implemented:
plan:
---

# Subtareas

Poder dividir una tarea en pasos más pequeños (subtareas) que se marcan por separado, con el avance visible en la tarea principal.

## Problema que resuelve

Algunas tareas son en realidad una lista de pasos ("Preparar viaje": reservar hotel, comprar boletos, revisar pasaporte). Hoy solo se pueden meter como texto en la descripción, sin poder marcarlos ni ver el avance, o como tareas sueltas sin relación entre sí.

## Cómo se vería

- En el editor de una tarea, sección "Subtareas": lista con checkbox, agregar una nueva, editar y borrar.
- En las listas, la tarea principal muestra el avance ("2/5") y se pueden expandir/colapsar sus subtareas debajo.
- Marcar una subtarea la completa con el toast de **Deshacer** de siempre.
- Si completo la principal con subtareas pendientes, se pregunta o se completan también (ver dudas).
- Una subtarea hereda el proyecto de su principal; puede tener su propia prioridad y fecha agendada, pero no fecha límite propia.

## Alcance

**Dentro:**
- Un nivel de anidación (tarea → subtareas).
- Crear, editar, completar, reabrir, borrar y deshacer subtareas.
- Contador de avance en la tarea principal.
- Al mover la principal de proyecto, las subtareas se van con ella.
- Al borrar la principal, se borran sus subtareas (con un solo Deshacer que restaura todo).
- Las subtareas completadas cuentan en los reportes por día.

**Fuera (por ahora):**
- Subtareas de subtareas (más de un nivel).
- Reordenar subtareas arrastrando.
- Convertir una tarea existente en subtarea de otra (arrastrar y soltar).

## Criterios de aceptación

- [ ] Cuando agrego 3 subtareas a una tarea y completo 1, entonces la principal muestra "1/3".
- [ ] Cuando borro una tarea con subtareas, entonces desaparecen todas y **Deshacer** las restaura todas.
- [ ] Cuando muevo la principal a otro proyecto, entonces sus subtareas cambian de proyecto.
- [ ] Una subtarea con fecha agendada hoy aparece en Hoy (con referencia a su principal); una sin fecha no aparece fuera de su principal.
- [ ] Cuando completo una subtarea, entonces aparece en el reporte del día en que la completé.
- [ ] Borrar un proyecto no deja subtareas huérfanas.

## Impacto en la arquitectura

- **Dominio (`tasks`):** campo `parentId: string | null` en `Task` (modelo plano, no arreglo anidado: cada subtarea es su propio documento en `tasks/{id}`, así se sincroniza y se completa de forma independiente). Regla de un solo nivel validada en `createTask`/`patchTask`. Selectores para agrupar hijos por padre y calcular el avance.
- **Casos de uso:** nuevo `addSubtask`; `deleteTask` y `deleteProject` deben tratar a los hijos (borrado en cascada con `saveMany`/batch); mover proyecto propaga a los hijos; `restoreTask` debe poder restaurar un conjunto (padre + hijos) con un solo Deshacer.
- **Vistas / reportes (`views`, `reports`):** hoy tratan cada `Task` igual. Hay que decidir cómo se muestran los hijos en Hoy/Semana/Próximas (ver dudas) y asegurar que los reportes los cuentan.
- **Firestore:** campo nuevo; `taskFromDoc` debe tolerar documentos sin `parentId` (= `null`). Sin cambios a `firestore.rules`. El borrado en cascada no es atómico entre dispositivos: pensar en subtareas que quedan huérfanas si alguien crea una mientras otro borra la principal.
- **UI:** sección en `TaskForm`, expandir/colapsar y contador en `TaskRow`.
- **Interacción con [tareas-recurrentes.md](tareas-recurrentes.md):** una recurrente con subtareas debería regenerar los pasos (desmarcados) en cada ocurrencia. Conviene decidirlo al planear ambas.

## Dudas abiertas

- **¿Se muestran los hijos como filas independientes en Hoy/Semana o solo dentro de su principal?** Todoist muestra la subtarea suelta en Hoy si tiene fecha. Recomendación inicial: solo si tiene fecha propia, con el nombre de la principal como contexto.
- **Completar la principal con hijos pendientes:** ¿completa todos, pide confirmación, o se bloquea?
- ¿Reabrir una subtarea reabre la principal si estaba completada?
- ¿Los reportes cuentan la principal completada como una tarea más además de sus hijos, o solo las hojas?
- Límite razonable de subtareas por tarea (rendimiento del listener y del formulario).
