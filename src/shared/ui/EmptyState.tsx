import type { ReactNode } from 'react';

export type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <div className="mb-1 text-faint">{icon}</div>
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
