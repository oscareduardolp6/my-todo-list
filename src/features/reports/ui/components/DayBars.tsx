import { formatShort, weekdayOf } from '../../../../shared/domain/dates';
import type { DateKey } from '../../../../shared/domain/dates';
import type { ReportDay } from '../../application/build-report';

export type DayBarsProps = {
  days: readonly ReportDay[];
  today: DateKey;
  selected: DateKey | null;
  onSelect: (date: DateKey) => void;
};

const WEEKDAY_INITIAL = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Gráfica de barras por día en CSS puro. Cada barra es un botón: tocarla filtra el detalle. */
export function DayBars({ days, today, selected, onSelect }: DayBarsProps) {
  const max = Math.max(1, ...days.map((d) => d.tasks.length));
  const dense = days.length > 14;

  return (
    <div className="flex h-36 items-end gap-[3px]" role="group" aria-label="Tareas completadas por día">
      {days.map((day) => {
        const count = day.tasks.length;
        const active = selected === day.date;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            aria-pressed={active}
            aria-label={`${formatShort(day.date, today)}: ${count} ${count === 1 ? 'tarea' : 'tareas'}`}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            {!dense && <span className="text-[10px] text-muted">{count || ''}</span>}
            <span className="flex min-h-0 w-full flex-1 items-end">
              <span
                className={`w-full rounded-t-sm transition-colors ${
                  active ? 'bg-accent' : count ? 'bg-accent opacity-60 group-hover:opacity-100' : 'bg-surface-2'
                }`}
                style={{ height: `${count ? Math.max(6, (count / max) * 100) : 3}%`, minHeight: count ? 6 : 3 }}
              />
            </span>
            {!dense && <span className="text-[10px] text-faint">{WEEKDAY_INITIAL[weekdayOf(day.date)]}</span>}
          </button>
        );
      })}
    </div>
  );
}
