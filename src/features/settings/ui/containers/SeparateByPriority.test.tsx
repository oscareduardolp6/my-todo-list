import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../../test/factories';
import { TEST_TODAY, renderApp } from '../../../../test/render-app';

const rowOf = (title: string) => screen.getByText(title).closest('li') as HTMLElement;
const hasGap = (title: string) => rowOf(title).className.includes('mt-5');
const titles = () => screen.getAllByRole('checkbox').map((c) => c.getAttribute('aria-label') ?? '');

describe('separar tareas por prioridad', () => {
  const tasks = [
    makeTask({ id: 'n', title: 'Normal', priority: 4, scheduledFor: TEST_TODAY, createdAt: 1 }),
    makeTask({ id: 'u', title: 'Urgente', priority: 1, scheduledFor: TEST_TODAY, createdAt: 2 }),
    makeTask({ id: 'u2', title: 'Urgente dos', priority: 1, scheduledFor: TEST_TODAY, createdAt: 3 }),
    makeTask({ id: 'a', title: 'Alta', priority: 2, scheduledFor: TEST_TODAY, createdAt: 4 }),
  ];

  it('por defecto no hay espacios; al activar el ajuste aparece uno en cada cambio de prioridad', async () => {
    const user = userEvent.setup();
    const { settingsRepository } = renderApp({ tasks });

    await screen.findByText('Urgente');
    expect(['Urgente', 'Urgente dos', 'Alta', 'Normal'].some(hasGap)).toBe(false);

    await user.click(screen.getAllByRole('button', { name: 'Ajustes' })[0] as HTMLElement);
    await user.click(await screen.findByRole('radio', { name: 'Separar' }));
    await waitFor(() => expect(settingsRepository.current().separateByPriority).toBe(true));
    await user.click(screen.getAllByRole('button', { name: /^Hoy/ })[0] as HTMLElement);

    await screen.findByText('Urgente');
    expect(titles().map((t) => t.replace(/^Completar: | \(prioridad.*$/g, ''))).toEqual(['Urgente', 'Urgente dos', 'Alta', 'Normal']);
    expect(hasGap('Urgente')).toBe(false);
    expect(hasGap('Urgente dos')).toBe(false);
    expect(hasGap('Alta')).toBe(true);
    expect(hasGap('Normal')).toBe(true);
  });
});
