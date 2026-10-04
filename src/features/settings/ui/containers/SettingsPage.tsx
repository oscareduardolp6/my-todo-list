import { Check, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../../../app/auth-context';
import { useAppStore } from '../../../../app/store-context';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { ACCENTS, DAY_START_HOURS, dayStartLabel } from '../../domain/settings';
import type { Theme } from '../../domain/settings';
import { BackupSection } from './BackupSection';
import { QuickCaptureSection } from './QuickCaptureSection';

const THEMES: { id: Theme; label: string; icon: ReactNode }[] = [
  { id: 'dark', label: 'Oscuro', icon: <Moon size={16} /> },
  { id: 'light', label: 'Claro', icon: <Sun size={16} /> },
  { id: 'system', label: 'Sistema', icon: <Monitor size={16} /> },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">{title}</h2>
      {children}
    </section>
  );
}

const segment = (active: boolean) =>
  `flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
    active ? 'border-accent bg-surface-2' : 'border-border text-muted hover:bg-surface-2'
  }`;

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const change = useAppStore((s) => s.changeSettings);
  const { user, signOut } = useAuth();

  return (
    <div>
      <PageHeader title="Ajustes" />

      <Group title="Tema">
        <div className="flex gap-2" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={settings.theme === t.id} onClick={() => change({ theme: t.id })} className={segment(settings.theme === t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Color de acento">
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color de acento">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={settings.accent === a.id}
              aria-label={a.label}
              title={a.label}
              onClick={() => change({ accent: a.id })}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: a.color }}
            >
              {settings.accent === a.id && <Check size={17} className="text-black/70" />}
            </button>
          ))}
        </div>
      </Group>

      <Group title="La semana empieza el">
        <div className="flex gap-2" role="radiogroup" aria-label="Inicio de semana">
          {([[1, 'Lunes'], [0, 'Domingo']] as const).map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={settings.weekStartsOn === value} onClick={() => change({ weekStartsOn: value })} className={segment(settings.weekStartsOn === value)}>
              {label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Separar tareas por prioridad">
        <div className="flex gap-2" role="radiogroup" aria-label="Separar tareas por prioridad">
          {([[false, 'No separar'], [true, 'Separar']] as const).map(([value, label]) => (
            <button key={label} type="button" role="radio" aria-checked={settings.separateByPriority === value} onClick={() => change({ separateByPriority: value })} className={segment(settings.separateByPriority === value)}>
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">En las listas, deja un pequeño espacio entre urgentes, altas, medias y normales.</p>
      </Group>

      <Group title="El día termina a las">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="El día termina a las">
          {DAY_START_HOURS.map((hour) => (
            <button
              key={hour}
              type="button"
              role="radio"
              aria-checked={settings.dayStartHour === hour}
              onClick={() => change({ dayStartHour: hour })}
              className={`${segment(settings.dayStartHour === hour)} flex-none`}
            >
              {hour === 0 ? 'Medianoche' : `${hour}:00 a. m.`}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">
          {settings.dayStartHour === 0
            ? 'Tiempo extra para terminar tareas de noche: el día cambia a la hora que elijas en vez de a medianoche.'
            : `Hasta las ${dayStartLabel(settings.dayStartHour)} sigue siendo “hoy” el día anterior: sus tareas no pasan a atrasadas antes y lo que completes cuenta para ese día en los reportes.`}
        </p>
      </Group>

      <Group title="Respaldo">
        <BackupSection />
      </Group>

      <Group title="Captura rápida (Raycast)">
        <QuickCaptureSection />
      </Group>

      <Group title="Cuenta">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.displayName ?? 'Sesión iniciada'}</p>
            {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
          </div>
          <button type="button" onClick={signOut} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-2">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
        <p className="mt-2 text-xs text-faint">Tus tareas se sincronizan solas entre todos los dispositivos donde inicies sesión con esta cuenta.</p>
      </Group>
    </div>
  );
}
