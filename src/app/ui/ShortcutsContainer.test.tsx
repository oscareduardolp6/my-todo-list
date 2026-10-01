import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/render-app';

describe('ayuda de atajos', () => {
  it('se abre desde el sidebar y lista los atajos', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /Atajos de teclado/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Atajos de teclado' });
    expect(within(dialog).getByText('Buscar tareas')).toBeInTheDocument();
    expect(within(dialog).getByText('Mostrar esta ayuda')).toBeInTheDocument();
  });

  it('se abre con "?" salvo que se esté escribiendo en un campo', async () => {
    renderApp(undefined, '#/ajustes');
    const field = document.createElement('input');
    document.body.appendChild(field);
    fireEvent.keyDown(field, { key: '?' });
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.keyDown(document.body, { key: '?' });
    expect(await screen.findByRole('dialog', { name: 'Atajos de teclado' })).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
