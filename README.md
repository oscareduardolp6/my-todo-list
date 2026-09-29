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

Es un sitio estático (`dist/`). Si lo sirves bajo un subpath (p. ej. GitHub Pages), compila con `VITE_BASE=/nombre-repo/ npm run build`. Para instalarla como PWA hace falta servirla por HTTPS.

## Arquitectura

Por capas y feature-first, con el mismo patrón que Hilo. Ver [CLAUDE.md](CLAUDE.md).
