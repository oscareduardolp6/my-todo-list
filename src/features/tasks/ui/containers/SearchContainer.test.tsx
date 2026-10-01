import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../../test/factories';
import { TEST_TODAY, renderApp } from '../../../../test/render-app';

const seed = {
  tasks: [
    makeTask({ id: 'a', title: 'Llamar al dentista', description: 'Pedir cita', scheduledFor: TEST_TODAY }),
    makeTask({ id: 'b', title: 'Camión de mudanza' }),
    makeTask({ id: 'c', title: 'Camión viejo', completedAt: 5, completedOn: '2026-09-01' }),
  ],
};

describe('búsqueda de tareas', () => {
  it('se abre desde el botón, encuentra sin importar acentos y marca las completadas', async () => {
    const user = userEvent.setup();
    renderApp(seed);

    await user.click(screen.getAllByRole('button', { name: /Buscar/ })[0] as HTMLElement);
    const dialog = await screen.findByRole('dialog', { name: 'Buscar' });
    await user.type(within(dialog).getByRole('searchbox', { name: 'Buscar tareas' }), 'CAMION');

    expect(within(dialog).getByRole('status')).toHaveTextContent('2 resultados');
    expect(within(dialog).getByText('Completada')).toBeInTheDocument();
    expect(within(dialog).queryByText(/dentista/)).toBeNull();
  });

  it('se abre con "/" y con Ctrl+K, y no con "/" mientras se escribe en un campo', async () => {
    renderApp(seed);
    fireEvent.keyDown(document.body, { key: '/' });
    expect(await screen.findByRole('dialog', { name: 'Buscar' })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(await screen.findByRole('dialog', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay coincidencias', async () => {
    const user = userEvent.setup();
    renderApp(seed);
    fireEvent.keyDown(document.body, { key: '/' });
    await user.type(await screen.findByRole('searchbox', { name: 'Buscar tareas' }), 'zzz');
    expect(screen.getByText('Sin resultados para «zzz»')).toBeInTheDocument();
  });

  it('tocar un resultado abre la tarea en el editor', async () => {
    const user = userEvent.setup();
    renderApp(seed);
    fireEvent.keyDown(document.body, { key: '/' });
    await user.type(await screen.findByRole('searchbox', { name: 'Buscar tareas' }), 'cita');
    await user.click(within(await screen.findByRole('dialog', { name: 'Buscar' })).getByRole('button', { name: /Llamar al dentista/ }));

    const editor = await screen.findByRole('dialog', { name: 'Editar tarea' });
    expect(within(editor).getByDisplayValue('Llamar al dentista')).toBeInTheDocument();
  });

  it('Enter abre el primer resultado', async () => {
    const user = userEvent.setup();
    renderApp(seed);
    fireEvent.keyDown(document.body, { key: '/' });
    await user.type(await screen.findByRole('searchbox', { name: 'Buscar tareas' }), 'mudanza{Enter}');
    expect(await screen.findByDisplayValue('Camión de mudanza')).toBeInTheDocument();
  });
});
