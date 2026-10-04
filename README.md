# Tareas

App personal de tareas para reemplazar Todoist. PWA (instalable, funciona sin conexión), tema oscuro por defecto y sincronización entre dispositivos con Firebase.

## Qué hace

- **Tareas** con título, descripción, prioridad (Urgente / Alta / Media / Normal) y proyecto.
- **Dos fechas distintas, ambas opcionales:**
  - *Agendada*: cuándo pienso hacerla. Se puede mover las veces que haga falta (la tarea cuenta cuántas veces se reagendó).
  - *Límite*: cuándo debe estar hecha. Reagendar **nunca** la mueve. Ej.: límite 22 de octubre, agendada el 3; si el 3 no la haces, la pasas al 10 y el 22 sigue registrado y visible.
- **Al completar** una tarea sale un toast con **Deshacer** (igual al borrar). Funciona también sin conexión.
- **Vistas:** Hoy (con atrasadas), Semana (navegable, respeta lunes/domingo), Próximas, Proyectos (con la Bandeja de entrada siempre disponible).
- **Reportes:** qué tareas resolviste qué día (7 días / 30 días / mes / rango libre), barras por día, promedio, desglose por proyecto y cuántas con fecha límite se cumplieron a tiempo.
- **Ajustes:** tema (oscuro por defecto / claro / sistema), color de acento, inicio de semana.
- **Sincronización** en tiempo real entre dispositivos (Firestore + login con Google) con caché offline.

Una tarea "toca" el día de su fecha agendada; si no tiene, el de su fecha límite.

## Puesta en marcha

Requiere Node 20+.

```bash
npm install
cp .env.example .env.local   # y pega la config de Firebase (ver abajo)
npm run dev
```

### Firebase (mismo proyecto que Hilo)

1. Copia a `.env.local` los mismos valores `VITE_FIREBASE_*` de Hilo (Consola de Firebase → Configuración del proyecto → Tus apps). No son secretos.
2. **Dominios autorizados:** Authentication → Settings → Authorized domains. `localhost` ya viene; agrega el dominio donde publiques esta app.
3. **Reglas de Firestore:** publica [firestore.rules](firestore.rules). Ojo: las reglas son **una sola** por proyecto, así que ese archivo es la unión de Hilo + esta app (el bloque de Hilo va sin cambios). Publicar solo las reglas de Hilo dejaría a esta app sin acceso.
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Los datos viven aparte de los de Hilo, en `todo/{uid}/tasks`, `todo/{uid}/projects` y `todo/{uid}/meta/settings`.

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Tests (Vitest + Testing Library) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Typecheck + build de producción con service worker |
| `npm run icons` | Regenera los íconos de la PWA (`public/icons/`) |

### Publicar

Cada push a `main` corre tests, compila y despliega a GitHub Pages ([workflow](.github/workflows/deploy-pages.yml)): https://oscarlp6.dev/my-todo-list/

- La config de Firebase sale de los secretos `VITE_FIREBASE_*` del repo.
- El build usa `VITE_BASE=/<nombre-del-repo>/`; en local la base es `/`.
- `oscarlp6.dev` ya está en los dominios autorizados de Firebase Auth (por Hilo), así que el login con Google funciona.

### Captura rápida desde Raycast

Los comandos viven en `C:\Users\oscar\dev\raycast-scripts` (`tarea-nueva.ps1`, `tarea-configurar.ps1`, carpeta `tareas/`). Escriben en Firestore por REST con **tu** sesión (refresh token), no con credenciales de admin, así que las reglas siguen aplicando.

1. En la app: Ajustes → *Captura rápida (Raycast)* → **Copiar conexión**.
2. En Raycast: **Configurar Tareas** (guarda la conexión en `~/.config/my-todo-list/raycast.json`).
3. **Nueva Tarea**: `Comprar leche mañana p1 #casa !viernes` → `p1`–`p4` prioridad, `#proyecto`, fecha suelta = agendada, `!fecha` = límite (hoy, mañana, pasado mañana, lunes…domingo, `22/10`, `2026-10-22`).

La conexión es un secreto: si se filtra, revoca los tokens del usuario en Firebase y repite los pasos 1 y 2.

### Instalar en el teléfono

Abre https://oscarlp6.dev/my-todo-list/ en Chrome (Android) y elige *Instalar app* / *Agregar a pantalla de principal*; en iPhone, Safari → Compartir → *Agregar a pantalla de inicio*. Después de la primera visita abre sin conexión.

## Arquitectura

Por capas y feature-first, con el mismo patrón que Hilo. Ver [CLAUDE.md](CLAUDE.md).
