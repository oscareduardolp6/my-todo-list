import type { ReactNode } from 'react';

export type TaskSectionProps = {
  title: string;
  count?: number;
  tone?: 'default' | 'danger';
  /** Acción a la derecha del encabezado (p. ej. "Reagendar"). */
  action?: ReactNode;
  children: ReactNode;
};

export function TaskSection({ title, count, tone = 'default', action, children }: TaskSectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-1 flex items-center justify-between border-b border-border pb-1.5">
        <h2 className={`text-sm font-semibold ${tone === 'danger' ? 'text-danger' : ''}`}>
          {title}
          {count !== undefined && <span className="ml-2 font-normal text-faint">{count}</span>}
        </h2>
        {action}
      </div>
      <ul>{children}</ul>
    </section>
  );
}
