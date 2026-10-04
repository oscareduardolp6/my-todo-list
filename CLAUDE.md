# CLAUDE.md

App personal de tareas (reemplazo de Todoist), UI en español (MX). React 18 + TypeScript + Tailwind + zustand + fp-ts, PWA con vite-plugin-pwa, backend = Firebase (Auth con Google + Firestore) reutilizando el proyecto de Hilo. Sin servidor propio.

Comandos: `npm test`, `npm run typecheck`, `npm run build`. Al cambiar comportamiento, actualiza o agrega el test correspondiente.

## Arquitectura

Feature-first; dentro de cada feature, capas:

```
src/app/          composition root (dependencies.ts), run.ts, store/, auth, router, shell de UI
src/shared/       fp/ · domain/ · infrastructure/ · ui/      ← lo importa cualquiera
src/features/<f>/ domain/ · application/ · infrastructure/ · store/ · ui/{components,containers}
```

Features: `tasks`, `projects`, `views` (Hoy/Semana/Próximas, solo lectura), `reports` (solo lectura), `settings`.

Reglas:

1. **Dirección de dependencias:** `ui → store → application → domain`. Una feature puede importar el `domain/` de otra, nunca su `ui/`. `shared/` no importa nada de `features/` (los dobles en memoria viven en `src/test/`).
2. **Un caso de uso = un archivo en `application/`.** Los que escriben devuelven `ReaderTaskEither<Deps, TodoError, A>`; los de lectura (`build-views`, `build-report`) son funciones puras. Un caso de uso no ejecuta nada al invocarlo.
3. **Un solo punto de run:** las acciones de los slices de zustand (`features/<f>/store/`) son lo único que llama `runRTE`/`runRIO` (`src/app/run.ts`) y lo único que hace `match` del `Either` (`settle` en `app/store/run-outcome.ts`). Ningún componente ve una mónada ni importa `run.ts`.
4. **Funciones, no clases.** Los repositorios son records de funciones (puertos en `domain/ports.ts`) con dos implementaciones: Firestore y en memoria (`src/test/in-memory.ts`).
5. **Componentes:** `ui/components/` reciben props y devuelven JSX (sin store). `ui/containers/` leen el store y componen a los primeros. Selectores de zustand devuelven referencias estables; las listas derivadas van en `useMemo`.

## Decisiones que no son obvias

- **Fechas de calendario = `YYYY-MM-DD` local** (`DateKey`, `shared/domain/dates.ts`), no timestamps: "22 de octubre" significa lo mismo en cualquier zona. Los instantes reales (`createdAt`, `completedAt`) sí son epoch ms.
- **El día puede arrancar después de medianoche** (`settings.dayStartHour`, 0–6): "hoy" es `toDayKey(clock(), dayStartHour)`, no `toDateKey`. `store.today` y `dayNow()` ya lo aplican; `completedOn` se guarda con ese día. No uses `toDateKey(Date.now())` para decidir "hoy".
- **`scheduledFor` vs `deadline`:** reagendar cambia solo `scheduledFor` (y suma a `rescheduleCount`); `deadline` no se toca nunca. Día efectivo = `scheduledFor ?? deadline` (`effectiveDate`).
- **Reportes** se basan en `completedOn` (día local en que se marcó hecha), no en la fecha agendada.
- **Deshacer = restaurar el snapshot previo completo** (`restoreTask`), sirve para completar y para borrar. El toast se publica *antes* de esperar a Firestore (optimista): offline, las promesas de escritura no resuelven hasta reconectar y no debe bloquear el deshacer.
- **Firestore:** un documento por tarea en `todo/{uid}/tasks/{id}` (no un blob como Hilo) + caché persistente multi-pestaña (`shared/infrastructure/firebase.ts`). Los listeners reflejan las escrituras locales al instante. Las reglas (`firestore.rules`) son la unión de Hilo + esta app porque el proyecto se comparte.
- **La Bandeja de entrada es un proyecto virtual** (`INBOX`, id `inbox`): no se guarda ni se puede borrar. Borrar un proyecto reasigna sus tareas (incluidas las completadas) a la bandeja.
- **Tema:** variables CSS en `src/index.css`; `data-theme` en `<html>`. Los colores de Tailwind son `var(--x)`, así que **las utilidades con opacidad (`bg-accent/60`) no funcionan**: usa `opacity-*`.
- **`AuthGate` vive fuera del store** porque los repositorios necesitan el uid antes de que el store abra sus suscripciones.
- **Sin sesión = modo demo, no pantalla de login.** `AuthGate` le entrega a `children` las `Deps` de Firestore (con sesión) o `createDemoDeps` (repos en `localStorage`, llaves `todo.demo.*`, datos de ejemplo de `app/demo-data.ts` solo la primera vez). Cada modo monta su propio store (`key` en el `Fragment`). Los datos del demo no se migran a la cuenta. `useAuth().user` es `null` en demo: la UI que exige cuenta (captura rápida) debe comprobarlo.
- **`vitest.config.ts` es aparte de `vite.config.ts`** por un choque de tipos entre las dos copias de vite.

## Backlog de ideas (`tasks/`)

Cada idea o "todo" del proyecto es un `tasks/<slug>.md` con frontmatter (`status`, `priority`, `created`, `implemented`, `plan`) y las secciones de `tasks/_template.md`. Cuando el usuario pase una idea: crea el archivo desde la plantilla (llena todas las secciones con lo que se pueda inferir y deja como duda abierta lo que no), agrega su fila a la tabla de `tasks/README.md` ordenada por prioridad, y no la implementes a menos que lo pida. Al cambiar `status` o `priority`, actualiza la tabla. Formato completo en `tasks/README.md`.

## Tests

`src/**/*.test.{ts,tsx}`, junto al código. Dominio y consultas puras se prueban directo; los flujos de UI montan la app real con `renderApp` (`src/test/render-app.tsx`): repos en memoria, reloj fijo en `2026-09-29` e ids deterministas.
