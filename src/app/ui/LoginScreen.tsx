import { CheckCircle2 } from 'lucide-react';

export function LoginScreen({ onSignIn, error }: { onSignIn: () => void; error: string | null }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-fg">
        <CheckCircle2 size={34} />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
        <p className="mt-1 text-sm text-muted">Tus pendientes, en todos tus dispositivos.</p>
      </div>
      <button type="button" onClick={onSignIn} className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg">
        Continuar con Google
      </button>
      {error && (
        <p role="alert" className="max-w-sm text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
