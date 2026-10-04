import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthUser } from '../shared/domain/ports';
import { makeTask } from '../test/factories';
import { TEST_TODAY, createTestDeps } from '../test/render-app';
import { App } from './App';
import type { Deps } from './dependencies';

const USER: AuthUser = { uid: 'u1', email: 'yo@example.com', displayName: 'Yo' };

/** Dos mundos: `account` (los de Firestore, aquí en memoria) y `demo` (los locales). */
const setup = () => {
  const account = createTestDeps({ tasks: [makeTask({ id: 'a', title: 'Tarea de mi cuenta', scheduledFor: TEST_TODAY })] });
  const demo = createTestDeps({ tasks: [makeTask({ id: 'd', title: 'Tarea del demo', scheduledFor: TEST_TODAY })] });
  let emit: (user: AuthUser | null) => void = () => undefined;
  const signInWithGoogle = vi.fn(async () => undefined);
  const deps: Deps = {
    ...account.deps,
    authGateway: {
      ...account.deps.authGateway,
      signInWithGoogle,
      onAuthStateChanged: (cb) => {
        emit = cb;
        cb(null);
        return () => undefined;
      },
    },
  };
  return { deps, demoDeps: demo.deps, signInWithGoogle, emit: (u: AuthUser | null) => act(() => emit(u)), account, demo };
};

describe('AuthGate: modo demo', () => {
  beforeEach(() => {
    window.location.hash = '#/hoy';
  });

  it('sin sesión abre la app con los datos del demo, sin pantalla de login', async () => {
    const { deps, demoDeps } = setup();
    render(<App deps={deps} demoDeps={demoDeps} />);

    expect(await screen.findByText('Tarea del demo')).toBeInTheDocument();
    expect(screen.queryByText('Tarea de mi cuenta')).not.toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent('Modo demo');
  });

  it('lo que se crea en el demo va al repositorio del demo, no al de la cuenta', async () => {
    const user = userEvent.setup();
    const { deps, demoDeps, account, demo } = setup();
    render(<App deps={deps} demoDeps={demoDeps} />);

    await user.click((await screen.findAllByRole('button', { name: /Añadir tarea/ }))[0] as HTMLElement);
    const form = within(await screen.findByRole('dialog', { name: 'Nueva tarea' }));
    await user.type(form.getByLabelText('Título'), 'Algo nuevo');
    await user.click(form.getByRole('button', { name: 'Añadir tarea' }));

    await waitFor(() => expect(demo.taskRepository.snapshot().map((t) => t.title)).toContain('Algo nuevo'));
    expect(account.taskRepository.snapshot().map((t) => t.title)).not.toContain('Algo nuevo');
  });

  it('con sesión no hay banner y se ven los datos de la cuenta; al cerrar sesión vuelve el demo', async () => {
    const { deps, demoDeps, emit } = setup();
    render(<App deps={deps} demoDeps={demoDeps} />);
    await screen.findByText('Tarea del demo');

    emit(USER);
    expect(await screen.findByText('Tarea de mi cuenta')).toBeInTheDocument();
    expect(screen.queryByText('Tarea del demo')).not.toBeInTheDocument();
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    emit(null);
    expect(await screen.findByText('Tarea del demo')).toBeInTheDocument();
  });

  it('el banner inicia sesión con Google', async () => {
    const user = userEvent.setup();
    const { deps, demoDeps, signInWithGoogle } = setup();
    render(<App deps={deps} demoDeps={demoDeps} />);

    await user.click(await screen.findByRole('button', { name: 'Iniciar sesión con Google' }));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('Ajustes en demo: ofrece iniciar sesión y no muestra la captura rápida', async () => {
    window.location.hash = '#/ajustes';
    const { deps, demoDeps, emit } = setup();
    render(<App deps={deps} demoDeps={demoDeps} />);

    expect(await screen.findByText('Sin cuenta')).toBeInTheDocument();
    expect(screen.queryByText('Captura rápida (Raycast)')).not.toBeInTheDocument();

    emit(USER);
    expect(await screen.findByText('Captura rápida (Raycast)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar sesión/ })).toBeInTheDocument();
  });
});
