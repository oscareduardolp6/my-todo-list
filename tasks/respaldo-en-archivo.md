---
status: implementada
priority: 5
created: 2026-09-30
implemented: 2026-10-01
plan:
---

# Respaldo de datos en archivo

Poder exportar todos mis datos (tareas y proyectos) a un archivo y, después, restaurarlos desde ese archivo.

## Problema que resuelve

Todo vive en Firestore, en un proyecto compartido con Hilo y sin servidor propio. Si un bug, una regla mal escrita o un borrado accidental daña los datos, no hay copia a la que volver. Además, exportar es la salida natural si algún día cambio de herramienta.

## Cómo se vería

- En Ajustes, sección "Respaldo": botón **Exportar** que descarga un archivo `.json` (p. ej. `todo-respaldo-2026-09-30.json`) con tareas y proyectos.
- Botón **Importar**: elige un archivo, muestra un resumen ("120 tareas, 6 proyectos") y pide confirmar antes de escribir.
- Mensajes de error claros si el archivo no es válido o es de una versión incompatible.

## Alcance

**Dentro:**
- Exportar tareas (incluidas completadas) y proyectos a JSON versionado (`version`, fecha de exportación).
- Importar validando el formato antes de escribir nada.
- Funciona en la PWA, también en móvil.

**Fuera (por ahora):**
- Respaldos automáticos o programados.
- Sincronizar el archivo con Drive u otro servicio.
- Exportar a CSV u otros formatos.
- Datos de Hilo que comparten el proyecto de Firebase.

## Criterios de aceptación

- [ ] Cuando exporto, entonces se descarga un JSON con todas mis tareas y proyectos (la Bandeja virtual no se incluye).
- [ ] Cuando importo un archivo exportado antes, entonces los datos quedan como estaban (incluyendo `scheduledFor`, `deadline`, `rescheduleCount`, `completedOn`).
- [ ] Cuando el archivo es inválido o de otra versión, entonces no se escribe nada y se muestra un error.
- [ ] Cuando importo, entonces veo un resumen y debo confirmar antes de que se escriba.
- [ ] Exportar e importar es un ciclo completo probado con repos en memoria.

## Impacto en la arquitectura

- Feature `settings` (o nueva `backup`): casos de uso `export-data` y `import-data` en `application/`; el de exportar lee ambos repos, el de importar escribe por los puertos existentes.
- `domain`: esquema del respaldo y su validación (función pura, probada directo); el formato lleva `version` para migraciones futuras.
- `infrastructure`: descarga/lectura de archivo en el navegador (Blob + `<input type=file>`), detrás de un puerto para poder usar un doble en tests.
- `store`: acciones que corren los casos de uso con `runRTE`/`settle`, como el resto.
- Sin cambios al modelo de tarea ni a `firestore.rules`.

## Decisiones tomadas al implementar

- **Importar reemplaza todo:** lo que está en la app y no en el archivo se borra; lo del archivo se escribe con sus mismos ids. Primero se escribe y luego se borra, para que un fallo a medias nunca deje sin datos del respaldo. La confirmación avisa explícitamente que es destructivo.
- **Solo tareas y proyectos:** las preferencias de Ajustes no entran. El formato lleva `app` y `version: 1` para poder ampliarlo.
- **Lectura estricta:** un archivo con cualquier irregularidad (JSON roto, otra app, versión desconocida, tarea inválida, ids repetidos) se rechaza completo sin escribir nada. Excepciones deliberadas: el proyecto `inbox` se ignora y las tareas de un proyecto que no viene en el archivo pasan a la Bandeja.
- **Sin recordatorio** de "hace tiempo que no respaldas" (idea futura).
- `saveMany` de Firestore ahora parte en lotes de 500.
- Offline: la restauración espera a Firestore como cualquier escritura; el toast "Respaldo restaurado" aparece al reconectar.
- Código: `settings/domain/backup.ts`, `settings/application/{export,import}-backup.ts`, `shared/infrastructure/download-file.ts` (inyectado como `deps.downloadFile`) y `BackupSection` en Ajustes.

## Dudas abiertas (resueltas)

- Al importar: ¿reemplazar todo, mezclar por id (los del archivo ganan) o dejar elegir?
- ¿Se conservan los ids originales? Importar con ids repetidos sobrescribe tareas existentes.
- ¿Las preferencias de Ajustes también entran en el respaldo?
- Escrituras grandes a Firestore: ¿lotes (`writeBatch`, límite de 500) y cómo se comporta offline?
- ¿Aviso periódico tipo "hace 30 días que no respaldas"?
