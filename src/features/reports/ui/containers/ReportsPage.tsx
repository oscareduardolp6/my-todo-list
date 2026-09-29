import { useMemo, useState } from 'react';
import { BarChart3, Flag } from 'lucide-react';
import { useAppStore } from '../../../../app/store-context';
import { formatDayHeading, formatShort } from '../../../../shared/domain/dates';
import type { DateKey } from '../../../../shared/domain/dates';
import { EmptyState } from '../../../../shared/ui/EmptyState';
import { PageHeader } from '../../../../shared/ui/PageHeader';
import { withInbox } from '../../../projects/domain/project';
import type { Project } from '../../../projects/domain/project';
import { TaskRow } from '../../../tasks/ui/components/TaskRow';
import { buildCompletionReport, rangeFor } from '../../application/build-report';
import type { DateRange, ReportPreset } from '../../application/build-report';
import { DayBars } from '../components/DayBars';

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'month', label: 'Este mes' },
  { id: 'custom', label: 'Rango' },
];

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function ReportsPage() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const today = useAppStore((s) => s.today);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const openTaskEditor = useAppStore((s) => s.openTaskEditor);

  const [preset, setPreset] = useState<ReportPreset>('7d');
  const [custom, setCustom] = useState<DateRange>({ from: rangeFor('30d', today).from, to: today });
  const [selected, setSelected] = useState<DateKey | null>(null);

  const range = preset === 'custom' ? custom : rangeFor(preset, today);
  const report = useMemo(() => buildCompletionReport(tasks, range), [tasks, range.from, range.to]); // eslint-disable-line react-hooks/exhaustive-deps
  const projectsById = useMemo(() => new Map<string, Project>(withInbox(projects).map((p) => [p.id, p])), [projects]);

  const visibleDays = (selected ? report.days.filter((d) => d.date === selected) : report.days.filter((d) => d.tasks.length))
    .slice()
    .reverse();

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Qué resolviste y cuándo" />

      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Periodo">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={preset === p.id}
            onClick={() => {
              setPreset(p.id);
              setSelected(null);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${
              preset === p.id ? 'border-accent bg-accent text-accent-fg' : 'border-border text-muted hover:bg-surface-2'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            aria-label="Desde"
            value={custom.from}
            max={custom.to}
            onChange={(e) => e.target.value && setCustom((c) => ({ ...c, from: e.target.value }))}
            className="rounded-lg border border-border bg-bg px-3 py-2"
          />
          <span className="text-faint">a</span>
          <input
            type="date"
            aria-label="Hasta"
            value={custom.to}
            min={custom.from}
            onChange={(e) => e.target.value && setCustom((c) => ({ ...c, to: e.target.value }))}
            className="rounded-lg border border-border bg-bg px-3 py-2"
          />
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Completadas" value={String(report.total)} hint={`${formatShort(report.range.from, today)} – ${formatShort(report.range.to, today)}`} />
        <Stat label="Promedio por día" value={report.averagePerDay.toFixed(1)} hint={`${report.activeDays} días con actividad`} />
        <Stat
          label="Fecha límite cumplida"
          value={report.withDeadline ? `${report.onTime}/${report.withDeadline}` : '—'}
          hint={report.withDeadline ? 'de las que tenían límite' : 'ninguna tenía límite'}
        />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <DayBars days={report.days} today={today} selected={selected} onSelect={(d) => setSelected((s) => (s === d ? null : d))} />
      </div>

      {report.byProject.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {report.byProject.map(({ projectId, count }) => {
            const p = projectsById.get(projectId);
            return (
              <span key={projectId} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p?.color ?? '#8b93a3' }} />
                {p?.name ?? 'Proyecto eliminado'} · {count}
              </span>
            );
          })}
        </div>
      )}

      {selected && (
        <button type="button" onClick={() => setSelected(null)} className="mb-3 text-sm text-accent">
          Ver todos los días
        </button>
      )}

      {!report.total ? (
        <EmptyState icon={<BarChart3 size={40} />} title="Sin tareas completadas" hint="Cuando completes tareas en este periodo, aparecerán aquí agrupadas por día." />
      ) : (
        visibleDays.map((day) => (
          <section key={day.date} className="mb-5">
            <div className="mb-1 flex items-center justify-between border-b border-border pb-1.5">
              <h2 className="text-sm font-semibold">{formatDayHeading(day.date, today)}</h2>
              <span className="text-xs text-faint">{day.tasks.length}</span>
            </div>
            <ul>
              {day.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  today={today}
                  project={projectsById.get(t.projectId)}
                  hideScheduled
                  onToggle={() => toggleTask(t)}
                  onOpen={() => openTaskEditor({ mode: 'edit', taskId: t.id })}
                />
              ))}
            </ul>
          </section>
        ))
      )}
      {report.withDeadline > 0 && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-faint">
          <Flag size={12} /> Una tarea cuenta como “a tiempo” si se completó en o antes de su fecha límite.
        </p>
      )}
    </div>
  );
}
