import { CalendarDays } from 'lucide-react';
import { formatShort } from '../../../../shared/domain/dates';
import type { DateKey } from '../../../../shared/domain/dates';
import type { QuickDate } from '../../domain/quick-dates';

export type ReschedulePickerProps = {
  title: string;
  current: DateKey | null;
  today: DateKey;
  options: readonly QuickDate[];
  onPick: (date: DateKey | null) => void;
};

/** Opciones rápidas de fecha + selector de calendario. Elegir una llama `onPick` al instante. */
export function ReschedulePicker({ title, current, today, options, onPick }: ReschedulePickerProps) {
  return (
    <div>
      <p className="mb-3 truncate text-sm text-muted">{title}</p>
      <ul className="mb-3 divide-y divide-border rounded-xl border border-border">
        {options.map((o) => (
          <li key={o.label}>
            <button
              type="button"
              onClick={() => onPick(o.value)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-surface-2 ${o.value === current ? 'text-accent' : ''}`}
            >
              {o.label}
              <span className="text-xs text-faint">{o.value ? formatShort(o.value, today) : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="relative">
        <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          type="date"
          value={current ?? ''}
          onChange={(e) => e.target.value && onPick(e.target.value)}
          aria-label="Elegir otra fecha"
          className="w-full rounded-lg border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-sm"
        />
      </div>
    </div>
  );
}
