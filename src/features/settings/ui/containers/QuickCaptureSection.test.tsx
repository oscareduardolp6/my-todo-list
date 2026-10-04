import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../test/render-app';

describe('captura rápida desde Raycast', () => {
  it('copia la conexión de la sesión al portapapeles', async () => {
    const user = userEvent.setup();
    const { clipboard } = renderApp(undefined, '#/ajustes');

    await user.click(await screen.findByRole('button', { name: /Copiar conexión/ }));

    await waitFor(() => expect(clipboard).toHaveLength(1));
    expect(JSON.parse(clipboard[0] as string)).toEqual({ apiKey: 'test-key', projectId: 'test-project', refreshToken: 'test-refresh' });
    expect(await screen.findByText('Conexión copiada')).toBeInTheDocument();
  });
});
