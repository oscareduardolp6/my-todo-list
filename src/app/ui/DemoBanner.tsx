import { useAuth } from '../auth-context';

/** Aviso del modo demo: los datos viven solo en este navegador. Con sesión no se pinta. */
export function DemoBanner() {
  const { user, signIn, signInError } = useAuth();
  if (user) return null;

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-3 text-sm" role="note">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-w-0 flex-1 text-muted">
          <span className="font-medium text-fg">Modo demo.</span> Prueba la app libremente: tus cambios se guardan solo en este navegador.
        </p>
        <button type="button" onClick={signIn} className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg">
          Iniciar sesión con Google
        </button>
      </div>
      {signInError && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {signInError}
        </p>
      )}
    </div>
  );
}
